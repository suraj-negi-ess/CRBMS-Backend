import bcrypt from "bcrypt";
import Room from "../models/Room.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import path from "path";
import fs from "fs";
import {
  createAmenityQuantityService,
  deleteAmenityQuantityService,
  editAmenityQuantityService,
  getAllAmenitiesActiveQuantityService,
  getAllAmenitiesQuantityService,
} from "../services/Room,service.js";
import Location from "../models/Location.model.js";

export const createRoom = asyncHandler(async (req, res) => {
  const { name, description, location, capacity, sanitationStatus  } = req.body;

  if (!name || !location || !capacity) {
    throw new ApiError(400, "Please fill in all fields");
  }

  const existingRoom = await Room.findOne({ where: { name } });
  if (existingRoom) {
    throw new ApiError(400, "Room already exists");
  }

  let roomImagePath = null;
  if (req.file) {
    roomImagePath = `room-images/${name.replace(/\s+/g, "_")}${path
      .extname(req.file.originalname)
      .toLowerCase()}`;
  }

  const room = await Room.create({
    name,
    description,
    location,
    capacity,
    roomImagePath,
    sanitationStatus, 
  });

  if (!room) {
    if (req.file) fs.unlinkSync(`public/${roomImagePath}`); // Remove image if room creation fails
    throw new ApiError(500, "Failed to create room");
  }

  if (req.file) {
    const newRoomImagePath = `room-images/${name.replace(/\s+/g, "_")}_${
      room.id
    }${path.extname(req.file.originalname).toLowerCase()}`;
    fs.renameSync(`public/${roomImagePath}`, `public/${newRoomImagePath}`);
    room.roomImagePath = newRoomImagePath;
    await room.save();
  }

  return res
    .status(201)
    .json(new ApiResponse(200, { room }, "Room Created Successfully"));
});

export const getAllRooms = asyncHandler(async (req, res) => {
  const rooms = await Room.findAll({
    include:[{
      model:Location,
    }
  ],
  });

  return res
    .status(201)
    .json(new ApiResponse(200, { rooms }, "Rooms  Retrieved Successfully"));
});

export const getRoomById = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  console.log(roomId);

  const room = await Room.findByPk(roomId, {
    attributes: { exclude: ["password"] },
  });

  console.log(room);
  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { room }, "Room Fetched Successfully"));
});

export const updateRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const {
    name,
    location,
    capacity,
    roomImagePath,
    sanitationStatus,
    isAvailable,
    amenities,
  } = req.body;

  const room = await Room.findByPk(roomId);

  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  room.name = name ?? room.name;
  room.location = location ?? room.location;
  room.capacity = capacity ?? room.capacity;
  room.roomImagePath = roomImagePath ?? room.roomImagePath;
  room.sanitationStatus = sanitationStatus ?? room.sanitationStatus;
  room.isAvailable = isAvailable ?? room.isAvailable;

  room.amenities =
    typeof amenities === "string"
      ? JSON.parse(amenities)
      : amenities ?? room.amenities;

  await room.save();

  res.status(200).json({
    success: true,
    message: "Room updated successfully",
    data: room,
  });
});

export const deleteRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  console.log(roomId);
  const room = await Room.findByPk(roomId);

  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  await room.destroy();

  res.status(200).json({
    success: true,
    message: "Room deleted successfully",
  });
});

export const roomLogin = asyncHandler(async (req, res) => {
  const { roomId, password } = req.body;

  if (!roomId || !password) {
    throw new ApiError(400, "Room ID and password are required");
  }

  const room = await Room.findByPk(roomId);

  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  const isPasswordValid = await bcrypt.compare(password, room.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

  const { password: roomPassword, ...roomData } = room.toJSON();

  res.status(200).json({
    success: true,
    message: "Room login successful",
    data: roomData,
  });
});

export const changeSanitationStatus = asyncHandler(async (req, res) => {
  const { roomId, sanitationStatus } = req.body;

  if (!roomId || !sanitationStatus) {
    throw new ApiError(400, "Room ID and sanitation status are required");
  }
  const room = await Room.findByPk(roomId);

  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  room.sanitationStatus = sanitationStatus;

  await room.save();

  res.status(200).json({
    success: true,
    message: "Sanitation status updated successfully",
    data: room,
  });
});

export const changeStatus = asyncHandler(async (req, res) => {
  const { roomId, status } = req.body;

  if (!roomId || !status) {
    throw new ApiError(400, "Room ID and status are required");
  }

  const room = await Room.findByPk(roomId);

  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  room.status = status;
  await room.save();
  res.status(200).json({
    success: true,
    message: "Room status updated successfully",
    data: room,
  });
});

export const addRoomGallery = asyncHandler(async (req, res) => {
  const { imageName, createdBy, updatedBy, deletedBy, status } = req.body;

  let roomImagePath = null;
  if (req.file) {
    roomImagePath = `room-images/${name.replace(/\s+/g, "_")}${path
      .extname(req.file.originalname)
      .toLowerCase()}`;
  }

  // Parse amenities if it’s a string, ensuring it’s an array
  const formattedAmenities = Array.isArray(amenities)
    ? amenities
    : typeof amenities === "string"
    ? JSON.parse(amenities)
    : [];

  const room = await Room.create({
    createdBy,
    updatedBy,
    deletedBy,
    status,
    roomImagePath,
  });

  if (!room) {
    if (req.file) fs.unlinkSync(`public/${roomImagePath}`); // Remove image if room creation fails
    throw new ApiError(500, "Failed to create room");
  }

  if (req.file) {
    const newRoomImagePath = `room-images/${name.replace(/\s+/g, "_")}_${
      room.id
    }${path.extname(req.file.originalname).toLowerCase()}`;
    fs.renameSync(`public/${roomImagePath}`, `public/${newRoomImagePath}`);
    room.roomImagePath = newRoomImagePath;
    await room.save();
  }

  return res
    .status(201)
    .json(new ApiResponse(200, { room }, "Room Gallery Created Successfully"));
});

export const deleteRoomGallery = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  const room = await Room.findByPk(roomId);

  if (!room) {
    throw new ApiError(404, "Room gallery not found");
  }
  await room.destroy();
  res.status(200).json({
    success: true,
    message: "Room gallery deleted successfully",
  });
});

export const getAllAmenitiesQuantity = asyncHandler(async (req, res) => {
  const result = await getAllAmenitiesQuantityService();
  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        { result },
        "Rooms amenities quantity retrieved Successfully"
      )
    );
});

// Get all Amenity quantity
export const getAllAmenitiesActiveQuantity = asyncHandler(async (req, res) => {
  const result = await getAllAmenitiesActiveQuantityService();
  return res
    .status(201)
    .json(new ApiResponse(200, { result }, "Rooms  Retrieved Successfully"));
});

export const createAmenityQuantity = asyncHandler(async (req, res) => {
  const { quantity, status, createdBy, roomId, amenityId } = req.body;
  if (!quantity) {
    throw new ApiError(400, "Quantity Is required");
  }

  const result = await createAmenityQuantityService(
    quantity,
    status,
    createdBy,
    roomId,
    amenityId
  );

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { result },
        "Room Amenity Quantity added successfully"
      )
    );
});





export const editAmenityQuantity = asyncHandler(async (req, res) => {
  const { amenityQuantityId } = req.params;
  const {
    quantity,
    status,
    updatedBy,
  } = req.body;

  const result = await editAmenityQuantityService(
    quantity,
    status,
    updatedBy,
    amenityQuantityId
  );

  res.status(200).json({
    success: true,
    message: "Room amenity quantity updated successfully",
    data: result,
  });
});

export const deleteAmenityQuantity = asyncHandler(async (req, res) => {
  const { amenityQuantityId } = req.params;
  const {
    deletedBy,
  } = req.body;
  const result = await deleteAmenityQuantityService(
    amenityQuantityId,deletedBy
  );

  res.status(200).json({
    success: true,
    data:result,
    message: "Room amenity quantity deleted successfully",
  });
});
