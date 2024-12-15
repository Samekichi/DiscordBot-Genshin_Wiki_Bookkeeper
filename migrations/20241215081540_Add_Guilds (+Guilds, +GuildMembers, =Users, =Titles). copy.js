const Sequelize = require("sequelize");

/**
 * Actions summary:
 *
 * createTable() => "guilds", deps: [users]
 * createTable() => "guild_members", deps: [guilds, users]
 * addColumn(guildId) => "titles"
 *
 */

const info = {
    revision: 6,
    name: "Add Guilds (+Guilds, +GuildMembers, =Users, =Titles).",
    created: "2024-12-15T08:15:40.121Z",
    comment: "",
};

const migrationCommands = (transaction) => [
    {
        fn: "createTable",
        params: [
            "guilds",
            {
                guildId: {
                    type: Sequelize.STRING,
                    field: "guildId",
                    primaryKey: true,
                    allowNull: false,
                },
                name: { type: Sequelize.STRING, field: "name" },
                nameAcronym: { type: Sequelize.STRING, field: "nameAcronym" },
                description: { type: Sequelize.STRING, field: "description" },
                icon: { type: Sequelize.STRING, field: "icon" },
                ownerId: {
                    type: Sequelize.STRING,
                    onUpdate: "CASCADE",
                    onDelete: "NO ACTION",
                    field: "ownerId",
                    references: { model: "users", key: "userId" },
                    allowNull: false,
                },
                createdAt: {
                    type: Sequelize.DATE,
                    field: "createdAt",
                    allowNull: false,
                },
                updatedAt: {
                    type: Sequelize.DATE,
                    field: "updatedAt",
                    allowNull: false,
                },
            },
            { transaction },
        ],
    },
    {
        fn: "createTable",
        params: [
            "guild_members",
            {
                guildId: {
                    type: Sequelize.STRING,
                    unique: "guild_members_userId_guildId_unique",
                    primaryKey: true,
                    field: "guildId",
                    onDelete: "CASCADE",
                    onUpdate: "CASCADE",
                    references: { model: "guilds", key: "guildId" },
                    allowNull: false,
                },
                userId: {
                    type: Sequelize.STRING,
                    unique: "guild_members_userId_guildId_unique",
                    primaryKey: true,
                    field: "userId",
                    onDelete: "CASCADE",
                    onUpdate: "CASCADE",
                    references: { model: "users", key: "userId" },
                    allowNull: false,
                },
                joinDate: {
                    type: Sequelize.DATE,
                    field: "joinDate",
                    defaultValue: Sequelize.NOW,
                    allowNull: false,
                },
                role: {
                    type: Sequelize.STRING,
                    field: "role",
                    allowNull: true,
                },
                createdAt: {
                    type: Sequelize.DATE,
                    field: "createdAt",
                    allowNull: false,
                },
                updatedAt: {
                    type: Sequelize.DATE,
                    field: "updatedAt",
                    allowNull: false,
                },
            },
            { transaction },
        ],
    },
    {
        fn: "addColumn",
        params: [
            "titles",
            "guildId",
            {
                type: Sequelize.STRING,
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
                field: "guildId",
                references: { model: "guilds", key: "guildId" },
                allowNull: true,  // will become `false` afer handling previous titles without guildId in the next migration
            },
            { transaction },
        ],
    },
];

const rollbackCommands = (transaction) => [
    {
        fn: "removeColumn",
        params: ["titles", "guildId", { transaction }],
    },
    {
        fn: "dropTable",
        params: ["guild_members", { transaction }],
    },
    {
        fn: "dropTable",
        params: ["guilds", { transaction }],
    },
];

const pos = 0;
const useTransaction = true;

const execute = (queryInterface, sequelize, _commands) => {
    let index = pos;
    const run = (transaction) => {
        const commands = _commands(transaction);
        return new Promise((resolve, reject) => {
            const next = () => {
                if (index < commands.length) {
                    const command = commands[index];
                    console.log(`[#${index}] execute: ${command.fn}`);
                    index++;
                    queryInterface[command.fn](...command.params).then(
                        next,
                        reject
                    );
                } else resolve();
            };
            next();
        });
    };
    if (useTransaction) return queryInterface.sequelize.transaction(run);
    return run(null);
};

module.exports = {
    pos,
    useTransaction,
    up: (queryInterface, sequelize) => 
        execute(queryInterface, sequelize, migrationCommands),
    down: (queryInterface, sequelize) =>
        execute(queryInterface, sequelize, rollbackCommands),
    info,
};
