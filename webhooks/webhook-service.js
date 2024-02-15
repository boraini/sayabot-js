import { WebhookClient } from "discord.js"
import { WebhookDatabase } from "../database/webhook-database-mongodb.js";
import env from "../env.js";
import { baseDiscordApiUrl, getJSONResponse } from "../commands/webhook-endpoints.js";

function createWebhookEndpoint(channel) {
    return `${baseDiscordApiUrl}/channels/${channel.id}/webhooks`;
}

export const WebhookService = {
    /** Gets a WebhookClient object
     * 
     * @param {import("discord.js").Client}
     * @param {import("discord.js").TextChannel} channel 
     */
    async getChannelClientInfo(channel) {
        let info = await WebhookDatabase.get({channelId: channel.id});

        if (!info) {
            info = await WebhookService.createWebhook(channel, {
                name: "SayaBot Webhook",
                reason: "Send DDTalk messages with profile picture on this channel.",
            });
            if (!info.channelId && info.channel_id) info.channelId = info.channel_id;
            console.warn("Created new Webhook with the following information.");
            console.dir(info);
            await WebhookDatabase.put(info);
        }

        if (!info.token) {
            info.token = env.discordToken;
        }

        return info;
    },

    async getChannelClient(channel) {
        return WebhookService.getChannelClientInfo(channel).then(info => new WebhookClient(info));
    },

    async createWebhook(channel, options) {
        console.dir({
            url: createWebhookEndpoint(channel),
            fetchOptions: getJSONResponse(options)
        });
        return fetch(createWebhookEndpoint(channel), {
            ...getJSONResponse(options),
            method: "POST",
        }).then(r => r.json());
    }
}