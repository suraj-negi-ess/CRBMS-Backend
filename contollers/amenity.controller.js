import RoomAmenity from "../models/RoomAmenity.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const createRoomAmenity = asyncHandler(async (req, res) => {
  const { name, description, quantity } = req.body;

  if (!name) {
    throw new ApiError(400, "Name Is required");
  }

    // TO-Do check for name to find duplicacy  

  const roomAmenity = await RoomAmenity.create({
    name,
    description,
    quantity,
  });

  res
    .status(201)
    .json(
      new ApiResponse(201, { roomAmenity }, "Room Amenity added successfully")
    );
});

export const getAllRoomAmenities = asyncHandler(async (req, res) => {
  const roomAmenities = await RoomAmenity.findAll();

  res
    .status(200)
    .json(
      new ApiResponse(201, { roomAmenities }, "Room Amenity added successfully")
    );
});

export const updateRoomAmenity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, status, quantity } = req.body;

  const roomAmenity = await RoomAmenity.findByPk(id);

  if (!roomAmenity) {
    throw new ApiError(404, "Room Amenity not found");
  }

  roomAmenity.name = name || roomAmenity.name;
  roomAmenity.description = description || roomAmenity.description;
  roomAmenity.status = status || roomAmenity.status;
  roomAmenity.quantity = quantity || roomAmenity.quantity;

  await roomAmenity.save();

  res
    .status(200)
    .json(
      new ApiResponse(200, { roomAmenity }, "Room Amenity Updated successfully")
    );
});

export const deleteRoomAmenity = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const roomAmenity = await RoomAmenity.findByPk(id);

  if (!roomAmenity) {
    throw new ApiError(404, "Room Amenity not found");
  }

  await roomAmenity.destroy();

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Room Amenity Deleted successfully"));
});

export const updateRoomAmenityQuantity = asyncHandler(async (req, res) => {
  const { id } = req.body;
  const { quantity } = req.body;

  if (quantity === undefined || quantity < 0) {
    throw new ApiError(400, "Valid quantity is required");
  }

  const roomAmenity = await RoomAmenity.findByPk(id);

  if (!roomAmenity) {
    throw new ApiError(404, "Room Amenity not found");
  }

  roomAmenity.quantity = quantity;

  await roomAmenity.save();

  res.status(200).json({
    success: true,
    message: "Room Amenity quantity updated successfully",
    data: roomAmenity,
  });
});
