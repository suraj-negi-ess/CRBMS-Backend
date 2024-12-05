import express from "express";
import {
  addLocation,
  changeLocationStatus,
  deleteLocation,
  getAllLocations,
  updateLocation,
} from "../contollers/location.controller.js";

const router = express.Router();

router.route("/locations").post(addLocation);
router.route("/locations").get(getAllLocations);
router.route("/locations/:id").put(updateLocation);

router.route("/locations/:id/status").patch(changeLocationStatus);

router.route("/locations/:id").delete(deleteLocation);

export default router;
