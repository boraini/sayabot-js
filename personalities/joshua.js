import { HuggingFaceConversation } from "../personality-helpers/huggingface.js";

const data = {
    nickname: "joshua",
    description: "A GPT-3 model trained to imitate Joshua from *The World Ends With You.*",
};

class Conversation extends HuggingFaceConversation {
    constructor(nickname) {
        super("Joshua", nickname, "ThatSkyFox/DialoGPT-small-joshua");
    }
}

export default { data, Conversation };