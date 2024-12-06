import express from "express";
import {
  addLocation,
  changeLocationStatus,
  deleteLocation,
  getAllActiveLocations,
  getAllLocations,
  updateLocation,
} from "../controllers/location.controller.js";

const locationRouter = express.Router();

locationRouter.route("/locations").post(addLocation);
locationRouter.route("/locations").get(getAllLocations);
locationRouter.route("/activeLocations").get(getAllActiveLocations);
locationRouter.route("/locations/:id").put(updateLocation);
locationRouter.route("/locations/:id/status").patch(changeLocationStatus);
locationRouter.route("/locations/:id").delete(deleteLocation);

export default locationRouter;
