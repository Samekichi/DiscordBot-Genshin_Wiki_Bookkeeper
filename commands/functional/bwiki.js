const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bwiki')
        .setDescription("Returns the Genshin Bwiki item of the phrase.")
        .addStringOption(option =>
            option
                .setName('content')
                .setDescription('Content to search in BWiki.')
                .setRequired(true)
        ),

    async execute(interaction) {
        const content = interaction.options.getString('content');
        formattedContent = content.trim().split(" ").join("_");
        const url = `https://wiki.biligame.com/ys/${encodeURIComponent(formattedContent)}`;
        await interaction.reply(`${url}`);
    }
}