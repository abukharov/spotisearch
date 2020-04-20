<script>
    import SpotifySearch from './views/SpotifySearch.svelte';

    import { onMount } from 'svelte';
    import {spotifyClientId, uuidv4} from './lib/auth';
    const redirectUri = 'http://spotify-search-yarrow-su.s3-website-ap-southeast-2.amazonaws.com';

    let authToken = localStorage.getItem('authToken');
    let errorMessage = localStorage.getItem('errorMessage');

    $: isError = errorMessage !== null;
    $: isAuthorised = authToken !== null;

    function spotifyAuthStart() {
        if (!localStorage.getItem('stateUuid')) {
            localStorage.setItem('stateUuid', uuidv4());
        }
        const spotifyAuthUri = new URL('https://accounts.spotify.com/authorize');
        spotifyAuthUri.searchParams.set('client_id', spotifyClientId);
        spotifyAuthUri.searchParams.set('response_type', 'token');
        spotifyAuthUri.searchParams.set('redirect_uri', redirectUri);
        spotifyAuthUri.searchParams.set('scope', 'user-read-private user-read-email');
        spotifyAuthUri.searchParams.set('state', localStorage.getItem('stateUuid'));
        location.replace(spotifyAuthUri.href);
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

<style src="./style.scss" lang="scss">

</style>

<h1>Hello user!</h1>

{#if isError}
    <p class="error">{errorMessage}</p>
{/if}

{#if isAuthorised}
    <p class="announce">Authorised to Spotify</p><button on:click={spotifyLogout}>Logout</button>
    <SpotifySearch token={authToken}/>
{:else}
    <button on:click={spotifyAuthStart}>Authenticate to Spotify</button>
{/if}
