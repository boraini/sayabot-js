/**Replace supported parts of the message with the string mapping function
 * 
 * Currently this includes
 *  - main message content
 *  - rich-type embeds
 * 
 * @param { (content: string) => string } fn
 * @param { import("discord.js").Message } message
 */
export function visitMessageComponents(fn, message) {
    const new_message = {};

    if (message.content || message.content == "") {
        new_message.content = fn(message.content);
    }

    if (message.embeds) {
        /** @type { Partial<import("discord.js").Embed> } */
        const new_embeds = [];

        for (let embed of message.embeds) {
            if (embed.type == "rich") {
                if (embed.author) {
                    if (embed.author.name) embed.author.name = fn(embed.author.name);
                }
                if (embed.title) embed.title = fn(embed.title);
                if (embed.description) embed.description = fn(embed.description);
                if (embed.footer) {
                    if (embed.footer.text) embed.footer.text = fn(embed.footer.text);
                }

                new_embeds.push(embed);
            }
        }

        new_message.embeds = new_embeds;
    }

    return new_message;
}