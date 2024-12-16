const Sequelize = require("sequelize");

/**
 * Actions summary:
 *
 * createTable() => "guilds", deps: [users]
 * createTable() => "guild_members", deps: [guilds, users]
 * addColumn(isCustom) => "titles"
 * addColumn(guildId) => "titles"
 *
 */

const info = {
  revision: 5,
  name: "Add Guilds (+Guilds,+GuildMembers,=Users,=Titles,=UserTitles)",
  created: "2024-12-16T10:22:16.878Z",
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
        maxTitleCountPerMember: {
          type: Sequelize.INTEGER,
          field: "maxTitleCountPerMember",
          defaultValue: 3,
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
      "isCustom",
      {
        type: Sequelize.BOOLEAN,
        field: "isCustom",
        defaultvalue: false,
        allowNull: false,
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
        allowNull: false,
      },
      { transaction },
    ],
  },
];

const rollbackCommands = (transaction) => [
  {
    fn: "removeColumn",
    params: ["titles", "isCustom", { transaction }],
  },
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
          queryInterface[command.fn](...command.params).then(next, reject);
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
