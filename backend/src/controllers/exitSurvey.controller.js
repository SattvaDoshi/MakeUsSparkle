import ExitSurvey from "../models/exitSurvey.model.js";

// @desc    Submit an exit survey
// @route   POST /api/exit-surveys
// @access  Public
export const submitSurvey = async (req, res) => {
	try {
		const { reason, otherText } = req.body;

		if (!reason) {
			return res.status(400).json({ success: false, message: "Reason is required" });
		}

		const survey = await ExitSurvey.create({ reason, otherText });

		res.status(201).json({ success: true, survey });
	} catch (error) {
		console.error("Error submitting exit survey:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// @desc    Get all exit surveys
// @route   GET /api/admin/exit-surveys
// @access  Private/Admin
export const getSurveys = async (req, res) => {
	try {
		const surveys = await ExitSurvey.find({}).sort({ createdAt: -1 });
		res.status(200).json({ success: true, surveys });
	} catch (error) {
		console.error("Error fetching exit surveys:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};
