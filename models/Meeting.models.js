import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";
import Room from "./Room.models.js";
import User from "./User.models.js";

const Meeting = sequelize.define(
  "Meeting",
  {
    meetingId: {
      type: DataTypes.STRING,
      primaryKey: true,
      unique: true,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    roomId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Room,
        key: "roomId",
      },
    },
    organizerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "userId",
      },
    },
    participants: {
      type: DataTypes.ARRAY(DataTypes.JSON), // Array to store participant details
      allowNull: true,
      defaultValue: [],
    },
  },
  {
    timestamps: true,
  }
);

// Associations
Meeting.belongsTo(Room, { foreignKey: "roomId" });
Meeting.belongsTo(User, { foreignKey: "organizerId", as: "organizer" });

// Sequelize Hook to auto-generate meetingId in the format MEETING001, MEETING002...
Meeting.beforeCreate(async (meeting) => {
  const lastMeeting = await Meeting.findOne({
    order: [["createdAt", "DESC"]],
  });

  let newMeetingId = "MEETING001";
  if (lastMeeting && lastMeeting.meetingId) {
    const lastMeetingNumber = parseInt(
      lastMeeting.meetingId.replace("MEETING", ""),
      10
    );
    const incrementedMeetingNumber = lastMeetingNumber + 1;
    newMeetingId = `MEETING${String(incrementedMeetingNumber).padStart(
      3,
      "0"
    )}`;
  }

  meeting.meetingId = newMeetingId;
});

export default Meeting;
