import { getCollection } from "./mongodb.js";
import { hardcodedWebhooks } from "../hardcoded-webhooks.js";

const collectionName = "Webhooks"
export const WebhookDatabase = {
    isConnected: true,

    async get({ channelId }) {
        const collection = getCollection(collectionName);

        const item = await collection.find({ _id: channelId }).next();

        // check if exists
        if (item /* && db[channelId].guildId == guildId*/) {
            return item;
        }

        // compute hardcoded if exists
        if (hardcodedWebhooks[channelId] /* && hardcodedWebhooks[channelId].guildId == guildId */) {
            console.log("Brought from hardcoded webhook data.");
            const info = hardcodedWebhooks[channelId];

            await WebhookDatabase.put(info);

            return info;
        }

        return null;
    },

    async put(info) {
        const collection = getCollection(collectionName);

        await collection.replaceOne({_id: info.channelId}, { _id: info.channelId, ...info }, {upsert: true});
    }

}