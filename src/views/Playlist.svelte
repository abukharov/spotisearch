<script>
    import {
        Table,
        Collapse,
        Spinner,
        Card,
        CardHeader,
        CardBody,
        FormGroup,
        Button,
        Icon,
        Row,
        Col
    } from '@sveltestrap/sveltestrap';
    import spotify, { backoff, throttled } from '../lib/spotify';
    import { onMount } from 'svelte';
    import process from 'process';

    export let playlist;
    export let searchString;
    export let onlyNonPlayable;
    export const getVisibleTracks = () => visibleTracks;

    const nullTrack = {
        name: '',
        album: {
            name: ''
        },
        artists: [
            {
                name: ''
            }
        ],
        external_ids: {
            isrc: ''
        },
        external_urls: {
            spotify: ''
        },
        preview_url: null
    };

    let tracks = [];
    let tracksLoading = false;
    $: tracksNum = tracks.length;

    $: visibleTracks = filterTracks(tracks, searchString, onlyNonPlayable);
    $: isMatch = weHaveAMatch(visibleTracks);

    let clickOpen = false;
    let trVisible = false;
    $: isOpen = clickOpen || isMatch;
    $: isTrVisible = trVisible;



    function markupMatch(prop, s, match) {
        if (!prop) {
            return '';
        }
        if (match === -1) {
            return prop;
        }
        const markupProp = `${prop.slice(0, match)}<span class="highlighted">${s}</span>${prop.slice(match + s.length)}`;
        return markupProp;
    }

    function filterTracks(t, s, o) {
        const r = t.map(function (track) {
            if (!track.track) {
                track.track = nullTrack;
            }
            track.nameMatch = -1;
            track.albumMatch = -1;
            track.artistMatch = -1;
            track.isrcMatch = -1;
            track.linkMatch = -1;
            track.isPlayable = track.track.preview_url !== null || track.track.is_local;
            track.playableMatched = o && !track.isPlayable;

            if (s) {
                track.nameMatch = track.track.name.indexOf(s);
                track.albumMatch = track.track.album.name.indexOf(s);
                track.artistMatch = track.track.artists[0].name.indexOf(s);
                track.isrcMatch = track.track.external_ids.isrc && track.track.external_ids.isrc.indexOf(s);
                track.linkMatch = track.track.external_urls.spotify && track.track.external_urls.spotify.indexOf(s);
            }
            track.searchMatched =
                track.nameMatch >= 0 ||
                track.albumMatch >= 0 ||
                track.artistMatch >= 0 ||
                track.isrcMatch >= 0 ||
                track.linkMatch >= 0;

            if (s && o) {
                track.matched = track.searchMatched && track.playableMatched;
            } else if (s) {
                track.matched = track.searchMatched;
            } else if (o) {
                track.matched = track.playableMatched;
            } else {
                track.matched = false;
            }

            track.markupName = markupMatch(track.track.name, s, track.nameMatch);
            track.markupAlbum = markupMatch(track.track.album.name, s, track.albumMatch);
            track.markupArtist = markupMatch(track.track.artists[0].name, s, track.artistMatch);
            track.markupIsrc = markupMatch(track.track.external_ids.isrc, s, track.isrcMatch);
            track.markupLink = markupMatch(track.track.external_urls.spotify, s, track.linkMatch);

            track.isrcUrl = `https://isrcsearch.ifpi.org/?tab=%22code%22&isrcCode=%22${track.track.external_ids.isrc}%22`;

            return track;
        });
        return r;
    }

    function weHaveAMatch(v) {
        return v.some((x) => x.matched);
    }

    function setTrClass(t) {
        if (!t.isPlayable) {
            return 'table-danger';
        }
        return t.matched ? 'table-info' : '';
    }

    function collapseControl() {
        trVisible = true;
        clickOpen = !clickOpen;
    }

    function trVisibilityControl() {
        trVisible = false;
    }

    async function* loadPlaylistTracks() {
        console.log('Loading tracks in playlist: ', playlist.name);
        let r = await throttled.add(
            backoff.bind(this, 10, spotify.getPlaylistTracks.bind(this, playlist.id, { limit: 100, offset: 0 }))
        );
        yield r.items;
        while (r.next) {
            const urlNext = new URL(r.next);
            const offsetNext = urlNext.searchParams.get('offset');
            const limitNext = urlNext.searchParams.get('limit');
            r = await throttled.add(
                backoff.bind(
                    this,
                    10,
                    spotify.getPlaylistTracks.bind(this, playlist.id, { limit: limitNext, offset: offsetNext })
                )
            );
            yield r.items;
        }
    }

    function exportAsCsv() {
        const csv = [
            '"Track","Artist","Album","Track link"',
            ...visibleTracks.map((track) => {
                return `"${track.track.name}","${track.track.artists[0].name}","${track.track.album.name}","${track.track.external_urls.spotify}"`;
            })
        ].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${playlist.name}.csv`;
        a.click();
    }

    onMount(async function () {
        tracksLoading = true;
        for await (let t of loadPlaylistTracks()) {
            tracks = tracks.concat(t);
        }
        tracksLoading = false;
    });
</script>

<tr class={isMatch ? 'table-success' : ''} on:click={collapseControl}>
    <td>{playlist.name}</td>
    <td>{playlist.owner.id}</td>
    <td>
        {tracksNum}/{playlist.tracks.total}
        {#if tracksLoading}
            <Spinner color="primary" size="sm" />
        {/if}
    </td>
</tr>
<tr hidden={!isOpen && !isTrVisible}>
    <td colspan="3">
        <Collapse {isOpen} on:close={trVisibilityControl}>
            <Card>
                <CardHeader class="align-items-center">
                    <FormGroup>
                        <Button color="primary" on:click={exportAsCsv}>
                            <Icon name="table" />
                            <span class="ml-2">Export CSV</span>
                        </Button>
                        <Button color="primary">
                            <Icon name="shuffle" />
                            <span class="ml-2">Randomise</span>
                        </Button>
                    </FormGroup>
                </CardHeader>
                <CardBody>
                    <Table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Track</th>
                                <th>Artist</th>
                                <th>Album</th>
                                <th>ISRC</th>
                                <th>Spotify link</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each visibleTracks as track}
                                {#if !isMatch || track.matched}
                                    <tr class={setTrClass(track)}>
                                        <td>{track.track.track_number === 0 ? ' ' : track.track.track_number}</td>
                                        <!-- eslint-disable-next-line svelte/no-at-html-tags  -->
                                        <td>{@html track.markupName}</td>
                                        <!-- eslint-disable-next-line svelte/no-at-html-tags  -->
                                        <td>{@html track.markupArtist}</td>
                                        <!-- eslint-disable-next-line svelte/no-at-html-tags  -->
                                        <td>{@html track.markupAlbum}</td>
                                        <!-- eslint-disable-next-line svelte/no-at-html-tags  -->
                                        <td><a href={track.isrcUrl}>{@html track.markupIsrc}</a></td>
                                        <!-- eslint-disable-next-line svelte/no-at-html-tags  -->
                                        <td><a href={track.track.external_urls.spotify}>{@html track.markupLink}</a></td
                                        >
                                    </tr>
                                {/if}
                            {/each}
                        </tbody>
                    </Table>
                </CardBody>
            </Card>
        </Collapse>
    </td>
</tr>
