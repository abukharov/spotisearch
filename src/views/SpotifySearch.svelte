<script>
    export let token;
    import Spotify from 'spotify-web-api-js';
    import { onMount } from 'svelte';

    const s = new Spotify();
    s.setAccessToken(token);

    async function getUser() {
        const r = await s.getMe();
        return r.email;
    }
</script>

<style src="./SpotifySearch.scss" lang="scss">
</style>

{#await getUser()}
    <p>Loading profile...</p>
{:then userEmail}
    <p>User: {userEmail}</p>
{/await}
