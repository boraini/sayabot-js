import { SlashCommandBuilder } from "discord.js";
import { personalities, hydrateConversation } from "../personalities/personalities.js";
import { CurrentConversationsDatabase } from "../database/conversations-database-mongodb.js";
import { getErrorResponse } from "../personality-helpers/standard-response.js";
import { getJSONResponse } from "./webhook-endpoints.js";
import { WebhookService } from "../webhooks/webhook-service.js";
import { connectDb, disconnectDb } from "../database/mongodb.js";
import { baseUrl } from "../globals.js";
import { deferReplyWebhook } from "./webhook-endpoints.js";

const data = new SlashCommandBuilder()
    .setName("ddtalk")
    .setDescription("Talk to someone")
    .addStringOption(option => option.setName("message").setDescription("\"end\" OR personality name OR message").setRequired(true));

const listOfPersonalities = Object.keys(personalities).map(n => `- ${n}`).join("\n");

/** Find the first personality whose nickname contains the provided query string.
 * 
 * @param {string} query 
 * @returns
 */
function findPersonality(query) {
    for (let [name, personality] of Object.entries(personalities)) {
        if (name.indexOf(query.toLowerCase()) != -1) {
            return personality;
        }
    }

    return null;
}

// PROBLEM: If the user starts a conversation and goes to DMs, the bot will crash because of interaction.channel
// { conversationInfo, interactionToken, channelWebhook, uniqueIdentifier }
async function callEdgeApi(conversationInfo, interactionToken, channelWebhook, otherIdentifier) {
    return new Promise((resolve) => {
        fetch(`${baseUrl}/api/ddtalk-edge`, {
            method: "POST",
            ...getJSONResponse({ conversationInfo, interactionToken, channelWebhook, otherIdentifier })
        }).then(resolve);
    })
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
    await deferReplyWebhook(interaction);
    const otherIdentifier = interaction.user.username + "#" + interaction.user.discriminator;
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
        const personality = findPersonality(input);
        if (personality) {
            conversation = new personality.Conversation(interaction.user.displayName);
            setupWebhook(interaction, personality, conversation);
            await CurrentConversationsDatabase.put(otherIdentifier, conversation);
            await interaction.editReply(getErrorResponse(conversation, `Conversation with ${conversation.myName} started successfully.
            > ${personality.data.description}`));
            return;
        } else {
            await interaction.editReply(getErrorResponse(conversation, `I don't know such person named ${input.substring(0, 1000)}.
            
            Here are the people I can connect you with:
            ${listOfPersonalities}`));
            return;
        }
    }

    if (input.toLowerCase() == "end") {
        conversation = hydrateConversation(conversation);
        await conversation.end();
        await CurrentConversationsDatabase.remove(otherIdentifier);
        await interaction.editReply(getErrorResponse(conversation, `Conversation with ${conversation.myName} ended successfully.`));
        return;
    }

    conversation.lastMessage = input;
    await callEdgeApi(conversation, interaction.token, webhookClientInfoPromise ? await webhookClientInfoPromise : undefined, otherIdentifier);
    if (!interaction.deferred) await interaction.deferReply();
}

/** Wrapper for ddtalk.executeInternal. If the execution gets a part that can be executed in parallel with interaction.deferReply, it
 * will be split using Promise.all in this function.
 * 
 * @param {*} interaction 
 * @returns 
 */
async function execute(interaction) {
    const timeoutPromise = new Promise(resolve => setTimeout(() => {if (!interaction.deferred) resolve()}, 3000));
    const executePromise = executeInternal(interaction);

    return Promise.race([timeoutPromise, executePromise]);
}

export default { data, execute };