// This file is supposed to be importable from both a full-fledged and an edge environment! Please use only edge-enabled imports.
import { hydrateConversation } from "../personalities/personalities.js";
import { editReply, sendWebhookMessage } from "../commands/webhook-endpoints.js";

export async function ddtalkInference({ conversationInfo, interactionToken, channelWebhook, otherIdentifier }) {
    let conversation;

    try {
        conversation = hydrateConversation(conversationInfo);
    } catch (e) {
        console.error(e);
        await editReply({ token: interactionToken }, `The conversation data seems to be corrupt. Please consider ending it and start a new one.`);
        throw new Error("ERROR");
    }

    let response;

    try {
        response = await conversation.respond(conversation.lastMessage);
    } catch (e) {
        console.error(e);
        await editReply({ token: interactionToken }, `There is something wrong with ${conversation.myName}. Consider ending this conversation with them and starting a new one.`);
        throw new Error("ERROR");
    }

    if (channelWebhook) {
        await editReply({ token: interactionToken }, conversation.lastMessage);
        await sendWebhookMessage(channelWebhook, response, conversation.webhookData);
    } else {
        await editReply({ token: interactionToken }, getMessageResponse(conversation, response));
    }

    return conversation;
}
