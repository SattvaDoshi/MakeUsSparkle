import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer for temporary storage
export const uploadStorage = multer.memoryStorage();

// Multer middleware for single file
export const uploadSingle = multer({
	storage: uploadStorage,
	limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
	fileFilter: (req, file, cb) => {
		const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
		if (allowedMimes.includes(file.mimetype)) {
			cb(null, true);
		} else {
			cb(new Error("Only JPEG, PNG, and WebP images are allowed"));
		}
	},
}).single("image");

// Multer middleware for multiple files
export const uploadMultiple = multer({
	storage: uploadStorage,
	limits: { fileSize: 5 * 1024 * 1024 },
	fileFilter: (req, file, cb) => {
		const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
		if (allowedMimes.includes(file.mimetype)) {
			cb(null, true);
		} else {
			cb(new Error("Only JPEG, PNG, and WebP images are allowed"));
		}
	},
}).array("images", 10);

// Cloudinary upload helper
export const uploadToCloudinary = async (fileBuffer, folder) => {
	return new Promise((resolve, reject) => {
		const uploadStream = cloudinary.uploader.upload_stream(
			{
				folder: `makeusparkle/${folder}`,
				resource_type: "auto",
			},
			(error, result) => {
				if (error) reject(error);
				else resolve(result);
			}
		);

		uploadStream.end(fileBuffer);
	});
};

// Delete from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
	try {
		await cloudinary.uploader.destroy(publicId);
	} catch (error) {
		console.error("Error deleting from Cloudinary:", error);
	}
};

export default cloudinary;
