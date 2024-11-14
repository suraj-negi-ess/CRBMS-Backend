import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";

const Notification = sequelize.define(
  "Notification",
  {
    notificationId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users", // Assuming you have a User model
        key: "id",
      },
    },
    meetingId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Meetings", // Assuming you have a Meeting model
        key: "id",
      },
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
  }
);

export default Notification;
