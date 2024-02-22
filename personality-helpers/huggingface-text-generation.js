import { textGeneration } from "@huggingface/inference";
import env from "../env.js";
import { getMessageResponse, getErrorResponse } from "../personality-helpers/standard-response.js";

const CONVERSATION_LENGTH_LIMIT = 6;

export class HuggingFaceTextGenerationConversation {
    constructor(myName, otherName, model, strip) {
        this.type = "HuggingFaceTextGenerationConversation";
        this.model = model;
        this.myName = myName;
        this.otherName = otherName;
        this.conversation = [];
        this.strip = strip;
    }

    /** Returns the error (to be console.errored) iff the conversation is going well on the code side. Also responds to the message if there is a problem.
     * 
     * @param {import("@huggingface/inference").ConversationalOutput} conversationalOutput 
     */
    pollConversationError(conversationalOutput) {
        return null;
    }

    /** Makes a conversational HuggingFace Inference API call and returns the formatted response as text.
     * 
     * @param {string} message 
     * @returns 
     */
    async respond(message) {
        const scope = this;
        this.lastMessage = message;

        console.log("responding");

        scope.conversation.push(message);

        const inputConversation = scope.conversation.join("\n");
        const conversationOutput = await textGeneration({
            accessToken: env.huggingfaceToken,
            model: scope.model,
            inputs: inputConversation,
        });

        const response = (() => {
            const value = conversationOutput.generated_text;
            if (this.strip) {
                return value.substring(inputConversation.length, value.length);
            } else {
                return value;
            }
        })();

        scope.conversation.push(response);
        while (scope.conversation.length > CONVERSATION_LENGTH_LIMIT) scope.conversation.shift();

        console.log("responded");

        return response;
    }

    async end() {}

    static hydrate(obj) {
        const conversation = new HuggingFaceTextGenerationConversation(obj.myName, obj.otherName, obj.model, obj.strip);
        conversation.conversation = obj.conversation;
        conversation.lastMessage = obj.lastMessage;

        return conversation;
    }
}