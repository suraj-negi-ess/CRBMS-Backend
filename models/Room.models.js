import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";

const Room = sequelize.define(
  "Room",
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
    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    // floor: {
    //   type: DataTypes.STRING(50),
    //   allowNull: true,
    // },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    sanitationStatus: {
      type: DataTypes.STRING(20),
      defaultValue: "clean",
      field: "sanitation_status",
    },
    roomImagePath: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    amenities: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    // geoLocation: {
    //   type: DataTypes.GEOMETRY("POINT"),
    //   allowNull: true,
    //   field: "geo_location", // maps to the database field
    // },
  },
  {
    tableName: "rooms",
    timestamps: true,
    paranoid: true,
  }
);

export default Room;
