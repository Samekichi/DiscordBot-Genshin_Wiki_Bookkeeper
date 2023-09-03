const { SlashCommandBuilder } = require('discord.js');
const db = require("../../database.js");

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName(`slash_command_count`)
        .setDescription(`Shows the count of successful slash commands you've called.`)
        .addBooleanOption(option =>
            option
                .setName('is_ephemeral')
                .setDescription('Make the response only visible to you?')
        ),

    async execute(interaction) {
        // Fetch successful slash command count
        const globalName = interaction.user.globalName;
        const key = `${globalName}.slashCommandCount`;
        const count = await db.get(key) || 0;
        // Check if ephemeral or not
        const isEphemeral = interaction.options.getBoolean("is_ephemeral");
        interaction.reply({
            content: count == 0 ? `你还未曾调用过珐露珊前辈的斜线指令，这是第一次喔！` : `你已成功调用了 ${count} 次斜线指令！`,
            ephemeral: isEphemeral
        });
    }
}