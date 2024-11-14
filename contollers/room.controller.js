import bcrypt from "bcrypt";
import Room from "../models/Room.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { json } from "sequelize";
import { ApiResponse } from "../utils/ApiResponse.js";
import path from "path";
import fs from "fs";

export const createRoom = asyncHandler(async (req, res) => {
  const { name, description, location, capacity, amenities, password } =
    req.body;

  if (!name || !location || !capacity) {
    throw new ApiError(400, "Please fill in all fields");
  }

  const existingRoom = await Room.findOne({ where: { name } });
  if (existingRoom) {
    throw new ApiError(400, "Room already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

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
    name,
    description,
    password: hashedPassword,
    location,
    capacity,
    roomImagePath,
    amenities: formattedAmenities, // Pass formatted array here
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
    attributes: { exclude: ["password"] },
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
