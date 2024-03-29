import { HuggingFaceTextGenerationConversation } from "../personality-helpers/huggingface-text-generation.js";

const data = {
    nickname: "joshua",
    description: "A GPT-3 model trained to imitate Joshua from *The World Ends With You.*",
};

class Conversation extends HuggingFaceTextGenerationConversation {
    constructor(nickname) {
        super("Joshua", nickname, "ThatSkyFox/DialoGPT-small-joshua", true);
    }
}

export default { data, Conversation };