<script>
    import { Table, Collapse, Spinner } from '@sveltestrap/sveltestrap';
    import spotify, {backoff, throttled} from '../lib/spotify';
    import { onMount } from 'svelte';
    import process from 'process';

    export let playlist;
    export let searchString;
    export let onlyNonPlayable;


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
        if (match === -1) {
            return prop;
        }
        const markupProp = `${prop.slice(0, match)}<span class="highlighted">${s}</span>${prop.slice(match + s.length)}`;
        return markupProp;
    }

    function filterTracks(t, s, o) {
        const r = t.map(function(track) {
            track.nameMatch = -1;
            track.albumMatch = -1;
            track.artistMatch = -1;
            track.isPlayable = track.track.preview_url !== null || track.track.is_local;
            track.playableMatched = (o && !track.isPlayable);

            if (s) {
                track.nameMatch = track.track.name.indexOf(s);
                track.albumMatch = track.track.album.name.indexOf(s);
                track.artistMatch = track.track.artists[0].name.indexOf(s);
            }
            track.searchMatched = track.nameMatch >= 0 || track.albumMatch >= 0 || track.artistMatch >= 0;

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

            return track;
        });
        return r;
    }

    function weHaveAMatch(v) {
        return v.some(x => x.matched);
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

    async function loadPlaylistTracks() {
        const p = new Promise(async function(resolve, reject) {
            let r = await throttled.add(backoff.bind(this, 10,
                spotify.getPlaylistTracks.bind(this, playlist.id, {limit: 100, offset: 0})));
            tracks = tracks.concat(r.items);
            const loop = async function() {
                if (!r.next) {
                    tracksLoading = false;
                    resolve();
                    return null;
                }
                const urlNext = new URL(r.next);
                const offsetNext = urlNext.searchParams.get('offset');
                const limitNext = urlNext.searchParams.get('limit');
                r = await throttled.add(backoff.bind(this, 10,
                    spotify.getPlaylistTracks.bind(this, playlist.id, {limit: limitNext, offset: offsetNext})));
                tracks = tracks.concat(r.items);
                loop();
            }
            process.nextTick(loop);
        });
        return p;
    }

    onMount(async function() {
        tracksLoading = true;
        await loadPlaylistTracks();
        console.log('Loaded.')
    });

</script>

<tr class={isMatch ? "table-success" : ""} on:click={collapseControl}>
    <td>{playlist.name}</td>
    <td>{playlist.owner.id}</td>
    <td>
        {tracksNum}/{playlist.tracks.total}
        {#if tracksLoading}
            <Spinner color="primary" size="sm"/>
        {/if}
    </td>
</tr>
<tr hidden={!isOpen && !isTrVisible}>
    <td colspan="3">
        <Collapse {isOpen} on:close={trVisibilityControl}>
                <Table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Track</th>
                            <th>Artist</th>
                            <th>Album</th>
                            <th>Added at</th>
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
                            <td>{track.added_at}</td>
                        </tr>
                        {/if}
                        {/each}
                    </tbody>
                </Table>
        </Collapse>
    </td>
</tr>
