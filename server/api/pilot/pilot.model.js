'use strict';

export default function(sequelize, DataTypes) {
  return sequelize.define('Pilot', {
    _id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: DataTypes.STRING,
    info: DataTypes.STRING,
    active: DataTypes.BOOLEAN,
    medicalClass: DataTypes.STRING,
    medicalDate: DataTypes.STRING,
    dateOfBirth: DataTypes.STRING,
    certNumber: DataTypes.STRING,
    certType: DataTypes.STRING,
    base297: DataTypes.STRING,
    base293: DataTypes.STRING,
    baseIndoc: DataTypes.STRING,
    baseHazmat: DataTypes.STRING,
    base208: DataTypes.STRING,
    base408: DataTypes.STRING,
    base1900: DataTypes.STRING,
    baseKingAir: DataTypes.STRING,
    baseCasa: DataTypes.STRING
    
  });
}
