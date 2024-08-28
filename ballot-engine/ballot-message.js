import { BallotDB } from "./ballot-database-vercel-kv.js";
import { baseDiscordApiUrl, getJSONResponse, sendAllReactions } from "../commands/webhook-endpoints.js";
import env from "../env.js";
import { getChannelMembers } from "./ballot-channel.js";
import { sampleWithoutReplacement } from "./util.js";

const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

/** @typedef {{version: number, count: number, resultFormat: string, pollFormat: string, optOut?: string[], optIn?: string[]}} BallotInfo */

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

    await BallotDB.putBallotMessageId(channelId, ballotId, {id: sentMessage.id, roster});

    return sentMessage;
}

export async function getNextBallotMessage(channelId, ballotId) {
    await BallotDB.connect();

    /** @type {BallotInfo} */
    const ballotInfo = await BallotDB.getBallotInfo(channelId, ballotId) ?? await BallotDB.getDummyBallotInfo();

    const channelMembers = await getChannelMembers(channelId);
    const [ballotMessage, roster] = await getBallotMessage(channelId, ballotId);

    let leadingText = "";
    
    if (ballotMessage && ballotMessage.reactions) {
        let currentMaxVotes = 0;
        let currentMaxIndex = -1;

        const allVotes = [];
        
        for (let i = 0; i < ballotInfo.count; i++) {
            const emoji = emojis[i];
            const reaction = ballotMessage.reactions.find(r => r.emoji.name == emoji);
            const votes = reaction?.count ?? 0;
            allVotes.push(votes);
            if (currentMaxVotes < votes) {
                currentMaxVotes = votes;
                currentMaxIndex = i;
            }
        }

        if (currentMaxIndex != -1) {
            const winnerIds = [];
            for (let i = 0; i < ballotInfo.count; i++) {
                if (allVotes[i] >= currentMaxVotes) {
                    winnerIds.push(roster[i]);
                }
            }

            const isAre = winnerIds.length == 1 ? "is" : "are";

            leadingText = ballotInfo.resultFormat
                .replaceAll("{WINNER}", winnerIds.map(winnerId => `<@${winnerId}>`).join(", "))
                .replaceAll("{COUNT}", ballotInfo.count)
                .replaceAll("{IS/ARE}", isAre) + "\n";
        }
    }

    const ballotText = ballotInfo.pollFormat.replaceAll("{COUNT}", ballotInfo.count);
    
    let eligibleMembers = channelMembers;

    if (ballotInfo.optOut) {
        eligibleMembers = eligibleMembers.filter(u => u.roles && ballotInfo.optOut.every(r => !u.roles.includes(r)));
    }

    if (ballotInfo.optIn) {
        eligibleMembers = eligibleMembers.filter(u => u.roles && ballotInfo.optIn.some(r => u.roles.includes(r)));
    }

    const drawCount = Math.min(ballotInfo.count, eligibleMembers.length);

    /** @type {string[]} */
    let candidates = drawCount == eligibleMembers.length ? eligibleMembers.map(m => m.user.id) : sampleWithoutReplacement(eligibleMembers, drawCount).map(m => m.user.id);

    const pollListText = candidates.map((id, i) => "- " + emojis[i] + ": " + `<@${id}>`).join("\n");

    return [{
        content: leadingText + ballotText + "\n" + pollListText,
        reactions: emojis.slice(0, drawCount).map(e => ({ emoji: {name: e}, count: 1 })),
    }, candidates];
}

export async function addBallotReactions(channelId, messageId, drawCount) {
    return sendAllReactions(channelId, messageId, emojis.slice(0, drawCount), 500);
}
