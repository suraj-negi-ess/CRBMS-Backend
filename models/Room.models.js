import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";
import Location from "./Location.model.js";

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
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    roomImagePath: {
      type: DataTypes.STRING(255),
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

Location.hasOne(Room, {
  foreignKey: {
    name: "location", // Foreign key in RoomAmenityQuantity
    type: DataTypes.UUID, // Ensure it's UUID if Room has UUID primary key
  },
  onDelete: "CASCADE",
});
Room.belongsTo(Location, { foreignKey: "location" });

export default Room;
