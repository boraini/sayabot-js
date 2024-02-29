import { BallotDB } from "./ballot-database-vercel-kv.js";
import { getNextBallotMessage, postBallotMessage } from "./ballot-message.js";

export async function handleBallots() {
    await BallotDB.connect();
    const ballots = await BallotDB.getBallots();

    return Promise.all(ballots.map(({ channelId, ballotId}) => handleBallot(channelId, ballotId)));
}

export async function handleBallot(channelId, ballotId) {
    const [message, roster] = await getNextBallotMessage(channelId, ballotId);
    return postBallotMessage(channelId, ballotId, message, roster);
}