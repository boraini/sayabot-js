import { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } from "discord.js";
import { hydrateConversation, personalities } from "../personalities/personalities.js";
import { CurrentConversationsDatabase } from "../database/conversations-database-mongodb.js";
import { getErrorResponse } from "../personality-helpers/standard-response.js";
import { getJSONResponse } from "./webhook-endpoints.js";
import { WebhookService } from "../webhooks/webhook-service.js";
import { connectDb } from "../database/mongodb.js";
import { baseUrl } from "../globals.js";
import { deferReplyWebhook } from "./webhook-endpoints.js";
import { findPersonality } from "../personalities/personalities.js";
import { ddtalkInference } from "../ddtalk/ddtalk-inference.js";

const data = new SlashCommandBuilder()
    .setName("ddtalk")
    .setDescription("Talk to someone")
    .addStringOption(option => option.setName("message").setDescription("\"end\" OR personality name OR message").setRequired(true));

const personalityButtons = (() => {
    const MAX_CHARS_PER_ROW = 30;
    const MAX_ITEMS_PER_ROW = 5;
    const listOfPersonalities = Object.keys(personalities);
    const rows = [];
    let row = new ActionRowBuilder();
    let currentRowCharLen = 0;
    let currentRowItemLen = 0;
    for (let name of listOfPersonalities) {
        if (name.length + currentRowCharLen > MAX_CHARS_PER_ROW || currentRowItemLen >= MAX_ITEMS_PER_ROW) {
            if (currentRowItemLen > 0) rows.push(row);
            row = new ActionRowBuilder();
            currentRowCharLen = 0;
            currentRowItemLen = 0;
        }
        row.addComponents(new ButtonBuilder().setCustomId(name).setStyle(ButtonStyle.Secondary).setLabel(name));
        currentRowCharLen += name.length;
        currentRowItemLen += 1;
    }
    if (currentRowItemLen > 0) {
        rows.push(row);
    }
    return rows;
})();

// PROBLEM: If the user starts a conversation and goes to DMs, the bot will crash because of interaction.channel
// { conversationInfo, interactionToken, channelWebhook, uniqueIdentifier }
async function callEdgeApi(conversationInfo, interactionToken, channelWebhook, otherIdentifier) {
    if (process.env.GATEWAY) {
        return ddtalkInference({ conversationInfo, interactionToken, channelWebhook, otherIdentifier })
            .then(conversation => CurrentConversationsDatabase.put(otherIdentifier, conversation))
            .catch(console.error)
    } else {
        return fetch(`${baseUrl}/api/ddtalk-edge/`, {
            method: "POST",
            ...getJSONResponse({ conversationInfo, interactionToken, channelWebhook, otherIdentifier })
        });
    }
}

function setupWebhook(interaction, personality, conversation) {
    if (interaction.channel && personality.webhookData) {
        conversation.webhookData = personality.webhookData;
    }
}

/** Handle interaction as a /ddtalk slash command
 * 
 * @param {import("discord.js").ChatInputCommandInteraction} interaction 
 */
async function executeInternal(interaction) {
    const isGateway = !!process.env.GATEWAY;

    if (isGateway) {
        await interaction.deferReply();
    } else {
        await deferReplyWebhook(interaction);
    }
    const otherIdentifier = interaction.user.id;
    const input = interaction.options.get("message").value;

    let conversation;

    await connectDb();
    const foundConversation = await CurrentConversationsDatabase.get(otherIdentifier);

    let webhookClientInfoPromise;

    if (foundConversation) {
        conversation = foundConversation;
        // Request webhook here so we save some time.
        if (conversation.webhookData && interaction.channel) {
            webhookClientInfoPromise = WebhookService.getChannelClientInfo(interaction.channel);
        }
    } else {
        return buttonInternal(interaction, input);
    }

    if (input.toLowerCase() == "end") {
        conversation = hydrateConversation(conversation);
        await conversation.end();
        await CurrentConversationsDatabase.remove(otherIdentifier);
        await interaction.editReply(getErrorResponse(conversation, `Conversation with ${conversation.myName} ended successfully.`));
        return;
    }

    conversation.lastMessage = input;

    const edgeApiPromise = (webhookClientInfoPromise
        ? webhookClientInfoPromise.then(
            // channel uses webhooks and webhook is OK
            webhookClientInfo => callEdgeApi(conversation, interaction.token, webhookClientInfo, otherIdentifier),
            // channel could use webhooks but/or the webhook is not OK (webhook could not be created)
            () => callEdgeApi(conversation, interaction.token, undefined, otherIdentifier)
        )
        // channel does not use webhooks (DMs)
        : callEdgeApi(conversation, interaction.token, undefined, otherIdentifier)
    );

    if (!interaction.deferred) await interaction.deferReply();

    if (!isGateway) await edgeApiPromise;
}

/** Wrapper for ddtalk.executeInternal. If the execution gets a part that can be executed in parallel with interaction.deferReply, it
 * will be split using Promise.all in this function.
 * 
 * @param {*} interaction 
 * @returns 
 */
async function execute(interaction) {
    if (process.env.GATEWAY) {
        return executeInternal(interaction);
    } else {
        const timeoutPromise = new Promise(resolve => setTimeout(() => {if (!interaction.deferred) resolve()}, 3000));
        const executePromise = executeInternal(interaction);

        return Promise.race([timeoutPromise, executePromise]);
    }
}

async function buttonInternal(interaction, customId) {
    const otherIdentifier = interaction.user.id;
    const personality = findPersonality(customId);
    if (personality) {
        const conversation = new personality.Conversation(interaction.user.displayName);
        setupWebhook(interaction, personality, conversation);
        await CurrentConversationsDatabase.put(otherIdentifier, conversation);
        await interaction.editReply(getErrorResponse(conversation, `Conversation with ${conversation.myName} started successfully.
> ${personality.data.description}`));
        return;
    } else {
        const response = {
            content: getErrorResponse(null, `I don't know such person named ${customId.substring(0, 1000)}.

Here are the people I can connect you with:`),
            components: [...personalityButtons],
        }
        await interaction.editReply(response);
        return;
    }
}

async function button(interaction, customId) {
    await Promise.all([interaction.deferReply(), connectDb()]);
    return buttonInternal(interaction, customId);
}

export default { chat: { execute, data, button } }
