import { editReply, sendWebhookMessage, getJSONResponse } from "../commands/webhook-endpoints.js";
import { hydrateConversation } from "../personalities/personalities.js";
import { getMessageResponse } from "../personality-helpers/standard-response.js";
import { baseUrl } from "../globals.js";

/** @type {import("next").PageConfig} */
export const config = {
    runtime: "edge", 
};

/**
 * 
 * @param {import("@vercel/node").VercelRequest} req 
 * @param {import("@vercel/node").VercelResponse} res 
 * @returns 
 */
export default async function handler(req, res) {
    if (req.method != "POST") {
        res.status(405).send("Method Not Allowed");
    }

    const { conversationInfo, interactionToken, channelWebhook, otherIdentifier } = req.body;

    const conversation = hydrateConversation(conversationInfo);

    let response;

    try {
        response = await conversation.respond(conversation.lastMessage);
    } catch (e) {
        editReply({ token: interactionToken }, `There is something wrong with ${conversation.myName}. Consider ending this conversation with them and starting a new one.`);
        res.send("ERROR");
        return;
    }

    if (channelWebhook) {
        editReply({ token: interactionToken }, conversation.lastMessage);
        sendWebhookMessage(channelWebhook, response, conversation.webhookData);
    } else {
        editReply({ token: interactionToken }, getMessageResponse(conversation, response));
    }

    await fetch(`${baseUrl}/api/ddtalk-save-conversation?uniqueIdentifier=${otherIdentifier}`, {
        method: "POST",
        ...getJSONResponse(conversation),
    })

    res.send(response);
}