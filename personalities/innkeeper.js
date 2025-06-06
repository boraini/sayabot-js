import { HuggingFaceTextGenerationConversation } from "../personality-helpers/huggingface-text-generation.js";

const data = {
    nickname: "innkeeper",
    description: "A DialoGPT model trained to help with concierge.",
};

class Conversation extends HuggingFaceTextGenerationConversation {
    constructor(nickname) {
        super("Innkeeper", nickname, "tosin/dialogpt_mwoz");
    }
}

export default { data, Conversation };