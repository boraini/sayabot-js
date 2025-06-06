import { ContextMenuCommandBuilder, SlashCommandBuilder, ApplicationCommandType } from "discord.js";
import { formatShortened, MAX_MESSAGE_LENGTH } from "./mitigation.js";
import { IntegrationTypes, InteractionContextTypes, visitMessageComponents } from "./util.js";

const data = new SlashCommandBuilder()
    .setName("ddscout")
    .setDescription("Scoutify your message")
    .addStringOption(option => option.setName("message").setDescription("The message you want to Scoutify").setRequired(true))
    .setIntegrationTypes([IntegrationTypes.GUILD_INSTALL, IntegrationTypes.USER_INSTALL])
    .setContexts(InteractionContextTypes.all)

const onMessageData = new ContextMenuCommandBuilder()
    .setName("Scoutify this message") 
    .setType(ApplicationCommandType.Message)
    .setIntegrationTypes([IntegrationTypes.GUILD_INSTALL, IntegrationTypes.USER_INSTALL])
    .setContexts(InteractionContextTypes.all)


function scoutify(message) {
    return message
        .replaceAll("Ə", "SCOUT")
        .replaceAll("ə", "scout")
        .replaceAll("E", "SCOUT")
        .replaceAll("e", "scout");
}

function chatCommandFormat([input, scoutified]) {
    return `Your message:

> ${input}

Scoutified message:

> ${scoutified}`;
}

function contextMenuCommandFormat([displayName, scoutified]) {
    return `${displayName} had been Scoutified!

> ${scoutified}
`;
}

async function execute(interaction) {
    const input = interaction.options.get("message").value;

    const scoutified = scoutify(input);

    interaction.reply(formatShortened(chatCommandFormat, MAX_MESSAGE_LENGTH, [input, scoutified]));
}

async function executeOnMessage(interaction) {
    const displayName = interaction.targetMessage.author.displayName ?? interaction.targetMessage.author.username;

    const scoutified = visitMessageComponents(scoutify, interaction.targetMessage);

    scoutified.content = formatShortened(contextMenuCommandFormat, MAX_MESSAGE_LENGTH, [displayName, scoutified.content]);

    interaction.reply(scoutified);
}

export default { chat: { data, execute }, onMessage: { data: onMessageData, execute: executeOnMessage } };
