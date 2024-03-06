import { baseDiscordApiUrl, getJSONResponse } from "../commands/webhook-endpoints.js";
import env from "../env.js";

export const config = {
    runtime: "edge",
};

export default async function handle(req) {
    const requestJSON = await req.json();
    const { dashboardPassword, channelId, message } = requestJSON;
    console.log(dashboardPassword, env.dashboardPassword, channelId, message);

    try {
        if (env.dashboardPassword != dashboardPassword) {
            throw new Error("Not authorized.");
        }

        if (!(/^[0-9]+$/.test(channelId))) {
            throw new Error("Target message channel is not in a valid format.");
        }

        if (message.content && message.content.length > 2000) {
            throw new Error("Message is too long or not in valid format.");
        }

        const response = await fetch(`${baseDiscordApiUrl}/channels/${channelId}/messages`, {
            method: "POST",
            ...getJSONResponse(message),
        });

        return response;
    } catch (e) {
        return new Response("Message sending failed with exception: " + e.message, { status: 502 });
    }
}