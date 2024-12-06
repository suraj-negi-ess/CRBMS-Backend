import Room from "../models/Room.models.js";
import RoomAmenityQuantity from "../models/RoomAmenitiesQuantity.models.js";
import RoomAmenity from "../models/RoomAmenity.model.js";
import User from "../models/User.models.js";
import { ApiError } from "../utils/ApiError.js";

export const getAllAmenitiesQuantityService = async () => {
  try {
    const quantityAmenities = await RoomAmenityQuantity.findAll({
      include: [
        {
          model: RoomAmenity,
        },
        {
          model: Room,
        },
        {
          model: User,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (!quantityAmenities.length) {
      throw new ApiError(404, "No amenity quantity found");
    }
    return quantityAmenities;
  } catch (error) {
    console.log("error", error);
    throw error;
  }
};

export const createAmenityQuantityService = async (
  quantity,
  status,
  createdBy,
  roomId,
  amenityId
) => {
  try {
    const roomAmenity = await RoomAmenityQuantity.create({
      quantity,
      status,
      createdBy,
      roomId,
      amenityId,
    });

    return roomAmenity;
  } catch (error) {
    console.log("error", error);
    throw error;
  }
};

export const getAllAmenitiesActiveQuantityService = async () => {
  try {
    const quantityAmenities = await RoomAmenityQuantity.findAll({
      include: [
        {
          model: RoomAmenity,
        },
        {
          model: Room,
        },
        {
          model: User,
        },
      ],
      order: [["createdAt", "DESC"]],
      where: { status: true },
    });

    if (!quantityAmenities.length) {
      throw new ApiError(404, "No amenity quantity found");
    }
    return quantityAmenities;
  } catch (error) {
    console.log("error", error);
    throw error;
  }
};

export const editAmenityQuantityService = async (
  quantity,
  status,
  updatedBy,
  amenityQuantityId
) => {
  try {
    const roomAmenityQuantity = await RoomAmenityQuantity.findByPk(
      amenityQuantityId
    );

    if (!roomAmenityQuantity) {
      throw new ApiError(404, "Room not found");
    }

    roomAmenityQuantity.quantity = quantity ?? roomAmenityQuantity.quantity;
    roomAmenityQuantity.status = status ?? roomAmenityQuantity.status;
    roomAmenityQuantity.updatedBy = updatedBy ?? roomAmenityQuantity.updatedBy;

    await roomAmenityQuantity.save();

    return roomAmenityQuantity;
  } catch (error) {
    console.log("error", error);
    throw error;
  }
};

export const deleteAmenityQuantityService = async (
  amenityQuantityId,
  deletedBy
) => {
  try {
    const roomAmenityQuantity = await RoomAmenityQuantity.findByPk(
      amenityQuantityId
    );

    if (!roomAmenityQuantity) {
      throw new ApiError(404, "Room amenity quantity not found");
    }
    await roomAmenityQuantity.destroy();

    return roomAmenityQuantity;
  } catch (error) {
    console.log("error", error);
    throw error;
  }
};
