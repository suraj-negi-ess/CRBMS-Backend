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
  addRoomGallery,
  deleteRoomGallery,
  getAllAmenitiesQuantity,
  getAllAmenitiesActiveQuantity,
  createAmenityQuantity,
} from "../controllers/room.controller.js";
import uploadRoomImage from "../middlewares/roomMulter.middleware.js";

const roomRouter = express.Router();

roomRouter.route("/add-room").post(uploadRoomImage.single("roomImage"), createRoom);
roomRouter.route("/all-rooms").get(getAllRooms);
roomRouter.route("/:roomId").get(getRoomById);
roomRouter.route("/:roomId").put(updateRoom);
roomRouter.route("/:roomId").delete(deleteRoom);
roomRouter.route("/login").post(roomLogin);
roomRouter.route("/change-sanitation-status").post(changeSanitationStatus);
roomRouter.route("/change-status").post(changeStatus);
roomRouter.route("/add-room-gallery").post(uploadRoomImage.single("roomImage"), addRoomGallery);
roomRouter.route("/delete-room-gallery/:roomId").delete(deleteRoomGallery);

roomRouter.route("/all-amenity-quantity").get(getAllAmenitiesQuantity);
roomRouter.route("/all-amenity-active-quantity").get(getAllAmenitiesActiveQuantity);
roomRouter.route("/add-amenity-quantity").post(createAmenityQuantity);
roomRouter.route("/edit-amenity-quantity/:roomId").put(updateRoom);
roomRouter.route("/delete-amenity-quantity/:roomId").delete(deleteRoomGallery);

export default roomRouter;
