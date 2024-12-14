const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { Users, Titles, UserTitles } = require("../../../models");

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName(`create_guild_title`)
        .setDescription(`Create a title for your current guild.`)
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
                    .setDescription("The category of the title (default to `BASIC`.)")
                    .setMaxLength(255)
                    .setRequired(false)
            // TODO: Provide choices for existing categories (by Guild). Auto-add new category to Guild DB if not exist.
        ),

    async execute(interaction) {
        // Ensure user is permitted
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            interaction.reply({
                content: `You must be an administrator to create a guild title.`,
            })
            return;
        }
        // Ensure creator exists
        const userId = interaction.user.id;
        const user = await Users.getOrCreateUser(userId, interaction.user);

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
            interaction.reply({
                content:
                    title != null
                        ? `Successfully created guild title "${title.name}${title.description
                        ? ": " + title.description
                        : ""
                    }"!`
                        : `Failed to create guild title.`,
                ephemeral:
                    title != null 
                        ? false 
                        : true,
            });
        } catch (error) {
            console.error(`Failed to create guild title by ${userId}: ${error}`);
            interaction.reply({
                content: `Failed to create guild title: ${error}`,
                ephemeral: true,
            });
        }
    }
};