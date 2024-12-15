const Sequelize = require("sequelize");

const info = {
    revision: 7,
    name: "Modify Titles guildId allowNull.",
    created: "2024-12-15T08:15:40.121Z",
    comment: "",
};

const migrationCommands = (transaction) => [
    // Handle previous titles without guildId
    // First create a guild `default-guildId` to satisfy titles.guildId's pKey constraint
    {
        fn: "bulkInsert",
        params: [
            "guilds",
            [
                {
                    guildId: "default-guildId",
                    name: "DEFAULT GUILD",
                    ownerId: "default-userId",  // guranteed to exist in up()
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ],
            { transaction },
        ],
    },
    {
        fn: "bulkInsert",
        params: [
            "guild_members",
            [
                {
                    guildId: "default-guildId",
                    userId: "default-userId",
                    joinDate: new Date(),
                    role: "Owner",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ],
            { transaction },
        ],
    },
    // update all existing titles.guildId => `default-guildId`
    {
        fn: "bulkUpdate",
        params: [
            "titles",
            { guildId: "default-guildId" },
            { guildId: null },
            { transaction },
        ],
    },
    // Turn `allowNull` back to `false`
    {
        fn: "changeColumn",
        params: [
            "titles",
            "guildId",
            {
                type: Sequelize.STRING,
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
                field: "guildId",
                references: { model: "guilds", key: "guildId" },
                allowNull: false,
            },
            { transaction },
        ],
    },
];

const rollbackCommands = (transaction) => [
    // Revert titles.guildId's allowNull back to `true`
    {
        fn: "changeColumn",
        params: [
            "titles",
            "guildId",
            {
                type: Sequelize.STRING,
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
                field: "guildId",
                references: { model: "guilds", key: "guildId" },
                allowNull: true,
            },
            { transaction },
        ],
    },
    // Remove default-userId and default-guildId
    {
        fn: "bulkDelete",
        params: [
            "guild_members",
            { guildId: "default-guildId", userId: "default-userId" },
            { transaction },
        ],
    },
    {
        fn: "bulkDelete",
        params: [
            "guilds",
            { guildId: "default-guildId" },
            { transaction },
        ],
    },
    {
        fn: "bulkDelete",
        params: [
            "users",
            { userId: "default-userId" },
            { transaction },
        ]
    }
    // Revert all modified titles.guildId back to `null` (by cascade)
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
    up: (queryInterface, sequelize) => {
        return ensureDefaultUser(queryInterface, sequelize).then(() => {
            console.log("Default user ensured. Running migration commands...");
            return execute(queryInterface, sequelize, migrationCommands)
        });
    },
    down: (queryInterface, sequelize) =>
        execute(queryInterface, sequelize, rollbackCommands),
    info,
};

// Helper method to ensure a default user exists
const ensureDefaultUser = (queryInterface, sequelize) => {
    console.log("Ensuring default user exists...");
    return queryInterface.sequelize
        .query(
            `SELECT COUNT(*) AS count FROM users WHERE "userId" = 'default-userId'`,
            { type: Sequelize.QueryTypes.SELECT }
        )
        .then(([results]) => {
            console.log(results);
            if (results.count == '0') {
                console.log("Creating default user...");
                return queryInterface.bulkInsert(
                    "users",
                    [
                        {
                            userId: "default-userId",
                            username: "DEFAULT USER",
                            discriminator: "0000",
                            avatar: null,
                            isBot: true,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        },
                    ],
                    {}
                );
            }
            console.log("Default user already exists.");
            return Promise.resolve();  // default user already exists
        });
};
