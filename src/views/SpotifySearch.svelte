<script>
    import { Table, FormGroup, Input, InputGroup, InputGroupText, Row, Col, Icon } from '@sveltestrap/sveltestrap';

    import Playlist from './Playlist.svelte';
    import spotify, {backoff, throttled} from '../lib/spotify';
    import { onMount } from 'svelte';

    export let user;

    let playlists = [];
    let playlistsLoading = false;
    let searchString = '';
    let onlyNonPlayable = false;

    let owners = ['me', 'all'];

    async function* loadUserPlaylists() {
        let r = await throttled.add(backoff.bind(this, 10, spotify.getUserPlaylists.bind(this, user.id, {limit: 20, offset: 0})));
        yield r.items;
        while (r.next) {
            const urlNext = new URL(r.next);
            const offsetNext = urlNext.searchParams.get('offset');
            const limitNext = urlNext.searchParams.get('limit');
            r = await throttled.add(backoff.bind(this, 10, spotify.getUserPlaylists.bind(this, user.id, {limit: limitNext, offset: offsetNext})));
            yield r.items;
        }
    }

    onMount(async function() {
        playlistsLoading = true;
        for await (let p of loadUserPlaylists()) {
            playlists = playlists.concat(p.filter(x => x.owner.id === user.id));
        }
        playlistsLoading = false;
    });
</script>

<FormGroup>
    <Row class="align-items-center">
        <Col sm="6" md="4">
            <InputGroup>
                <InputGroupText><Icon name="search" /></InputGroupText>
                <Input disabled={playlistsLoading} type="text" bind:value={searchString} />
            </InputGroup>
        </Col>
        <Col sm="6" md="4">
            <Input disabled={playlistsLoading} type="switch" bind:checked={onlyNonPlayable} label="Show only non-playable" />
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
