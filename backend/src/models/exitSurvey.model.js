import mongoose from "mongoose";

const exitSurveySchema = new mongoose.Schema(
	{
		reason: {
			type: String,
			required: true,
			trim: true,
		},
		otherText: {
			type: String,
			trim: true,
		},
	},
	{ timestamps: true }
);

const ExitSurvey = mongoose.model("ExitSurvey", exitSurveySchema);

export default ExitSurvey;
