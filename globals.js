import env from "./env.json" assert { type: "json" };

export const baseDiscordApiUrl = "https://discord.com/api";

export function getJSONResponse(object) {
    return {
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + env.discordToken,
        },
        body: JSON.stringify(object),
    };
}