# SayaBot Javascript Implementation

SayaBot is a Discord bot with which you can have conversations with AI-driven imaginary characters.

## Usage

Fill in env.json. You will need a MongoDB M0 cluster, a HuggingFace inference API token, and of course a Discord bot application. Once you have these, what you fill in in each field should be clear.

Afterwards, you have three options to run the bot. You can deploy it to AWS Lambda by uploading the repo contents there, which will be rather costly since the endpoint can hang for several seconds while HuggingFace inference API calls are made. You can also run the interaction endpoint on your machine and add it to your bot. Also, you can use a Discord.js client which uses the websocket connection method.

The corresponding commands to run these are
- `node .`
- `node index-polka.js`
- `node index-discord.js`