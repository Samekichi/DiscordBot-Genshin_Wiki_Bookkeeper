const { SlashCommandBuilder } = require("discord.js");
const { Users, Titles, UserTitles } = require("../../../models");

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
        .addStringOption(
            (option) =>
                option
                    .setName("category")
                    .setDescription("The category of the title (default to `basic`.)")
                    .setMaxLength(255)
                    .setRequired(false)
            // TODO: Provide choices for existing categories (by Guild). Auto-add new category to Guild DB if not exist.
        ),

    async execute(interaction) {
        const userId = interaction.user.id;
        // Ensure user exists
        const user = await Users.getOrCreateUser(userId);
        // Check if user already has custom title
        const userTitles = await UserTitles.getTitlesByUserId({
            userId: userId,
            isCustom: true,
        });
        if (userTitles.length > 0) {
            console.log(userTitles[0]);
            interaction.reply({
                content: `You already have a personalized title "${userTitles[0].title.name
                    }${userTitles[0].title.description
                        ? ": " + userTitles[0].title.description
                        : ""
                    }". You can only have one personalized title.`,
            });
            return;
        }
        // Create a new title
        const titleName = interaction.options.getString("title_name");
        const description = interaction.options.getString("description") || null;
        const category = interaction.options.getString("category") || "BASIC";

        try {
            const title = await Titles.createTitle(
                titleName,
                description,
                category,
                userId
            );
            const userTitle = await UserTitles.grantTitle({
                userId: user.userId,
                titleId: title.titleId,
                grantedBy: user.userId,
                isCustom: true,
                isSystemGrant: false,
                isActive: true,
            });

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
            console.error(`Failed to create personal title for ${userId}: ${error}`);
            interaction.reply({
                content: `Failed to create your personal title: ${error}`,
                ephemeral: true,
            });
        }
    },
};
