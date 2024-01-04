const data = {
    nickname: "reverse",
    description: "Reverses the input.",
};

const webhookData = {
    username: "sayabotxxxrev",
    displayName: "Reverse",
};

class Conversation {
    constructor(otherName) {
        this.type = "ReverseConversation";
        this.myName = "Reverse";
        this.otherName = otherName;
    }

    /** Makes a conversational HuggingFace Inference API call and returns the formatted response as text.
     * 
     * @param {string} message 
     * @returns 
     */
    async respond(message) {
        this.lastMessage = message;
        return message.split("").reverse().join("");
    }

    async end() {}

    static hydrate(obj) {
        return new Conversation(obj.otherName);
    }
}

export default { data, webhookData, Conversation };