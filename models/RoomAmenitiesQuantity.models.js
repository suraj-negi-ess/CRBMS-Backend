import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";
import Room from "./Room.models.js";
import RoomAmenity from "./RoomAmenity.model.js";
import User from "./User.models.js";

const RoomAmenityQuantity = sequelize.define(
  "RoomAmenityQuantity",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    
    quantity: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
  },
  {
    tableName: "room_amenity_quantity",
    timestamps: true,
  }
);

Room.hasMany(RoomAmenityQuantity, {
  foreignKey: {
    name: 'roomId',  // Foreign key in RoomAmenityQuantity
    type: DataTypes.UUID,  // Ensure it's UUID if Room has UUID primary key
  },
    onDelete: 'CASCADE' // Optional: What happens when a User is deleted
  });

RoomAmenityQuantity.belongsTo(Room, { foreignKey: 'roomId' });

  RoomAmenity.hasMany(RoomAmenityQuantity, {
    foreignKey: {
      name: 'amenityId',  // Foreign key in RoomAmenityQuantity
      type: DataTypes.UUID,  // Ensure it's UUID if RoomAmenity has UUID primary key
    },
    onDelete: 'CASCADE' // Optional: What happens when a User is deleted
  });

  RoomAmenityQuantity.belongsTo(RoomAmenity, { foreignKey: 'amenityId' });

  User.hasMany(RoomAmenityQuantity, {
    foreignKey: {
      name: 'createdBy',  // Foreign key in RoomAmenityQuantity
      type: DataTypes.UUID,  // Ensure it's UUID if User has UUID primary key
    },
    onDelete: 'CASCADE' // Optional: What happens when a User is deleted
  });

  RoomAmenityQuantity.belongsTo(User, { foreignKey: 'createdBy' });

  User.hasMany(RoomAmenityQuantity, {
    foreignKey: {
      name: 'updatedBy',  // Foreign key in RoomAmenityQuantity
      type: DataTypes.UUID,  // Ensure it's UUID if User has UUID primary key
    },
    onDelete: 'CASCADE' // Optional: What happens when a User is deleted
  });

  RoomAmenityQuantity.belongsTo(User, { foreignKey: 'updatedBy' });

  User.hasMany(RoomAmenityQuantity, {
    foreignKey: {
      name: 'deletedBy',  // Foreign key in RoomAmenityQuantity
      type: DataTypes.UUID,  // Ensure it's UUID if User has UUID primary key
    },
    onDelete: 'CASCADE' // Optional: What happens when a User is deleted
  });

  RoomAmenityQuantity.belongsTo(User, { foreignKey: 'deletedBy' });

export default RoomAmenityQuantity;