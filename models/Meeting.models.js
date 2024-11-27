import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";

const Meeting = sequelize.define(
  "Meeting",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    roomId: {
      type: DataTypes.UUID, // Foreign key to link with Room table
      allowNull: false,
      references: {
        model: "rooms", // Name of the Room table
        key: "id",
      },
      onDelete: "CASCADE", // Delete meeting if the room is deleted
    },
    userId: {
      type: DataTypes.UUID, // Foreign key to link with User table
      allowNull: false,
      references: {
        model: "users", // Name of the User table
        key: "id",
      },
      onDelete: "SET NULL", // Keep meeting if user is deleted
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    meetingDate: {
      type: DataTypes.DATEONLY, // Only stores the date (e.g., 2024-11-17)
      allowNull: false,
    },
    isPrivate: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false, // Public by default
    },
    attendees: {
      type: DataTypes.ARRAY(DataTypes.JSON), // List of users or emails
      allowNull: true,
      defaultValue: [], // Empty list initially
    },
    status: {
      type: DataTypes.ENUM("scheduled", "ongoing", "completed", "cancelled"),
      defaultValue: "scheduled", // Default to scheduled
    },
    // notificationsSent: {
    //   type: DataTypes.BOOLEAN, // Track if notifications were sent
    //   allowNull: false,
    //   defaultValue: false,
    // },
  },
  {
    tableName: "meetings",
    timestamps: true, // Adds createdAt and updatedAt
    paranoid: true, // Enables soft delete with deletedAt field
  }
);

export default Meeting;
