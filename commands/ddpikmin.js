import { ContextMenuCommandBuilder, SlashCommandBuilder, ApplicationCommandType } from "discord.js";
import prepositions from "./prepositions.js";
import { MAX_MESSAGE_LENGTH, formatShortened } from "./mitigation.js";
import { IntegrationTypes, InteractionContextTypes, visitMessageComponents } from "./util.js";

const data = new SlashCommandBuilder()
    .setName("ddpikmin")
    .setDescription("Pikminify your message")
    .addStringOption(option => option.setName("message").setDescription("The message you want to pikminify").setRequired(true))
    .setIntegrationTypes([IntegrationTypes.GUILD_INSTALL, IntegrationTypes.USER_INSTALL])
    .setContexts(InteractionContextTypes.all)

const onMessageData = new ContextMenuCommandBuilder()
    .setName("Pikminify this message")
    .setType(ApplicationCommandType.Message)
    .setIntegrationTypes([IntegrationTypes.GUILD_INSTALL, IntegrationTypes.USER_INSTALL])
    .setContexts(InteractionContextTypes.all)

const unchanged = [
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
    '=', '>', '?', '@', '[' +
    ']', '^', '_', '`', '{' +
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
    '[' + punct.map(p => "\\" + p).join() + ']' +        // punct
    ')'                // end capture group
);

const wordOffset = 3;

/** Implemented by Stroopwafel ;D */
function pikminify(input) {
    /** @type {string[]} */
    const token = input.split(re);

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

function chatCommandFormat([input, lungified]) {
    return `Your message:
    
    > ${input}
    
    Pikminified message:
    
    > ${lungified}`;
}

function contextMenuCommandFormat([displayName, lungified]) {
    return `${displayName} had been pikminified!

    > ${lungified}
    `;
}

async function execute(interaction) {
    const input = interaction.options.get("message").value;

    const pikminified = pikminify(input);

    interaction.reply(formatShortened(chatCommandFormat, MAX_MESSAGE_LENGTH, [input, pikminified]));
}

async function executeOnMessage(interaction) {
    const displayName = interaction.targetMessage.author.displayName ?? interaction.targetMessage.author.username;

    const pikminified = visitMessageComponents(pikminify, interaction.targetMessage);

    pikminified.content = formatShortened(contextMenuCommandFormat, MAX_MESSAGE_LENGTH, [displayName, pikminified.content]);

    interaction.reply(pikminified);
}

export default { data, onMessage: { data: onMessageData, executeOnMessage }, execute };