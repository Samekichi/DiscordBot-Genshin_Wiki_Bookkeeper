const { SlashCommandBuilder } = require('discord.js');
const { Users } = require('../../models');

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
        const userId = interaction.user.id;
        const isEphemeral = interaction.options.getBoolean("is_ephemeral");
        try {
            const count = await Users.getCommandCount(userId);
            interaction.reply({
                content: count == 0 ? `你还未曾调用过珐露珊前辈的斜线指令，这是第一次喔！` : `你已成功调用了 ${count} 次斜线指令！`,
                ephemeral: isEphemeral ?? true
            });
        } catch (error) {
            console.error(`Failed to fetch commanCount for ${userId}: ${error}`);
            interaction.reply({
                content: `Failed to fetch your slash command ocunt.`,
                ephemeral: true
            });
        }
    }
}