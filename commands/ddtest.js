import { SlashCommandBuilder } from "discord.js";

const data = new SlashCommandBuilder()
    .setName("ddtest")
    .setDescription("Responds with \"beep bop\"");

async function execute(interaction) {
    await interaction.reply("Whomst've summoned the almighty SayaBot!");
    await interaction.followUp("You like JavaScript, don't you?");
}

export default { data, execute };