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
	fileFilter: (req, file, cb) => {
		const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
		if (allowedMimes.includes(file.mimetype)) {
			cb(null, true);
		} else {
			cb(new Error("Only JPEG, PNG, WebP, and AVIF images are allowed"));
		}
	},
}).single("image");

// Multer middleware for multiple files
export const uploadMultiple = multer({
	storage: uploadStorage,
	fileFilter: (req, file, cb) => {
		const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
		if (allowedMimes.includes(file.mimetype)) {
			cb(null, true);
		} else {
			cb(new Error("Only JPEG, PNG, WebP, and AVIF images are allowed"));
		}
	},
}).array("images", 10);

// Product-specific multer: handles mainImage + images[] + variantImages[n] dynamically
export const uploadProductImages = multer({
	storage: uploadStorage,
	fileFilter: (req, file, cb) => {
		const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
		if (allowedMimes.includes(file.mimetype)) {
			cb(null, true);
		} else {
			cb(new Error("Only JPEG, PNG, WebP, and AVIF images are allowed"));
		}
	},
}).fields([
	{ name: "mainImage", maxCount: 1 },
	{ name: "images", maxCount: 20 },
	{ name: "sizeChartImage", maxCount: 1 },
	{ name: "giftBoxImage", maxCount: 1 },
	// Variant images will come as variantImage_<index> fields (dynamic)
	...Array.from({ length: 50 }, (_, i) => ({ name: `variantImage_${i}`, maxCount: 1 })),
	// Color images will come as colorImage_<index> fields (dynamic)
	...Array.from({ length: 20 }, (_, i) => ({ name: `colorImage_${i}`, maxCount: 1 })),
]);

// Home Content multer
export const uploadHomeContentImages = multer({
	storage: uploadStorage,
	fileFilter: (req, file, cb) => {
		const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
		if (allowedMimes.includes(file.mimetype)) {
			cb(null, true);
		} else {
			cb(new Error("Only JPEG, PNG, WebP, and AVIF images are allowed"));
		}
	},
}).fields([
	{ name: "women", maxCount: 1 },
	{ name: "men", maxCount: 1 },
	{ name: "kids", maxCount: 1 },
	{ name: "promoImage_0", maxCount: 1 },
	{ name: "promoImage_1", maxCount: 1 },
	{ name: "women_promoImage_0", maxCount: 1 },
	{ name: "women_promoImage_1", maxCount: 1 },
	{ name: "men_promoImage_0", maxCount: 1 },
	{ name: "men_promoImage_1", maxCount: 1 },
	{ name: "kids_promoImage_0", maxCount: 1 },
	{ name: "kids_promoImage_1", maxCount: 1 }
]);

// Combo images multer
export const uploadComboImages = multer({
	storage: uploadStorage,
	fileFilter: (req, file, cb) => {
		const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
		if (allowedMimes.includes(file.mimetype)) {
			cb(null, true);
		} else {
			cb(new Error("Only JPEG, PNG, WebP, and AVIF images are allowed"));
		}
	},
}).any();

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
