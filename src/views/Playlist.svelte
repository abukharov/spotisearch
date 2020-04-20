<script>
    import spotify from '../lib/spotify';
    import { onMount } from 'svelte';

    export let playlist;

    let tracks = [];
    let tracksLoaded = false;

    // onMount(async function() {
    //     let r;
    //     r = await spotify.getPlaylistTracks(playlist.id, {limit: 100, offset: 0});
    //     tracks = tracks.concat(r.items);
    //     while (r.next) {
    //         const urlNext = new URL(r.next);
    //         const offsetNext = urlNext.searchParams.get('offset');
    //         const limitNext = urlNext.searchParams.get('limit');
    //         r = await spotify.getPlaylistTracks(playlist.id, {limit: limitNext, offset: offsetNext});
    //         tracks = tracks.concat(r.items);
    //     }
    //     tracksLoaded = true;
    // });

</script>

<tr>
    <td>{playlist.name}</td>
    <td>{playlist.owner.id}</td>
    <td>{playlist.tracks.total}</td>
    <td>
        {#if tracksLoaded}
            X
        {/if}
    </td>
</tr>
