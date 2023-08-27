const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fandom')
        .setDescription("Returns the Genshin Fandom Wiki item of the phrase.")
        .addStringOption(option =>
            option
                .setName('content')
                .setDescription('Content to search in Fandom.')
                .setRequired(true)
        ),

    async execute(interaction) {
        const content = interaction.options.getString('content');
        // format spaces to underscores
        formattedContent = content.trim().split(" ").join("_");
        const url = `https://genshin-impact.fandom.com/wiki/${encodeURIComponent(formattedContent)}`;
        await interaction.reply(`${url}`);
    }
}