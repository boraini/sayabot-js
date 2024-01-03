import { HuggingFaceConversation } from "../personality-helpers/huggingface.js";

const data = {
    nickname: "serial_designation_n",
    description: "Blenderbot 3B",
};

const webhookData = {
    avatar: "https://onedrive.live.com/embed?resid=F3E15A50CC3FBC45%2116223&authkey=%21ADeMqndRLvZ3Jvk&width=299&height=310",
    username: "sayabotxxxsdn",
    displayName: "Serial-Designation N",
};

class Conversation extends HuggingFaceConversation {
    constructor(nickname) {
        super("Serial-Designation N", nickname, "facebook/blenderbot-3B");
    }
}

export default { data, webhookData, Conversation };