export const spotifyClientId = '431771a10c874653bf0c131bf727dfd9';

/**
 * @return {string} Random-generated uuidv4
 */
export function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
        (
            c ^
            (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
        ).toString(16)
    );
}
