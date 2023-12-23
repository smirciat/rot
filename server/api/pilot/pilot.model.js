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
    medicalDate: DataTypes.DATE,
    dateOfBirth: DataTypes.DATE,
    certNumber: DataTypes.STRING,
    certType: DataTypes.STRING,
    base297: DataTypes.DATE,
    base293: DataTypes.DATE,
    baseIndoc: DataTypes.DATE,
    baseHazmat: DataTypes.DATE,
    base208: DataTypes.DATE,
    base408: DataTypes.DATE,
    base1900: DataTypes.DATE,
    baseKingAir: DataTypes.DATE,
    baseCasa: DataTypes.DATE
    
  });
}
