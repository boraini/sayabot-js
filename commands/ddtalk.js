import { SlashCommandBuilder } from "discord.js";
import { personalities, hydrateConversation } from "../personalities/personalities.js";
import { CurrentConversationsDatabase } from "../database/conversations-database-mongodb.js";
import { getMessageResponse, getErrorResponse } from "../personality-helpers/standard-response.js";
import { WebhookService } from "../webhooks/webhook-service.js";
import { connectDb, disconnectDb } from "../database/mongodb.js";

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
async function sendResponse(interaction, conversation, response) {
    if (interaction.webhookClientPromise) {
        // No need to await this.
        interaction.editReply(conversation.lastMessage);
        const webhookClient = await interaction.webhookClientPromise;
        await webhookClient.send({
            content: response,
            avatarURL: conversation.webhookData.avatar,
            username: conversation.webhookData.displayName,
        });
    } else {
        await interaction.editReply(getMessageResponse(conversation, response));
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
    await interaction.deferReply();

    const otherIdentifier = interaction.user.username + "#" + interaction.user.discriminator;
    const input = interaction.options.get("message").value;

    let conversation;

    const foundConversation = await CurrentConversationsDatabase.get(otherIdentifier);
    if (foundConversation) {
        conversation = hydrateConversation(foundConversation);
        // Request webhook here so we save some time.
        if (conversation.webhookData && interaction.channel) {
            interaction.webhookClientPromise = WebhookService.getChannelClient(interaction.channel);
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
        await conversation.end();
        await CurrentConversationsDatabase.remove(otherIdentifier);
        await interaction.editReply(getErrorResponse(conversation, `Conversation with ${conversation.myName} ended successfully.`));
        return;
    }

    const response = await conversation.respond(input);
    await sendResponse(interaction, conversation, response);
}

/** Wrapper for ddtalk.executeInternal. If the execution gets a part that can be executed in parallel with interaction.deferReply, it
 * will be split using Promise.all in this function.
 * 
 * @param {*} interaction 
 * @returns 
 */
async function execute(interaction) {
    await connectDb();
    await executeInternal(interaction);
    // await disconnectDb();
}

export default { data, execute };