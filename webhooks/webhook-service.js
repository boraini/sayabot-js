import { WebhookClient } from "discord.js"
import { WebhookDatabase } from "../database/webhook-database-mongodb.js";

export const WebhookService = {
    /** Gets a WebhookClient object
     * 
     * @param {import("discord.js").TextBasedChannel} channel 
     */
    async getChannelClient(channel) {
        let info = await WebhookDatabase.get({channelId: channel.id});

        if (!info) {
            info = await channel.createWebhook({
                name: "SayaBot Webhook",
                reason: "Send DDTalk messages with profile picture on this channel.",
            });
            console.warn("Created new Webhook with the following information.");
            console.dir(info);
            await WebhookDatabase.put(info);
        }

        return new WebhookClient(info);
    }
}