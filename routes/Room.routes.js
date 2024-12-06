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
  deleteAmenityQuantity,
  editAmenityQuantity,
} from "../controllers/room.controller.js";
import uploadRoomImage from "../middlewares/roomMulter.middleware.js";

const roomRouter = express.Router();

roomRouter.route("/amenity-quantity-all").get(getAllAmenitiesQuantity);
roomRouter.route("/all-amenity-active-quantity").get(getAllAmenitiesActiveQuantity);
roomRouter.route("/add-amenity-quantity").post(createAmenityQuantity);
roomRouter.route("/delete-amenity-quantity/:amenityQuantityId").delete(deleteAmenityQuantity);

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

roomRouter.route("/edit-amenity-quantity/:amenityQuantityId").put(editAmenityQuantity);








export default roomRouter;
