import moment from "moment";

// Add an activity to the user's activity log
export const addActivity = async (userId, activityDescription) => {
  // Find the user
  const user = await User.findByPk(userId);

  if (!user) throw new Error("User not found");

  const newActivity = {
    description: activityDescription,
    time: moment().toISOString(), // Store activity time using moment.js
  };

  // Add new activity to the front of the array (most recent first)
  const updatedActivities = [newActivity, ...user.activities];

  // Limit the array to the last 6 activities
  if (updatedActivities.length > 6) {
    updatedActivities.pop(); // Remove the oldest activity
  }

  // Update the user's activities column
  user.activities = updatedActivities;
  await user.save();

  return user;
};
