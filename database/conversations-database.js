export const CurrentConversationsDatabase = {
    isPersistent: false,
    conversations: new Map(),

    get(username) {
        return CurrentConversationsDatabase.conversations.get(username);
    },

    put(username, conversation) {
        CurrentConversationsDatabase.conversations.set(username, conversation);
    },

    exists(username) {
        return CurrentConversationsDatabase.conversations.has(username);
    },

    remove(username) {
        CurrentConversationsDatabase.conversations.delete(username);
    },
}