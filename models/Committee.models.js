import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";

const Committee = sequelize.define(
  "Committee",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: "active",
    },
  },
  {
    tableName: "committees",
    timestamps: true,
    paranoid: true,
  }
);

export default Committee;
