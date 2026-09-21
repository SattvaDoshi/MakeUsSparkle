import { uploadSingle, uploadMultiple, uploadProductImages, uploadHomeContentImages, uploadComboImages, uploadOpenSectionImages } from "../config/upload.config.js";

// Middleware for single file upload
export const uploadSingleImage = (req, res, next) => {
	uploadSingle(req, res, (err) => {
		if (err) {
			return res.status(400).json({ success: false, message: err.message });
		}
		next();
	});
};

// Middleware for multiple files upload (legacy)
export const uploadMultipleImages = (req, res, next) => {
	uploadMultiple(req, res, (err) => {
		if (err) {
			return res.status(400).json({ success: false, message: err.message });
		}
		next();
	});
};

// Middleware for product images (mainImage + images[] + variantImage_N)
export const uploadProductImageFields = (req, res, next) => {
	uploadProductImages(req, res, (err) => {
		if (err) {
			return res.status(400).json({ success: false, message: err.message });
		}
		next();
	});
};

export const uploadHomeContent = (req, res, next) => {
	uploadHomeContentImages(req, res, (err) => {
		if (err) {
			return res.status(400).json({ success: false, message: err.message });
		}
		next();
	});
};

export const uploadCombo = (req, res, next) => {
	uploadComboImages(req, res, (err) => {
		if (err) {
			return res.status(400).json({ success: false, message: err.message });
		}
		next();
	});
};

export const uploadOpenSection = (req, res, next) => {
	uploadOpenSectionImages(req, res, (err) => {
		if (err) {
			return res.status(400).json({ success: false, message: err.message });
		}
		next();
	});
};
