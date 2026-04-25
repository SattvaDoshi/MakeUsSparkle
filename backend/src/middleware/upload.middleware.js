import { uploadSingle, uploadMultiple } from "../config/upload.config.js";

// Middleware for single file upload
export const uploadSingleImage = (req, res, next) => {
	uploadSingle(req, res, (err) => {
		if (err) {
			return res.status(400).json({ success: false, message: err.message });
		}
		next();
	});
};

// Middleware for multiple files upload
export const uploadMultipleImages = (req, res, next) => {
	uploadMultiple(req, res, (err) => {
		if (err) {
			return res.status(400).json({ success: false, message: err.message });
		}
		next();
	});
};
