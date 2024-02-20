'use strict';

export default function(sequelize, DataTypes) {
  return sequelize.define('Raw', {
    _id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: DataTypes.STRING,
    xml: DataTypes.TEXT,
    active: DataTypes.BOOLEAN
  });
}
