import { textProcessingCommand, punct, unchanged } from "./text-processing.js";

const wordOffset = 3;

function pikminify(token) {
    /** @type {string[]} */
    let s = "";

    for (let i = 0; i < token.length; i++) {
        const tokenLeft = token[i];
        const tokenRight = i >= token.length - wordOffset ? "" : token[i + wordOffset];

        // even the Pikmin would know better what to do in these cases
        if (tokenLeft == "") continue;
        if (tokenLeft == " ") {
            if (i != 0) s += " ";
            continue;
        }

        // add punctuation
        if (punct.some(p => token[i].indexOf(p) != -1)) {
            s += token[i];
            continue;
        }

        const lowerCase = tokenLeft.toLowerCase();

        // should change the word or not
        if (unchanged.indexOf(lowerCase) == -1) {
            s += "pikmin";

            if (lowerCase.endsWith("ing")) s += token[i].substring(token[i].length - "ing".length);
            else if (lowerCase.endsWith("ed")) s += token[i].substring(token[i].length - "ed".length);
            else if (lowerCase.endsWith("s")) s += token[i].substring(token[i].length - "s".length);
        } else {
            s += token[i];
        }

        // add some flowers
        if (i % 3 == 1 && tokenLeft.length % 2 == 0 && tokenRight.length % 2 == 0) {
            s += "🌹";
        } else if (i % 5 == 3 && tokenLeft.length % 2 == 1 && tokenRight.length % 2 == 0) {
            s += "🌻";
        } else if (i % 3 == 2 && tokenLeft.length % 2 == 0 && tokenRight.length % 2 == 1) {
            s += "🌺";
        } else if (i % 5 == 2) {
            s += "🌱";
        }
    }

    return s;
}

function chatFormat([input, lungified]) {
    return `Your message:
    
    > ${input}
    
    Pikminified message:
    
    > ${lungified}`;
}

function onMessageFormat([displayName, lungified]) {
    return `${displayName} had been pikminified!

    > ${lungified}
    `;
}

export default textProcessingCommand({
    processor: pikminify,
    chatCommandName: "ddpikmin",
    chatCommandDescription: "Pikminify your message",
    chatCommandArgDescription: "The message you want to pikminify",
    chatFormat,
    onMessageName: "Pikminify this message",
    onMessageFormat,
});
