<script>
    import { Table, FormGroup, Input, InputGroup, InputGroupText, Row, Col, Icon } from '@sveltestrap/sveltestrap';

    import Playlist from './Playlist.svelte';
    import spotify, {backoff, throttled} from '../lib/spotify';
    import { onMount } from 'svelte';
    import process from 'process';

    export let user;

    let playlists = [];
    let playlistsLoading = false;
    let searchString = '';
    let onlyNonPlayable = false;

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
    <Row>
        <Col sm="6" md="3">
            <InputGroup>
                <InputGroupText><Icon name="search" /></InputGroupText>
                <Input type="text" bind:value={searchString} />
            </InputGroup>
        </Col>
        <Col sm="6" md="3">
            <Input type="switch" bind:checked={onlyNonPlayable} label="Show only non-playable" />
        </Col>
    </Row>
</FormGroup>

<Table hover>
<thead class="thead-dark">
    <tr>
        <th>Name</th>
        <th>Owner</th>
        <th>Songs</th>
    </tr>
</thead>
<tbody>
{#each playlists as playlist}
    <Playlist playlist={playlist} searchString={searchString} onlyNonPlayable={onlyNonPlayable}/>
{/each}
</tbody>
</Table>
{#if playlistsLoading}
    <p>Loading playlists...</p>
{/if}
