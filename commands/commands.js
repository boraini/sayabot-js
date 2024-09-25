import ddtest from "./ddtest.js";
import ddtalk from "./ddtalk.js";
import ddlung from "./ddlung.js";
import ddpikmin from "./ddpikmin.js";
import ddscout from "./ddscout.js";
import breadman from "./breadman.js";

export function setCommands(client) {
    client.commands = new Map();
	// Slash commands
    client.commands.set("ddtest", ddtest);
    client.commands.set("ddtalk", ddtalk);
	client.commands.set("ddlung", ddlung);
	client.commands.set("ddpikmin", ddpikmin);
	client.commands.set("ddscout", ddscout);
	// Message commands
	client.commands.set("Lungify this message", ddlung.onMessage);
	client.commands.set("Pikminify this message", ddpikmin.onMessage);
	client.commands.set("Scoutify this message", ddscout.onMessage);
	client.commands.set("What does Breadman say?", breadman.onMessage);
}

export async function handleInteraction(client, interaction) {
    try {
		if (interaction.isMessageContextMenuCommand()) {
			const command = client.commands.get(interaction.commandName);
			await command.executeOnMessage(interaction);
		}

		if (interaction.isChatInputCommand()) {
			const command = client.commands.get(interaction.commandName);

			if (!command) {
				throw new Error(`No command matching ${interaction.commandName} was found.`);
			}

			await command.execute(interaction);
		}
    } catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp('There was an error while executing this command!', { ephemeral: true });
		} else {
			await interaction.reply('There was an error while executing this command!', { ephemeral: true });
		}
	}
}
