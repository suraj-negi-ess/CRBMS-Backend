import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";
import Room from "./Room.models.js";

const RoomAmenity = sequelize.define(
  "RoomAmenity",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
  },
  {
    tableName: "room_amenities",
    timestamps: true,
  }
);

export default RoomAmenity;
