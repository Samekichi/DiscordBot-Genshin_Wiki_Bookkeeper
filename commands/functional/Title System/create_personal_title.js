const { SlashCommandBuilder } = require("discord.js");
const { Users, Titles, UserTitles, Guilds, GuildMembers, sequelize } = require("../../../models");

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName(`create_personal_title`)
        .setDescription(`Create a personalized title for yourself.`)
        .addStringOption((option) =>
            option
                .setName("title_name")
                .setDescription("The name of the title you want to create.")
                .setRequired(true)
                .setMaxLength(255)
        )
        .addStringOption((option) =>
            option
                .setName("description")
                .setDescription("The description of the title.")
                .setMaxLength(255)
                .setRequired(false)
        )   
        // .addStringOption(
        //     (option) =>
        //         option
        //             .setName("type")
        //             .setDescription("The type of the title.")
        //             .setMaxLength(255)
        //             .setRequired(false)
        // )
        ,

    async execute(interaction) {

        const userId = interaction.user.id;
        const guildId = interaction.guildId;

        // Check if user already has custom title
        const userTitles = await UserTitles.getTitlesByUserId({
            userId: userId,
            guildId: guildId,
            isCustom: true,
        });
        if (userTitles.length > 0) {
            console.log(userTitles[0]);
            interaction.reply({
                content: `You already have a personalized title "${userTitles[0].title.name
                    }${userTitles[0].title.description
                        ? ": " + userTitles[0].title.description
                        : ""
                    }". \nYou can only have one personalized title.`,
                    ephemeral: true,
            });
            return;
        }

        // Check para validity
        const name = interaction.options.getString("title_name");
        const description = interaction.options.getString("description") || null;

        // Create a new title atomically
        const transaction = await sequelize.transaction();
        try {
            const title = await Titles.createTitle(
                {
                    name,
                    description,
                    createdBy: userId,
                    guildId,
                    isCustom: true,
                }, 
                { transaction }
            );
            await UserTitles.grantTitle(
                {
                    userId: userId,
                    titleId: title.titleId,
                    grantedBy: userId,
                    isSystemGrant: false,
                    isActive: true,
                }, 
                { transaction }
            );

            await transaction.commit();

            interaction.reply({
                content:
                    title != null
                        ? `Congrats! You now have your own title "${title.name}"!`
                        : `Failed to create your personal title.`,
                ephemeral:
                    title != null 
                        ? false 
                        : true,
            });
        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            } 
            console.error(`Failed to create personal title for ${userId}: ${error}`);
            interaction.reply({
                content: `Failed to create your personal title: ${error}`,
                ephemeral: true,
            });
        }
    },
};
