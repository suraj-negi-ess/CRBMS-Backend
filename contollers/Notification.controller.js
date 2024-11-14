import Notification from "../models/Notification.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";




export const markNotificationAsRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  const notification = await Notification.findByPk(notificationId);

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  notification.isRead = true;
  await notification.save();

  res.status(200).json({ message: "Notification marked as read" });
});

// Delete a notification
export const deleteNotification = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  const notification = await Notification.findByPk(notificationId);

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  await notification.destroy();

  res.status(200).json({ message: "Notification deleted successfully" });
});
