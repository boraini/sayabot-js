import { BallotDB } from "./ballot-database-vercel-kv.js";
import { getNextBallotMessage, postBallotMessage, addBallotReactions } from "./ballot-message.js";

export async function handleBallots() {
    await BallotDB.connect();
    const ballots = await BallotDB.getBallots();

    return Promise.all(ballots.map(({ channelId, ballotId}) => handleBallot(channelId, ballotId)));
}

export async function handleBallot(channelId, ballotId) {
    const [message, roster] = await getNextBallotMessage(channelId, ballotId);
    const sentMessage = await postBallotMessage(channelId, ballotId, message, roster);
    return addBallotReactions(channelId, sentMessage.id, roster.length);
}
