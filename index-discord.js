import { Client, REST } from "discord.js";

function getClient() {
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
        ],
    });

    client.on("ready", () => {
        console.log(`Logged in as ${client.user.tag}!`);
    });

    setCommands(client);

    client.on(Events.InteractionCreate, interaction => {
        console.log(interaction.toJSON());
        handleInteraction(client, interaction);
    });

    return client;
}

if (process.argv.some(s => s == "nodiscord")) {
    const client = {};
    setCommands(client);
    const ddtalk = client.commands.get("ddtalk");

    const readLineInterface = ReadLine.createInterface({ input: process.stdin, output: process.stdout });
    const interactionDummy = {
        options: new Map(),
        user: {
            username: "olivia",
            displayName: "Olivia",
            discriminator: "0",
        },
        async deferReply() {
            console.log("Interaction deferred");
        },
        async editReply(msg) {
            console.log("EDIT REPLY " + msg);
        },
        async reply(msg) {
            console.log("REPLY " + msg);
        },
    }
    while (true) {
        const input = await readLineInterface.question("");
        interactionDummy.options.set("message", { value: input });
        const output = await ddtalk.execute(interactionDummy);
        console.log(output);
    }
} else {
    await connectDb();
    const client = getClient();

    client.login(env.discordToken);

    const rest = new REST().setToken(env.discordToken);

    await (async () => {
        try {
            const commandDescs = [];

            for (let [name, command] of client.commands) {
                commandDescs.push(command.data.toJSON());
            }
            
            const data = await rest.put(
                //Routes.applicationGuildCommands(env.clientId, ""),
                Routes.applicationCommands(env.clientId),
                { body: commandDescs }
            );
        } catch (e) {
            console.warn("Error while registering the commands.");
            console.warn(e);
        }
    })();
}