import { baseDiscordApiUrl } from "../commands/webhook-endpoints.js";
import env from "../env.js"

const MAX_MEMBERS_TO_LIST = 100;

export async function getChannelMembers(channelId) {
    const channel = await fetch(`${baseDiscordApiUrl}/channels/${channelId}`, {headers: {Authorization: "Bot " + env.discordToken}}).then(r => r.json());

    const guildId = channel.guild_id;

    const members = await fetch(`${baseDiscordApiUrl}/guilds/${guildId}/members?limit=${MAX_MEMBERS_TO_LIST}`, {headers: {Authorization: "Bot " + env.discordToken}}).then(r => r.json());
    
    return members;
}