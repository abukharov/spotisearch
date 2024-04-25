<script>
    import { Table, FormGroup, Label, Input } from '@sveltestrap/sveltestrap';

    import Playlist from './Playlist.svelte';
    import spotify, {backoff, throttled} from '../lib/spotify';
    import { onMount } from 'svelte';

    export let user;

    let playlists = [];
    let playlistsLoading = false;
    let searchString = '';

    async function loadUserPlaylists() {
        const p = new Promise(async function(resolve, reject) {
            let r = await throttled.add(backoff.bind(this, 10, spotify.getUserPlaylists.bind(this, user.id, {limit: 20, offset: 0})));
            playlists = playlists.concat(r.items);
            const loop = async function() {
                if (!r.next) {
                    playlistsLoading = false;
                    resolve();
                    return null;
                }
                const urlNext = new URL(r.next);
                const offsetNext = urlNext.searchParams.get('offset');
                const limitNext = urlNext.searchParams.get('limit');
                r = await throttled.add(backoff.bind(this, 10, spotify.getUserPlaylists.bind(this, user.id, {limit: limitNext, offset: offsetNext})));
                playlists = playlists.concat(r.items);
                loop();
            }
            process.nextTick(loop);
        });
        return p;
    }

    onMount(async function() {
        playlistsLoading = true;
        await loadUserPlaylists();
    });
</script>

<FormGroup>
  <Label>Search for</Label>
  <Input type="text" bind:value={searchString} />
</FormGroup>

<Table hover>
<thead class="thead-dark">
    <tr>
        <th>Name</th>
        <th>Owner</th>
        <th></th>
        <th>Songs</th>
    </tr>
</thead>
<tbody>
{#each playlists as playlist}
    <Playlist playlist={playlist} searchString={searchString}/>
{/each}
</tbody>
</Table>
{#if playlistsLoading}
    <p>Loading playlists...</p>
{/if}
