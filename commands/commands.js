import ddtest from "./ddtest.js";
import ddtalk from "./ddtalk.js";
import ddlung from "./ddlung.js";
import ddpikmin from "./ddpikmin.js";
import ddscout from "./ddscout.js";
// import breadman from "./breadman.js";
import braille from "./braille.js";

export function setCommands(client) {
    client.commands = new Map();
	// Slash commands
    client.commands.set("ddtest", ddtest.chat);
    client.commands.set("ddtalk", ddtalk.chat);
	client.commands.set("ddlung", ddlung.chat);
	client.commands.set("ddpikmin", ddpikmin.chat);
	client.commands.set("ddscout", ddscout.chat);
	// Message commands
	client.commands.set("Lungify this message", ddlung.onMessage);
	client.commands.set("Pikminify this message", ddpikmin.onMessage);
	client.commands.set("Scoutify this message", ddscout.onMessage);
	// client.commands.set("What does Breadman say?", breadman.onMessage);
	client.commands.set("Make Braille image", braille.onMessage);
}

/**
 * 
 * @param {*} client 
 * @param {import("discord.js").Interaction} interaction 
 */
export async function handleInteraction(client, interaction) {
    try {
		if (interaction.isMessageContextMenuCommand()) {
			const command = client.commands.get(interaction.commandName);

			if (!command) {
				await interaction.reply(`No command matching ${interaction.commandName} was found.`, { ephemeral: true });
			}

			await command.execute(interaction);
		}

		if (interaction.isChatInputCommand()) {
			const command = client.commands.get(interaction.commandName);

			if (!command) {
				await interaction.reply(`No command matching ${interaction.commandName} was found.`, { ephemeral: true });
			}

			await command.execute(interaction);
		}

		if (interaction.isButton()) {
			const commandName = interaction.message?.interaction?.commandName ?? interaction.message?.interaction?.name;
			if (!commandName) {
				await interaction.reply("Couldn't map to the command that showed you this button.", { ephemeral: true });
				return;
			}

			const command = client.commands.get(commandName);
			if (!command?.button) {
				await interaction.reply(`No command matching ${commandName} was found.`, { ephemeral: true });
				return;
			}

			await command.button(interaction, interaction.customId ?? interaction.data?.custom_id);
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
