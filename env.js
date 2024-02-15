const values = {
    "clientPublicKey": process.env.DISCORD_CLIENT_PUBLIC_KEY,
    "clientId": process.env.DISCORD_CLIENT_ID,
    "discordToken": process.env.DISCORD_TOKEN,
    "huggingfaceToken": process.env.HUGGINGFACE_TOKEN,
    "mongodbUri": process.env.MONGODB_URI,
};

/** Even more spaghetti code yay. */
export function reloadEnv() {
    Object.assign(values, {
        "clientPublicKey": process.env.DISCORD_CLIENT_PUBLIC_KEY,
        "clientId": process.env.DISCORD_CLIENT_ID,
        "discordToken": process.env.DISCORD_TOKEN,
        "huggingfaceToken": process.env.HUGGINGFACE_TOKEN,
        "mongodbUri": process.env.MONGODB_URI,
    });
}

export default values;