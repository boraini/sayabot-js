import { ContextMenuCommandBuilder, SlashCommandBuilder, ApplicationCommandType } from "discord.js";
import { MAX_MESSAGE_LENGTH, formatShortened } from "./mitigation.js";
import { IntegrationTypes, InteractionContextTypes, visitMessageComponents } from "./util.js";

"use strict"

const prepositions = [
    "aboard",
    "about",
    "above",
    "across",
    "after",
    "against",
    "along",
    "amid",
    "among",
    "anti",
    "around",
    "as",
    "at",
    "before",
    "behind",
    "below",
    "beneath",
    "beside",
    "besides",
    "between",
    "beyond",
    "but",
    "by",
    "concerning",
    "considering",
    "despite",
    "down",
    "during",
    "except",
    "excepting",
    "excluding",
    "following",
    "for",
    "from",
    "in",
    "inside",
    "into",
    "like",
    "minus",
    "near",
    "of",
    "off",
    "on",
    "onto",
    "opposite",
    "outside",
    "over",
    "past",
    "per",
    "plus",
    "regarding",
    "round",
    "save",
    "since",
    "than",
    "through",
    "to",
    "toward",
    "towards",
    "under",
    "underneath",
    "unlike",
    "until",
    "up",
    "upon",
    "versus",
    "via",
    "with",
    "within",
    "without",
];

export const unchanged = [
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

export const punct = ['[', '!', '"', '#', '$',   // since javascript does not
        '%', '&', '\'', '(', ')',  // support POSIX character
        '*', '+', ',', '\\', '-',  // classes, we'll need our
        '.', '/', ':', ';', '<',   // own version of [:punct:]
        '=', '>', '?', '@', '[' +
        ']', '^', '_', '`', '{' +
        '|', '}', '~', ']'];

/**
 * 
 * @param {{ processor: ((tokens: string[]) => string), chatFormat: Formatter, onMessageFormat: Formatter, chatCommandName: string, chatCommandDescription: string, chatCommandArgDescription: string, onMessageName: string }} param0 
 * @returns 
 */
export function textProcessingCommand({ processor, chatCommandName, chatCommandDescription, chatCommandArgDescription, chatFormat, onMessageName, onMessageFormat }) {
    const data = new SlashCommandBuilder()
        .setName(chatCommandName)
        .setDescription(chatCommandDescription)
        .addStringOption(option => option.setName("message").setDescription(chatCommandArgDescription).setRequired(true))
        .setIntegrationTypes([IntegrationTypes.GUILD_INSTALL, IntegrationTypes.USER_INSTALL])
        .setContexts(InteractionContextTypes.all)

    const onMessageData = new ContextMenuCommandBuilder()
        .setName(onMessageName)
        .setType(ApplicationCommandType.Message)
        .setIntegrationTypes([IntegrationTypes.GUILD_INSTALL, IntegrationTypes.USER_INSTALL])
        .setContexts(InteractionContextTypes.all)

    function process(input) {
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

        return processor(input.split(re));
    }

    async function execute(interaction) {
        const input = interaction.options.get("message").value;

        const processed = process(input);

        interaction.reply(formatShortened(chatFormat, MAX_MESSAGE_LENGTH, [input, processed]));
    }

    async function executeOnMessage(interaction) {
        const displayName = interaction.targetMessage.author.displayName ?? interaction.targetMessage.author.username;

        const processed = visitMessageComponents(process, interaction.targetMessage);

        processed.content = formatShortened(onMessageFormat, MAX_MESSAGE_LENGTH, [displayName, processed.content]);

        interaction.reply(processed);
    }

    return { chat: { data, execute }, onMessage: { data: onMessageData, execute: executeOnMessage } }
}
