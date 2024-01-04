import env from "./env.js";

export const baseDiscordApiUrl = "https://discord.com/api";

export function getJSONResponse(object) {
    return {
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bot " + env.discordToken,
        },
        body: JSON.stringify(object),
    };
}