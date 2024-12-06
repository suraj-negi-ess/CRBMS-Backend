import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";
import Room from "./Room.models.js";

const RoomGallery = sequelize.define(
  "RoomAmenity",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
     imageName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      defaultValue: null,
    },
    updatedBy: {
        type: DataTypes.INTEGER,
        defaultValue: null,
      },
    deletedBy: {
        type: DataTypes.INTEGER,
        defaultValue: null,
      },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "room_gallery",
    timestamps: true,
  }
);

Room.hasMany(RoomGallery, {
    foreignKey: 'roomId', // Foreign key in the Post model
    onDelete: 'CASCADE' // Optional: What happens when a User is deleted
  });

export default RoomGallery;
