import { Router } from "express";
import {
  createRoomAmenity,
  deleteRoomAmenity,
  getAllRoomAmenities,
  updateRoomAmenity,
  updateRoomAmenityQuantity,
} from "../contollers/amenity.controller.js";

const router = Router();

router.route("/add-amenity").post(createRoomAmenity);

router.route("/get-all-amenities").get(getAllRoomAmenities);

router.route("/update-amenity").put(updateRoomAmenity);

router.route("/update-room-amenity-quantity").put(updateRoomAmenityQuantity);

router.route("/delete/:id").delete(deleteRoomAmenity);
export default router;
