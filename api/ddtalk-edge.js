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

    console.log(req.body);
    console.dir(res);

    const { conversationInfo, interactionToken, channelWebhook, otherIdentifier } = await req.json();

    let conversation;

    try {
        conversation = hydrateConversation(conversationInfo);
    } catch (e) {
        console.error(e);
        await editReply({ token: interactionToken }, `The conversation data seems to be corrupt. Please consider ending it and start a new one.`);
        return new Response("ERROR");
    }

    let response;

    try {
        response = await conversation.respond(conversation.lastMessage);
    } catch (e) {
        console.error(e);
        await editReply({ token: interactionToken }, `There is something wrong with ${conversation.myName}. Consider ending this conversation with them and starting a new one.`);
        return new Response("ERROR");
    }

    if (channelWebhook) {
        await editReply({ token: interactionToken }, conversation.lastMessage);
        await sendWebhookMessage(channelWebhook, response, conversation.webhookData);
    } else {
        await editReply({ token: interactionToken }, getMessageResponse(conversation, response));
    }

    await fetch(`${baseUrl}/api/ddtalk-save-conversation/?uniqueIdentifier=${otherIdentifier.replace("#", "%23")}`, {
        method: "POST",
        ...getJSONResponse(conversation),
    })

    return new Response(response);
}