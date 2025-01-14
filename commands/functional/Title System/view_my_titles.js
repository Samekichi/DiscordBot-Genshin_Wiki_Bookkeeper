const { SlashCommandBuilder } = require("discord.js");
const { Titles, UserTitles } = require("../../../models")

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName(`view_my_titles`)
        .setDescription(`Show all the titles you have in this server.`),
    
    async execute(interaction) {
        const userId = interaction.user.id;
        const guildId = interaction.guildId;

        // Fetch all titles for this user in this guild
        const allUserTitles = await UserTitles.getTitlesByUserId(
            {
                userId: userId,
                guildId: guildId,
            },
            { fields: [], titleFields: ["name", "description"] }
        );
        // TODO: Format titles
        console.log(allUserTitles);
        // Reply
        interaction.reply({
            content: JSON.stringify(allUserTitles),
            ephermeral: true,
        });
    }
}
