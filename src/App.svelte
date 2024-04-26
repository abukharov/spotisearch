<script>
    import Navbar from './views/Navbar.svelte';
    import SpotifySearch from './views/SpotifySearch.svelte';
    import Announce from './views/Announce.svelte';
    import Footer from './views/Footer.svelte';

    import { onMount } from 'svelte';
    import {spotifyClientId, uuidv4} from './lib/auth';
    import spotify from './lib/spotify';

    let user;
    let authToken = localStorage.getItem('authToken');
    let errorMessage = localStorage.getItem('errorMessage');

    if (authToken) {
        spotify.setAccessToken(authToken);
    }

    $: isError = errorMessage !== null;
    $: isAuthorised = spotify.getAccessToken() !== null;

    function spotifyAuthStart() {
        if (!localStorage.getItem('stateUuid')) {
            localStorage.setItem('stateUuid', uuidv4());
        }
        const spotifyAuthUri = new URL('https://accounts.spotify.com/authorize');
        spotifyAuthUri.searchParams.set('client_id', spotifyClientId);
        spotifyAuthUri.searchParams.set('response_type', 'token');
        spotifyAuthUri.searchParams.set('redirect_uri', location.href);
        spotifyAuthUri.searchParams.set('scope', 'user-read-private user-read-email');
        spotifyAuthUri.searchParams.set('state', localStorage.getItem('stateUuid'));
        location.replace(spotifyAuthUri.href);
    }

    async function getUserProfile() {
        const r = await spotify.getMe();
        user = r;
    }

    function spotifyLogout() {
        localStorage.clear();
        location.replace('/');
    }

    onMount(function() {
        if (location.hash) {
            const hashString = location.hash.replace(/^#+/, '');
            const tokenParams = new URLSearchParams(hashString);
            if (tokenParams.get('state') !== localStorage.getItem('stateUuid')) {
                localStorage.setItem('errorMessage', 'Spotify returned the wrong state. Make sure you orginate authorisation from this website');
                location.replace('/');
                return;
            }
            localStorage.setItem('authToken', tokenParams.get('access_token'));
            localStorage.removeItem('errorMessage');
            location.replace('/');
            return;
        }
    });
</script>

<Navbar authStart={spotifyAuthStart} logout={spotifyLogout} user={user}/>

{#if isError}
    <p class="error">{errorMessage}</p>
{/if}

{#if isAuthorised}
    {#await getUserProfile()}
        <p>Loading user...</p>
    {:then}
        {#if user}
            <SpotifySearch user={user}/>
        {:else}
            <Announce/>
        {/if}
    {/await}
{:else}
    <Announce/>
{/if}

<Footer/>
