import { uploadToCloudinary, deleteFromCloudinary } from "../config/upload.config.js";

class ImageService {
	async uploadImage(fileBuffer, folder = "products") {
		try {
			if (!fileBuffer) {
				throw new Error("No file buffer provided");
			}
			const result = await uploadToCloudinary(fileBuffer, folder);
			return {
				url: result.secure_url,
				publicId: result.public_id,
				format: result.format,
				size: result.bytes,
			};
		} catch (error) {
			console.error("Error uploading image:", error);
			throw new Error(`Image upload failed: ${error.message}`);
		}
	}

	async uploadMultipleImages(fileBuffers, folder = "products") {
		try {
			const uploadPromises = fileBuffers.map((buffer) => uploadToCloudinary(buffer, folder));
			const results = await Promise.all(uploadPromises);

			return results.map((result) => ({
				url: result.secure_url,
				publicId: result.public_id,
				format: result.format,
				size: result.bytes,
			}));
		} catch (error) {
			console.error("Error uploading multiple images:", error);
			throw new Error(`Multiple image upload failed: ${error.message}`);
		}
	}

	async deleteImage(publicId) {
		try {
			await deleteFromCloudinary(publicId);
			return { success: true, message: "Image deleted successfully" };
		} catch (error) {
			console.error("Error deleting image:", error);
			throw error;
		}
	}

	async deleteMultipleImages(publicIds) {
		try {
			const deletePromises = publicIds.map((id) => deleteFromCloudinary(id));
			await Promise.all(deletePromises);
			return { success: true, message: "Images deleted successfully" };
		} catch (error) {
			console.error("Error deleting multiple images:", error);
			throw error;
		}
	}
}

export default new ImageService();
