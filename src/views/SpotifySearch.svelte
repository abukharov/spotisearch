<script>
    import Playlist from './Playlist.svelte';
    import spotify from '../lib/spotify';
    import { onMount } from 'svelte';

    export let user;

    let playlists = [];
    let playlistsLoaded = false;

    async function loadUserPlaylists() {
        let r;
        r = await spotify.getUserPlaylists(user.id);
        playlists.concat()
    }

    onMount(async function() {
        let r;
        r = await spotify.getUserPlaylists(user.id, {limit: 50, offset: 0});
        playlists = playlists.concat(r.items);
        while (r.next) {
            const urlNext = new URL(r.next);
            const offsetNext = urlNext.searchParams.get('offset');
            const limitNext = urlNext.searchParams.get('limit');
            r = await spotify.getUserPlaylists(user.id, {limit: limitNext, offset: offsetNext});
            playlists = playlists.concat(r.items);
        }
        playlistsLoaded = true;
    });
</script>

{#if playlistsLoaded}
    <table class="table table-condensed">
    <thead>
      <tr>
        <th>Name</th>
        <th>Owner</th>
        <th>Songs</th>
        <th>Loaded</th>
      </tr>
    </thead>
    <tbody>
    {#each playlists as playlist}
        <Playlist playlist={playlist}/>
    {/each}
    </tbody>
    </table>
{:else}
    <p>Loading playlists...</p>
{/if}
