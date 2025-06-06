export const MAX_MESSAGE_LENGTH = 2000;

/**
 * @typedef {(parts: string[]) => string} Formatter
 */
/** Apply a formatter function which takes string parts but shortens the parts as necessary to ensure a max string length.
 * 
 * @param {Formatter} formatter 
 * @param {number} maxLength 
 * @param {string[]} parts 
 * @returns 
 */
export function formatShortened(formatter, maxLength, parts) {
    const full = formatter(parts);
    if (full.length <= maxLength) return full;

    const excessLength = full.length - maxLength;
    // Split up the required shortening length among parts.
    const sharedShortening = Math.ceil(excessLength / parts.length);

    // Shorten strings which are longer than the shortening length.
    const newParts = parts.map(s => s.length >= sharedShortening ? s.substring(0, s.length - sharedShortening) : s);
    const shortened = formatter(newParts);

    // We are done with shortening.
    if (shortened.length <= maxLength) return shortened;

    // Just cut off the excess at this point.
    else return shortened.substring(0, maxLength);
}