<script>
    import { Col, Container, Row } from "sveltestrap";
</script>

<Container>
    <Row class="d-flex justify-content-center">
        <Col md="10">
            <div class="d-flex justify-content-center">
                <h1>Search in your Spotify playlists</h1>
            </div>
            <div class="d-flex justify-content-center">
                When you have many playlists it becomes difficult to remember what tracks you have
                and what playlists they are in.
                Unfortunately Spotify doesn't offer search in user's playlists, you can only search through
                all public playlists or filter tracks inside just one playlist. So Spotisearch is to
                the rescue.
            </div>
            <div class="d-flex justify-content-center">
                Click the green button above to authorise Spotisearch to access your Spotify account.
                Once you have done it Spotisearch will load your playlists. Click on a playlist
                to view the tracks. Type in the search field to filter your tracks.
            </div>
            <div class="d-flex justify-content-center">
                <b>This application runs completely in your browser, we don't store any data anywhere.</b>
            </div>
        </Col>
    </Row>
</Container>
