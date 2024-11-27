import express, { Router } from "express";
import { addMeeting } from "../contollers/meeting.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/add-meeting").post(verifyJWT, addMeeting);

export default router;
