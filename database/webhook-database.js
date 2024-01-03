import { hardcodedWebhooks } from "../hardcoded-webhooks.js";

const db = {};

export const WebhookDatabase = {
    isPersistent: false,
    
    get({ channelId }) {
        // check if exists
        if (db[channelId] /* && db[channelId].guildId == guildId*/) {
            return db[channelId];
        }

        // compute hardcoded if exists
        if (hardcodedWebhooks[channelId] /* && hardcodedWebhooks[channelId].guildId == guildId */) {
            console.log("Brought from hardcoded webhook data.");
            const info = hardcodedWebhooks[channelId];

            db[channelId] = info;

            return info;
        }

        return null;
    },

    put(info) {
        db[info.channelId] = info;
    },
}