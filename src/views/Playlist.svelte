<script>
    import { Table, Collapse, Spinner } from 'sveltestrap';
    import spotify, {backoff, throttled} from '../lib/spotify';
    import { onMount } from 'svelte';

    export let playlist;
    export let searchString;


    let tracks = [];
    let tracksLoading = false;
    let totalTracks = playlist.tracks.total;
    $: tracksNum = tracks.length;

    $: visibleTracks = filterTracks(tracks, searchString);
    $: isMatch = weHaveAMatch(visibleTracks);

    let clickOpen = false;
    $: isOpen = clickOpen || isMatch;

    function markupMatch(prop, match) {
        if (!match) {
            return prop;
        }
        const markupProp = `${prop.slice(0, match.index)}<span class="highlighted">${match[0]}</span>${prop.slice(match.index + match[0].length)}`;
        return markupProp;
    }

    function filterTracks(t, s) {
        const re = new RegExp(s, 'i');
        const r = t.map(function(track) {
            if (!s) {
                track.nameMatch = null;
                track.albumMatch = null;
                track.artistMatch = null;
            } else {
                track.nameMatch = track.track.name.match(re);
                track.albumMatch = track.track.album.name.match(re);
                track.artistMatch = track.track.artists[0].name.match(re);
            }
            track.matched = track.nameMatch || track.albumMatch || track.artistMatch;

            track.markupName = markupMatch(track.track.name, track.nameMatch);
            track.markupAlbum = markupMatch(track.track.album.name, track.albumMatch);
            track.markupArtist = markupMatch(track.track.artists[0].name, track.artistMatch);

            return track;
        });
        return r;
    }

    function weHaveAMatch(v) {
        return v.some(x => x.matched);
    }

    function collapseControl() {
        clickOpen = !clickOpen;
    }

    async function loadPlaylistTracks() {
        const p = new Promise(async function(resolve, reject) {
            let r = await throttled.add(backoff.bind(this, 10, spotify.getPlaylistTracks.bind(this, playlist.id, {limit: 100, offset: 0})));
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
                r = await throttled.add(backoff.bind(this, 10, spotify.getPlaylistTracks.bind(this, playlist.id, {limit: limitNext, offset: offsetNext})));
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
    });

</script>

<tr class={isMatch ? "table-success" : ""} on:click={collapseControl}>
    <td>{playlist.name}</td>
    <td>{playlist.owner.id}</td>
    <td>
        {#if tracksLoading}
            <Spinner color="success"/>
        {/if}
    </td>
    <td>{tracksNum}/{playlist.tracks.total}</td>
</tr>
<Collapse {isOpen}>
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
            {#if track.matched || !searchString}
            <tr>
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
