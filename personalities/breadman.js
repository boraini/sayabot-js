
/**Builds a ternary Huffman tree
 * 
 * @param {string} str2
 */
export function buildHuffman(str2) {
    const str = str2.toLowerCase();

    if (str.length == 0) return null;

    /** @type {Record<string, number>} */
    const frequencies = {};

    for (let c of str) {
        if (/\s/.test(c)) continue;
        frequencies[c] = (frequencies[c] ?? 0) + 1;
    }

    const queue = Object.entries(frequencies).map(([symbol, frequency]) => ({ symbol, frequency, isLeaf: true }));

    if (queue.length % 2 == 0) queue.unshift({ symbol: "x", frequency: 0, isLeaf: true });

    while (queue.length > 1) {
        queue.sort((a, b) => a.frequency - b.frequency);

        const left = queue.shift();
        const middle = queue.shift();
        const right = queue.shift();

        const frequency = left.frequency + middle.frequency + right.frequency;
        queue.push({ left, middle, right, frequency, isLeaf: false });
    }

    return queue[0];
}

/**Return the character encodings extracted from a ternary Huffman tree
 * 
 * @param {*} cipher 
 * @returns an object of encodings keyed by the characters
 */
export function getEncodings(cipher) {
    if (cipher.isLeaf) return { [cipher.symbol]: [] };

    const left = getEncodings(cipher.left);
    const middle = getEncodings(cipher.middle);
    const right = getEncodings(cipher.right);

    Object.values(left).forEach(arr => arr.unshift(0));
    Object.values(middle).forEach(arr => arr.unshift(1));
    Object.values(right).forEach(arr => arr.unshift(2));

    return { ...left, ...middle, ...right };
}

/**Encode the string based on a ternary Huffman tree
 * 
 * @param {string} str2 
 * @param {*} cipher 
 */
export function encodeHuffman(str2, cipher) {
    const str = str2.toLowerCase();

    const encodings = getEncodings(cipher);

    let result = [];
    for (let c of str) {
        result = result.concat(/\s/.test(c) ? [3] : encodings[c]);
    }

    return result;
}

export function encodeHuffmanFull(str) {
    const cipher = buildHuffman(str);
    return [cipher, encodeHuffman(str, cipher)];
}

export function cipherToString(cipher) {
    if (cipher.isLeaf) {
        return cipher.symbol;
    } else {
        return `(${cipherToString(cipher.left)} ${cipherToString(cipher.middle)} ${cipherToString(cipher.right)})`;
    }
}

const data = {
    nickname: "breadman",
    description: "Oh lawd he coming.",
};

class Conversation {
    constructor(otherName) {
        this.type = "BreadmanConversation";
        this.myName = "Encoded Message";
        this.otherName = "Cipher";
    }

    /** Makes a conversational HuggingFace Inference API call and returns the formatted response as text.
     * 
     * @param {string} message 
     * @returns 
     */
    async respond(message) {
        const runes = [":leg:", ":french_bread:", ":raised_back_of_hand:", "  "]
        const [cipher, encodedMessage] = encodeHuffmanFull(message);
        const cipherStr = cipherToString(cipher);
        this.lastMessage = runes.join("") + " => " + cipherStr;
        return encodedMessage.map(e => runes[e]).join("");
    }

    async end() {}

    static hydrate(obj) {
        return new Conversation(obj.otherName);
    }
}

export default { data, Conversation };