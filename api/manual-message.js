import { baseDiscordApiUrl, getJSONResponse, sendWebhookMessage } from "../commands/webhook-endpoints.js";
import { connectDb } from "../database/mongodb.js";
import env from "../env.js";

/**
 * @param {import("@vercel/node").VercelRequest} req 
 * @param {import("@vercel/node").VercelResponse} res 
 * @returns 
 */
export default async function handler(req, res) {
    const requestJSON = req.body;
    const { dashboardPassword, channelId, message, webhookData } = requestJSON;

    try {
        if (env.dashboardPassword != dashboardPassword) {
            throw new Error("Not authorized.");
        }

        if (!(/^[0-9]+$/.test(channelId))) {
            throw new Error("Target message channel is not in a valid format.");
        }

        if (message.message_reference?.message_id && message.message_reference?.message_id != "" && !(/^[0-9]+$/.test(message.message_reference.message_id))) {
            throw new Error("Replying to is not in a valid format.");
        }

        if (message.content && message.content.length > 2000) {
            throw new Error("Message is too long or not in valid format.");
        }

        let response;

        if (webhookData) {
            if (webhookData.avatar_url && !webhookData.avatar_url.startsWith("http")) {
                throw new Error("avatar_url needs to be an absolute URL with protocol.");
            }

            const WebhookService = (await import("../webhooks/webhook-service.js")).WebhookService;

            await connectDb();
            const webhookInfo = await WebhookService.getChannelClientInfo({ id: channelId });

            if (webhookInfo == null) {
                throw new Error("Failed to get/create webhook. Try sending a message without the personality.");
            }
            
            response = await sendWebhookMessage(webhookInfo, message, webhookData);
        } else {
            response = await fetch(`${baseDiscordApiUrl}/channels/${channelId}/messages`, {
                method: "POST",
                ...getJSONResponse(message),
            });
        }

        if (response.ok) {
            res.send("OK");
        } else {
            throw new Error(`Message failed to send with status ${response.statusText}: ${await response.text()}`);
        }

        
    } catch (e) {
        res.statusCode = 502;
        res.send("Message sending failed with exception: " + e.message);
    }
}
