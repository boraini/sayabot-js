import { HuggingFaceTextGenerationConversation } from "../personality-helpers/huggingface-text-generation.js";

const data = {
    nickname: "bard",
    description: "DistilGPT2. Write your story together with this bot, adding to it in turns!",
};

class Conversation extends HuggingFaceTextGenerationConversation {
    constructor(nickname) {
        super("Bard", nickname, "distilbert/distilgpt2", true);
    }
}

export default { data, Conversation };