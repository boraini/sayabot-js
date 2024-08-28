import { baseDiscordApiUrl, getJSONResponse } from "../commands/webhook-endpoints.js";
import env from "../env.js";

export default async function handle(req) {
    const requestJSON = await req.json();
    const { dashboardPassword, channelId, messageId, emoji, method } = requestJSON;

    try {
        if (env.dashboardPassword != dashboardPassword) {
            throw new Error("Not authorized.");
        }

        if (!(/^[0-9]+$/.test(channelId))) {
            throw new Error("Target message channel is not in a valid format.");
        }

        if (!(/^[0-9]+$/.test(messageId))) {
            throw new Error("Target message id is not in a valid format.");
        }

        console.log(emoji);

        if (!(/^[0-9]*(%[0-9A-Fa-f]{2})+$/.test(emoji))) {
            throw new Error("The emoji might not be URI encoded.");
        }

        if (!(method == "PUT" || method == "DELETE")) {
            throw new Error("The emoji action is invalid.");
        }

        const response = await fetch(`${baseDiscordApiUrl}/channels/${channelId}/messages/${messageId}/reactions/${emoji}/@me`, {
            method,
            ...getJSONResponse({}),
        });
        
        return response;
    } catch (e) {
        return new Response("Message sending failed with exception: " + e.message, { status: 502 });
    }
}
