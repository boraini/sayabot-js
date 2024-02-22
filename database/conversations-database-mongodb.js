import { getCollection } from "./mongodb.js";

const collectionName = "DDTalkConversations";

export const CurrentConversationsDatabase = {
    isPersistent: false,

    async get(username) {
        const collection = getCollection(collectionName);
        return await collection.findOne({ _id: username });
    },

    async put(username, conversation) {
        const collection = getCollection(collectionName);
        await collection.replaceOne({ _id: username }, { _id: username, lastInteraction: new Date(), ...conversation }, { upsert: true });
    },

    async exists(username) {
        const collection = getCollection(collectionName);
        return !!(await collection.findOne({ _id: username }));
    },

    async remove(username) {
        const collection = getCollection(collectionName);
        return collection.deleteOne({ _id: username });
    },
}