import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Meeting from "../models/Meeting.models.js";
import Room from "../models/Room.models.js";
import User from "../models/User.models.js";
import { Op } from "sequelize";
import { sequelize } from "../database/database.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const addMeeting = asyncHandler(async (req, res) => {
  const {
    roomId,
    title,
    description,
    startTime,
    endTime,
    date,
    isPrivate,
    attendees,
  } = req.body;

  const userId = req.user.id;

  if (!userId) {
    throw new ApiError(400, "Please Login To Book A Room");
  }

  if (!roomId) {
    throw new ApiError(404, "Room Not Found, Please Select a Valid Room");
  }

  if (!title || !description || !startTime || !endTime || !date) {
    throw new ApiError(400, "All required fields must be provided");
  }

  const room = await Room.findByPk(roomId);
  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  // Convert startTime and endTime to TIME format
  const formattedStartTime = new Date(startTime).toTimeString().split(" ")[0]; // HH:mm:ss
  const formattedEndTime = new Date(endTime).toTimeString().split(" ")[0]; // HH:mm:ss

  const overlappingMeeting = await Meeting.findOne({
    where: {
      roomId,
      startTime: { [Op.lte]: formattedEndTime },
      endTime: { [Op.gte]: formattedStartTime },
    },
  });

  if (overlappingMeeting) {
    throw new ApiError(400, "Room is already booked for the selected time");
  }

  const newMeeting = await Meeting.create({
    roomId,
    userId,
    title,
    description,
    startTime: formattedStartTime,
    endTime: formattedEndTime,
    meetingDate: date,
    isPrivate: isPrivate || false,
    attendees: attendees || [],
  });

  // Notifications will be done here
  attendees.forEach((attendee) => {
    console.log(`Notification sent to ${attendee.email}`);
  });

  res.status(201).json({
    message: "Meeting created successfully and notifications sent to attendees",
    data: newMeeting,
  });
});

export const getAllMeetings = asyncHandler(async (req, res) => {
  // Raw SQL query to fetch all meetings with associated room and organizer details
  const meetings = await sequelize.query(
    `
    SELECT 
      m.id AS "meetingId",
      m."title",
      m."description",
      m."startTime",
      m."endTime",
      m."meetingDate",
      m."isPrivate",
      m."createdAt",
      m."updatedAt",
      r."name" AS "roomName",
      r."location" AS "roomLocation",
      u."fullname" AS "organizerName",
      u."email" AS "organizerEmail"
    FROM 
      "meetings" m
    LEFT JOIN 
      "rooms" r
    ON 
      m."roomId" = r."id"
    LEFT JOIN 
      "users" u
    ON 
      m."userId" = u."id"
    ORDER BY 
      m."meetingDate" DESC, m."startTime" ASC
    `,
    { type: sequelize.QueryTypes.SELECT }
  );

  // Send response
  res
    .status(200)
    .json(
      new ApiResponse(200, { meetings }, "Meetings retrieved successfully")
    );
});

export const getTodaysMeetings = asyncHandler(async (req, res) => {
  const today = new Date().toISOString().split("T")[0]; // Get today's date in 'YYYY-MM-DD' format

  const meetings = await sequelize.query(
    `
    SELECT 
      m.id AS "meetingId",
      m."title" AS "title",
      m."description" AS "description",
      m."startTime" AS "startTime",
      m."endTime" AS "endTime",
      m."meetingDate" AS "meetingDate",
      m."isPrivate" AS "isPrivate",
      m."createdAt" AS "createdAt",
      m."updatedAt" AS "updatedAt",
      r."name" AS "roomName",
      r."location" AS "roomLocation",
      u."fullname" AS "organizerName",
      u."email" AS "organizerEmail"
    FROM 
      "meetings" m
    LEFT JOIN 
      "rooms" r
    ON 
      m."roomId" = r."id"
    LEFT JOIN 
      "users" u
    ON 
      m."userId" = u."id"
    WHERE 
      m."meetingDate" = :today
    ORDER BY 
      m."startTime" ASC
    `,
    {
      type: sequelize.QueryTypes.SELECT,
      replacements: { today },
    }
  );

  if (!meetings.length) {
    throw new ApiError(404, "No meetings found for today");
  }

  // Send response
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { meetings },
        "Today's meetings retrieved successfully"
      )
    );
});

export const getMyMeetings = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  // Raw SQL query to fetch meetings organized by the user or where the user is an attendee
  const myMeetings = await sequelize.query(
    `
    SELECT 
      m.id AS "meetingId",
      m."title",
      m."description",
      m."startTime",
      m."endTime",
      m."meetingDate",
      m."isPrivate",
      m."createdAt",
      m."updatedAt",
      r."name" AS "roomName",
      r."location" AS "roomLocation",
      u."fullname" AS "organizerName",
      u."email" AS "organizerEmail"
    FROM 
      "meetings" m
    LEFT JOIN 
      "rooms" r
    ON 
      m."roomId" = r."id"
    LEFT JOIN 
      "users" u
    ON 
      m."userId" = u."id"
    WHERE 
      m."userId" = :userId -- User is the organizer
      OR EXISTS (
        SELECT 1 FROM UNNEST(m."attendees") attendee
        WHERE attendee->>'id' = :userId -- User is an attendee
      )
    ORDER BY 
      m."meetingDate" DESC, m."startTime" ASC
    `,
    {
      type: sequelize.QueryTypes.SELECT,
      replacements: { userId }, // Bind parameter to prevent SQL injection
    }
  );

  // Respond with meetings
  return res
    .status(200)
    .json(
      new ApiResponse(200, { myMeetings }, "Meetings  Retrieved Successfully")
    );
});

// 4. Update a meeting
export const updateMeeting = asyncHandler(async (req, res) => {
  const { meetingId } = req.params;
  const {
    title,
    description,
    startTime,
    endTime,
    roomId,
    organizerId,
    participants,
  } = req.body;

  const meeting = await Meeting.findByPk(meetingId);
  if (!meeting) {
    throw new ApiError(404, "Meeting not found");
  }

  // Update fields
  meeting.title = title || meeting.title;
  meeting.description = description || meeting.description;
  meeting.startTime = startTime || meeting.startTime;
  meeting.endTime = endTime || meeting.endTime;
  meeting.roomId = roomId || meeting.roomId;
  meeting.organizerId = organizerId || meeting.organizerId;
  meeting.participants = participants || meeting.participants;

  await meeting.save();
  res
    .status(200)
    .json({ message: "Meeting updated successfully", data: meeting });
});

// 5. Delete a meeting
export const deleteMeeting = asyncHandler(async (req, res) => {
  const { meetingId } = req.params;

  const meeting = await Meeting.findByPk(meetingId);
  if (!meeting) {
    throw new ApiError(404, "Meeting not found");
  }

  await meeting.destroy();
  res.status(200).json({ message: "Meeting deleted successfully" });
});

// 6. Get meetings by room
export const getMeetingsByRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  const meetings = await Meeting.findAll({
    where: { roomId },
    include: [
      { model: User, as: "organizer", attributes: ["username", "email"] },
    ],
  });

  res.status(200).json({ data: meetings });
});

// 7. Get meetings by organizer
export const getMeetingsByOrganizer = asyncHandler(async (req, res) => {
  const { organizerId } = req.params;

  const meetings = await Meeting.findAll({
    where: { organizerId },
    include: [{ model: Room, attributes: ["roomName", "location"] }],
  });

  res.status(200).json({ data: meetings });
});

// Cancel a meeting and notify attendees
export const cancelMeeting = asyncHandler(async (req, res) => {
  const { meetingId } = req.params;

  const meeting = await Meeting.findByPk(meetingId);
  if (!meeting) {
    throw new ApiError(404, "Meeting not found");
  }

  const { title, participants } = meeting;

  // Notify each participant about the meeting cancellation
  for (const participantId of participants) {
    await Notification.create({
      type: "Meeting Canceled",
      message: `The meeting "${title}" has been canceled.`,
      userId: participantId,
      meetingId: meeting.id,
    });
  }

  await meeting.destroy();

  res.status(200).json({
    message: "Meeting canceled and notifications sent to attendees",
  });
});
