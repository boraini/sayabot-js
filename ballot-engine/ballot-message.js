import { BallotDB } from "./ballot-database-vercel-kv.js";
import { baseDiscordApiUrl, getJSONResponse } from "../commands/webhook-endpoints.js";
import env from "../env.js";
import { getChannelMembers } from "./ballot-channel.js";

const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

export async function getBallotMessage(channelId, ballotId) {
    await BallotDB.connect();
    const obj = await BallotDB.getBallotMessageId(channelId, ballotId);
    if (!obj) return [null, null];

    const { id, roster } = obj;

    return [await fetch(`${baseDiscordApiUrl}/channels/${channelId}/messages/${id}`, {
        headers: {"Authorization": "Bot " + env.discordToken}
    }).then(r => {
        if (r.ok) return r.json();
        else return Promise.resolve(null);
    }), roster];
}

export async function postBallotMessage(channelId, ballotId, message, roster) {
    const sentMessage = await fetch(`${baseDiscordApiUrl}/channels/${channelId}/messages`, {
        method: "POST",
        ...getJSONResponse(message),
    }).then(r => r.json());

    return BallotDB.putBallotMessageId(channelId, ballotId, {id: sentMessage.id, roster});
}

export async function getNextBallotMessage(channelId, ballotId) {
    await BallotDB.connect();

    const ballotInfo = await BallotDB.getBallotInfo(channelId, ballotId);
    const channelMembers = await getChannelMembers(channelId);
    const [ballotMessage, roster] = await getBallotMessage(channelId, ballotId);

    console.log(ballotMessage, roster);

    let leadingText = "";
    
    if (ballotMessage && ballotMessage.reactions) {
        let currentMaxVotes = 0;
        let currentMaxIndex = -1;
        
        for (let i = 0; i < ballotInfo.count; i++) {
            const emoji = emojis[i];
            const reaction = ballotMessage.reactions.find(r => r.emoji.name == emoji);
            const votes = reaction?.count ?? 0;
            if (currentMaxVotes < votes) {
                currentMaxVotes = votes;
                currentMaxIndex = i;
            }
        }

        if (currentMaxIndex != -1) {
            const winnerId = roster[currentMaxIndex];

            leadingText = ballotInfo.resultFormat.replaceAll("{WINNER}", `<@${winnerId}>`).replaceAll("{COUNT}", ballotInfo.count) + "\n";
        }
    }

    const ballotText = ballotInfo.pollFormat.replaceAll("{COUNT}", ballotInfo.count);

    const drawCount = Math.min(ballotInfo.count, channelMembers.length);

    /** @type {string[]} */
    const candidates = drawCount == channelMembers.length ? channelMembers.map(m => m.user.id) : channelMembers.sort(() => 0.5 - Math.random()).slice(0, drawCount).map(m => m.user.id);

    const pollListText = candidates.map((id, i) => "- " + emojis[i] + ": " + `<@${id}>`).join("\n");

    return [{
        content: leadingText + ballotText + "\n" + pollListText,
        reactions: emojis.slice(0, drawCount).map(e => ({ emoji: {name: e}, count: 1 })),
    }, candidates];
}