import { getSetting } from "../models/appSettings.model.js";
import User from "../models/user.model.js";

/**
 * GET /rewards/points
 * Returns the authenticated user's current reward points balance.
 */
export async function getRewardPoints(req, res) {
  try {
    const user = await User.findById(req.user._id).select("rewardPoints");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.json({ success: true, rewardPoints: user.rewardPoints || 0 });
  } catch (error) {
    console.error("Get reward points error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch reward points" });
  }
}

/**
 * GET /rewards/settings
 * Returns the current pointsPerReview setting (public — shown in review modal).
 */
export async function getRewardsSettings(req, res) {
  try {
    const pointsPerReview = await getSetting("pointsPerReview", 50);
    return res.json({ success: true, pointsPerReview });
  } catch (error) {
    console.error("Get rewards settings error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch rewards settings" });
  }
}
