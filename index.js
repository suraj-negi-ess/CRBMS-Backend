import dotenv from "dotenv";
dotenv.config({
  path: "env",
});

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { dbConnection } from "./database/database.js";
import userRoutes from "./routes/User.routes.js";
import roomRoutes from "./routes/Room.routes.js";
import amenityRoutes from "./routes/RoomAmenity.routes.js";

import User from "./models/User.models.js";
import Room from "./models/Room.models.js";
import CommitteeMember from "./models/CommitteeMember.models.js";
import Committee from "./models/Committee.models.js";
import RoomAmenity from "./models/RoomAmenity.model.js";

const app = express();

const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: true })); // for form-data
app.use(express.json()); // for raw JSON

app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("working");
});

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    message: err.message || "Server Error",
  });
});

app.use("/avatars", express.static("public/avatars"));

// API ROUTES

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/rooms", roomRoutes);
app.use("/api/v1/amenity", amenityRoutes);

const PORT = process.env.PORT || 9000;

dbConnection()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server Running at ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGODB CONNECTION FAILED !!!!", err);
  });

// const syncModels = async () => {
//   try {
//     const abc = Room;
//     await abc.sync({ alter: true, force: true }); // Ensures the table is updated
//     console.log(abc, "table synced.");
//   } catch (error) {
//     console.error("Error syncing ", abc, " table:", error);
//   }
// };
// syncModels();