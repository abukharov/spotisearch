<script>
    import Navbar from './views/Navbar.svelte';
    import SpotifySearch from './views/SpotifySearch.svelte';
    import Announce from './views/Announce.svelte';
    import Footer from './views/Footer.svelte';

    import { onMount } from 'svelte';
    import { spotifyClientId, uuidv4 } from './lib/auth';
    import spotify from './lib/spotify';

    let user;
    let authToken = localStorage.getItem('authToken');
    let errorMessage = localStorage.getItem('errorMessage');

    if (authToken) {
        spotify.setAccessToken(authToken);
    }

    $: isError = errorMessage !== null;
    $: isAuthorised = spotify.getAccessToken() !== null;
    $: isAuthorising = localStorage.getItem('isAuthorising') || false;

    function returnNothing() {
        return '';
    }

    function setError(message) {
        localStorage.setItem('errorMessage', message);
    }

    function spotifyAuthStart() {
        localStorage.setItem('isAuthorising', true);
        if (!localStorage.getItem('stateUuid')) {
            localStorage.setItem('stateUuid', uuidv4());
        }
        const spotifyAuthUri = new URL('https://accounts.spotify.com/authorize');
        spotifyAuthUri.searchParams.set('client_id', spotifyClientId);
        spotifyAuthUri.searchParams.set('response_type', 'token');
        spotifyAuthUri.searchParams.set('redirect_uri', location.href);
        spotifyAuthUri.searchParams.set(
            'scope',
            'user-read-private user-read-email playlist-read-private playlist-read-collaborative user-library-read'
        );
        spotifyAuthUri.searchParams.set('state', localStorage.getItem('stateUuid'));
        location.replace(spotifyAuthUri.href);
    }

    async function getUserProfile() {
        try {
            user = await spotify.getMe();
        } catch (e) {
            if (e.status === 401) {
                const errorText = JSON.parse(e.responseText).error.message;
                if (errorText === 'The access token expired') {
                    localStorage.removeItem('authToken');
                    spotifyAuthStart();
                }
            }
        }
    }

    function spotifyLogout() {
        localStorage.clear();
        location.replace('/');
    }

    onMount(function () {
        if (location.hash) {
            const hashString = location.hash.replace(/^#+/, '');
            const tokenParams = new URLSearchParams(hashString);
            if (tokenParams.get('state') !== localStorage.getItem('stateUuid')) {
                setError('Spotify returned the wrong state. Make sure you orginate authorisation from this website');
                location.replace('/');
                return;
            }
            localStorage.setItem('authToken', tokenParams.get('access_token'));
            localStorage.removeItem('errorMessage');
            localStorage.removeItem('isAuthorising');
            location.replace('/');
            return;
        }
    });
</script>

<Navbar authStart={spotifyAuthStart} logout={spotifyLogout} {user} />

{#if isError}
    <p class="alert alert-danger" role="alert">{errorMessage}</p>
{/if}

{#if !isAuthorised && !isAuthorising}
    <Announce />
{:else if isAuthorising}
    <p>Authorising via Spotify...</p>
{:else if isAuthorised}
    {#await getUserProfile()}
        <p>Loading user...</p>
    {:then}
        {#if user}
            <SpotifySearch {user} />
        {:else if !isAuthorising}
            {returnNothing(setError('Failed to authorise with Spotify. Please try again.'))}
        {/if}
    {/await}
{/if}

<Footer />
