/* jshint indent: 2 */

const { join } = require("lodash");

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "sessions",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER(11).UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      createdat: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.fn("current_timestamp"),
      },
      updatedat: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      expires: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      userid: {
        type: DataTypes.INTEGER(10),
        allowNull: true,
      },
      uuid: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      useruuid: {
        type: DataTypes.STRING(60),
        allowNull: true,
      },
      token: {
        type: DataTypes.STRING(2000),
        allowNull: true,
      },
      active: {
        type: DataTypes.INTEGER(4),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "sessions",
    }
  );
};
