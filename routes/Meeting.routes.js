import express, { Router } from "express";
import {
  addMeeting,
  getAllMeetings,
  getMyMeetings,
  getTodaysMeetings,
} from "../contollers/meeting.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/add-meeting").post(verifyJWT, addMeeting);
router.route("/get-all-meeting").get(verifyJWT, getAllMeetings);
router.route("/get-all-my-meeting").get(verifyJWT, getMyMeetings);
router.route("/todays-meetings").get(getTodaysMeetings);

export default router;
