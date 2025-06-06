import { textProcessingCommand, punct, unchanged as unlunged } from "./text-processing.js";

/** Implemented by Stroopwafel ;D */
function lungify(token) {
    /** @type {string[]} */
    let s = "";

    for (let i = 0; i < token.length; i++) {
        if (token[i] == "") continue;

        if (token[i] == " ") {
            if (i != 0) s += " ";
            continue;
        }

        if (punct.some(p => token[i].indexOf(p) != -1)) {
            s += token[i];
            continue;
        }

        const lowerCase = token[i].toLowerCase();

        if (unlunged.indexOf(lowerCase) == -1) {
            s += "lung";

            if (lowerCase.endsWith("ing")) s += token[i].substring(token[i].length - "ing".length);
            else if (lowerCase.endsWith("ed")) s += token[i].substring(token[i].length - "ed".length);
            else if (lowerCase.endsWith("s")) s += token[i].substring(token[i].length - "s".length);
        }

        else s += token[i];  
    }

    return s;
}

function chatCommandFormat([input, lungified]) {
    return `Your message:
    
    > ${input}
    
    Forelunged message:
    
    > ${lungified}`;
}

function onMessageFormat([displayName, lungified]) {
    return `${displayName} had been lunged!

    > ${lungified}
    `;
}

export default textProcessingCommand({
    processor: lungify,
    chatCommandName: "ddlung",
    chatCommandDescription: "Lungify your message",
    chatCommandArgDescription: "The message you want to lungify",
    chatCommandFormat,
    onMessageName: "Lungify this message",
    onMessageFormat,
});
