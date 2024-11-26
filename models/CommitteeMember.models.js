import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";

const CommitteeMember = sequelize.define(
  "CommitteeMember",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    committeeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "committees", // refers to the committees table
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users", // refers to the users table
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    role: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: "active",
    },
  },
  {
    timestamps: true, // enables automatic `createdAt` and `updatedAt` management
    tableName: "committee_members",
  }
);

export default CommitteeMember;
