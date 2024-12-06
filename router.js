import { Router } from 'express';

import userRoutes from "./routes/User.routes.js";
import amenityRoutes from "./routes/RoomAmenity.routes.js";
import committeeRoutes from "./routes/Committee.routes.js";
import meetingRoutes from "./routes/Meeting.routes.js";
import locationRouter from './routes/Location.routes.js';
import roomRouter from './routes/Room.routes.js';

const router = Router();

router.use("/api/v1/user", userRoutes);
router.use("/api/v1/rooms", roomRouter);
router.use("/api/v1/amenity", amenityRoutes);
router.use("/api/v1/committee", committeeRoutes);
router.use("/api/v1/meeting", meetingRoutes);
router.use("/api/v1/location", locationRouter);

export default router;  