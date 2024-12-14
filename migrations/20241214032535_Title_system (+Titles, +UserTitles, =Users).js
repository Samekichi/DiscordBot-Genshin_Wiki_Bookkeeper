const Sequelize = require("sequelize");

/**
 * Actions summary:
 *
 * createTable() => "titles", deps: [users]
 * createTable() => "user_titles", deps: [users, titles, users]
 *
 */

const info = {
  revision: 2,
  name: "Title system (+Titles, +UserTitles, =Users)",
  created: "2024-12-14T03:25:35.559Z",
  comment: "",
};

const migrationCommands = (transaction) => [
  {
    fn: "createTable",
    params: [
      "titles",
      {
        titleId: {
          type: Sequelize.UUID,
          field: "titleId",
          primaryKey: true,
          allowNull: false,
        },
        name: { type: Sequelize.STRING, field: "name", allowNull: false },
        description: { type: Sequelize.STRING, field: "description" },
        category: { type: Sequelize.STRING, field: "category" },
        createdBy: {
          type: Sequelize.STRING,
          field: "createdBy",
          onDelete: "NO ACTION",
          onUpdate: "CASCADE",
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
      "user_titles",
      {
        userId: {
          type: Sequelize.STRING,
          unique: "user_titles_userId_titleId_unique",
          primaryKey: true,
          field: "userId",
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
          references: { model: "users", key: "userId" },
          allowNull: false,
        },
        titleId: {
          type: Sequelize.UUID,
          unique: "user_titles_userId_titleId_unique",
          primaryKey: true,
          field: "titleId",
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
          references: { model: "titles", key: "titleId" },
          allowNull: false,
        },
        grantedBy: {
          type: Sequelize.STRING,
          field: "grantedBy",
          defaultValue: null,
          onDelete: "NO ACTION",
          onUpdate: "CASCADE",
          references: { model: "users", key: "userId" },
          allowNull: true,
        },
        isCustom: {
          type: Sequelize.BOOLEAN,
          field: "isCustom",
          defaultValue: false,
          allowNull: false,
        },
        isSystemGrant: {
          type: Sequelize.BOOLEAN,
          field: "isSystemGrant",
          defaultValue: false,
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
];

const rollbackCommands = (transaction) => [
  {
    fn: "dropTable",
    params: ["titles", { transaction }],
  },
  {
    fn: "dropTable",
    params: ["user_titles", { transaction }],
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
