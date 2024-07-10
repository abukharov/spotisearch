<script>
    import { Nav, Navbar, NavbarBrand, NavItem, Button } from '@sveltestrap/sveltestrap';
    export let user;
    export let authStart;
    export let logout;
</script>

<Navbar color="primary" dark expand="md">
    <NavbarBrand href="/">Spotisearch</NavbarBrand>
    <Nav class="ml-auto" navbar>
        {#if user}
            <NavItem>
                <span class="navbar-brand mb-0 h1">{user.id} ({user.email})</span>
                <Button color="success" on:click={logout}>Logout</Button>
            </NavItem>
        {:else}
            <NavItem>
                <Button color="success" on:click={authStart}>Authorise via Spotify</Button>
            </NavItem>
        {/if}
    </Nav>
</Navbar>
