import Spotify from 'spotify-web-api-js';
import PromiseThrottle from 'promise-throttle';

const spotify = new Spotify();

export const throttled = new PromiseThrottle({
    requestsPerSecond: 10
});

export const pause = (duration) =>
    new Promise((res) => setTimeout(res, duration));

export const backoff = (retries, fn, delay = 1000) =>
    fn().catch((err) =>
        retries > 1
            ? pause(delay).then(() => backoff(retries - 1, fn, delay * 2))
            : Promise.reject(err)
    );

export default spotify;
