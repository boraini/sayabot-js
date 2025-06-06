import { HuggingFaceTextGenerationConversation } from "../personality-helpers/huggingface-text-generation.js";
import webhookPersonalities from "../webhooks/webhook-personalities.js";

const data = {
    nickname: "serial_designation_n",
    description: "Blenderbot 3B",
};

const webhookData = webhookPersonalities["serial_designation_n"];

class Conversation extends HuggingFaceTextGenerationConversation {
    constructor(nickname) {
        super("Serial-Designation N", nickname, "facebook/blenderbot-3B");
    }
}

export default { data, webhookData, Conversation };