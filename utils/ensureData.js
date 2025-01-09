const { Users, Guilds, GuildMembers } = require("../models");

const ensureData = async (interaction) => {
    const userId = interaction.user.id;
    const guildId = interaction.guildId;
    const memberInstance = interaction.member;
    const guildInstance = interaction.guild;

    try {
        const guildMember = await GuildMembers.getOrCreateGuildMember(userId, guildId, memberInstance, guildInstance);
        console.log(`User ${memberInstance.user.username} and guild ${guildInstance.name} are synced.`);

    } catch (error) {
        console.error("Error ensuring data for interaction: ", error);
        throw new Error("Failed to sync user & guild data for interaction.")
    }
}



module.exports = { ensureData };