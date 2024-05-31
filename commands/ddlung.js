import { ContextMenuCommandBuilder, SlashCommandBuilder, ApplicationCommandType } from "discord.js";
import prepositions from "./prepositions.js";
import { MAX_MESSAGE_LENGTH, formatShortened } from "./mitigation.js";
import { visitMessageComponents } from "./util.js";

const data = new SlashCommandBuilder()
    .setName("ddlung")
    .setDescription("Lungify your message")
    .addStringOption(option => option.setName("message").setDescription("The message you want to lungify").setRequired(true));

const onMessageData = new ContextMenuCommandBuilder()
    .setName("Lungify this message") 
    .setType(ApplicationCommandType.Message);
    
const unlunged = [
    "i", "you", "they", "he", "she", "it", "we",
    "me", "your", "them", "him", "her", "us",
    "my", "his", "their", "our",
    "mine", "yours", "hers", "theirs", "ours",
    "who", "what", "when", "where", "which", "whom", "whose",
    "has", "had", "have",
    "am", "is", "are", "been", "be", "let's", "lets",
    "apple", "banana",
    "the", "a", "an", "some", "these", "those", "that",
    "very", "much", "many",
    "will", "would", "must", "can", "could", "shall", "should",
    "may", "this", "there", "so",
    ...prepositions
];


const punct = ['[', '!', '"', '#', '$',   // since javascript does not
'%', '&', '\'', '(', ')',  // support POSIX character
'*', '+', ',', '\\', '-',  // classes, we'll need our
'.', '/', ':', ';', '<',   // own version of [:punct:]
'=', '>', '?', '@', '['+
']', '^', '_', '`', '{'+
'|', '}', '~', ']'];

const re = new RegExp(     // tokenizer
'\\h*' +            // discard possible leading whitespace
'(' +               // start capture group
'\\.{3}' +            // ellipsis (must appear before punct)
'|' +               // alternator
'\\w+\\-\\w+' +       // hyphenated words (must appear before punct)
'|' +               // alternator
'\\w+\'(?:\\w+)?' +   // compound words (must appear before punct)
'|' +               // alternator
'\\w+' +              // other words
'|' +               // alternator
'[' + punct.map(p => "\\" + p).join() + ']'+        // punct
')'                // end capture group
);

/** Implemented by Stroopwafel ;D */
function lungify(input) {
    /** @type {string[]} */
    const token = input.split(re);

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

function contextMenuCommandFormat([displayName, lungified]) {
    return `${displayName} had been lunged!

    > ${lungified}
    `;
}

async function execute(interaction) {
    const input = interaction.options.get("message").value;

    const lungified = lungify(input);

    interaction.reply(formatShortened(chatCommandFormat, MAX_MESSAGE_LENGTH, [input, lungified]));
}

async function executeOnMessage(interaction) {
    const displayName = interaction.targetMessage.author.displayName ?? interaction.targetMessage.author.username;

    const lungified = visitMessageComponents(lungify, interaction.targetMessage);

    lungified.content = formatShortened(contextMenuCommandFormat, MAX_MESSAGE_LENGTH, [displayName, lungified.content]);

    interaction.reply(lungified);
}

export default { data, onMessage: { data: onMessageData, executeOnMessage }, execute };