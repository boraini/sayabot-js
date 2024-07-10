import { kv } from "@vercel/kv";

export const BallotDB = {
    ballotDbConnected: false,

    async connect() {
        if (BallotDB.ballotDbConnected) return;

        BallotDB.ballotDbConnected = true;
    },

    async getBallotInfo(channelId, ballotId) {
        return kv.get(`ballot_info:${channelId}:${ballotId}`);
    },

    async getBallots() {
        return kv.get(`ballots`);
    },

    async getBallotMessageId(channelId, ballotId) {
        return kv.get(`ballot_message_id:${channelId}:${ballotId}`);
    },

    async putBallotMessageId(channelId, ballotId, messageId) {
        return kv.set(`ballot_message_id:${channelId}:${ballotId}`, messageId);
    },

    async getDummyBallotInfo() {
        return {
            version: 0,
            resultFormat: "Today is Thursday, which is time for me to announce that {WINNER} {IS/ARE} the gayest of all!",
            pollFormat: "For the next week, vote for the gayest among the {COUNT} below.",
            count: 3,
            optOut: [],
        }
    },
};