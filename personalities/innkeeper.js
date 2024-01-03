import { HuggingFaceConversation } from "../personality-helpers/huggingface.js";

const data = {
    nickname: "innkeeper",
    description: "A DialoGPT model trained to help with concierge.",
};

class Conversation extends HuggingFaceConversation {
    constructor(nickname) {
        super("Innkeeper", nickname, "tosin/dialogpt_mwoz");
    }
}

export default { data, Conversation };