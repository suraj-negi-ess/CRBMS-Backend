import express from "express";
import {
  createRoom,
  roomLogin,
  getAllRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  changeSanitationStatus,
  changeStatus,
} from "../contollers/room.controller.js";
import uploadRoomImage from "../middlewares/roomMulter.middleware.js";

const router = express.Router();

router.route("/add-room").post(uploadRoomImage.single("roomImage"), createRoom);
router.route("/all-rooms").get(getAllRooms);
router.route("/:roomId").get(getRoomById);
router.route("/:roomId").put(updateRoom);
router.route("/:roomId").delete(deleteRoom);

router.route("/login").post(roomLogin);
router.route("/change-sanitaion-status").post(changeSanitationStatus);
router.route("/change-status").post(changeStatus);

export default router;
