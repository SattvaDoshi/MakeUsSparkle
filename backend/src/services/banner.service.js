import Banner from "../models/banner.model.js";
import imageService from "./image.service.js";

class BannerService {
	async getBanners() {
		try {
			const banners = await Banner.find().sort({ createdAt: -1 });
			return { success: true, banners };
		} catch (error) {
			console.error("Error fetching banners:", error);
			throw error;
		}
	}

	async createBanner(bannerData, imageBuffer = null) {
		try {
			let imageUrl = null;
			let imagePublicId = null;

			// Upload image if provided
			if (imageBuffer) {
				const uploadedImage = await imageService.uploadImage(imageBuffer, "banners");
				imageUrl = uploadedImage.url;
				imagePublicId = uploadedImage.publicId;
			}

			const banner = await Banner.create({
				...bannerData,
				image: imageUrl,
				imagePublicId,
			});

			return { success: true, banner };
		} catch (error) {
			console.error("Error creating banner:", error);
			throw error;
		}
	}

	async updateBanner(bannerId, updateData, newImageBuffer = null) {
		try {
			const banner = await Banner.findById(bannerId);
			if (!banner) {
				throw new Error("Banner not found");
			}

			// Handle image update
			if (newImageBuffer) {
				if (banner.imagePublicId) {
					await imageService.deleteImage(banner.imagePublicId);
				}

				const uploadedImage = await imageService.uploadImage(newImageBuffer, "banners");
				updateData.image = uploadedImage.url;
				updateData.imagePublicId = uploadedImage.publicId;
			}

			const updatedBanner = await Banner.findByIdAndUpdate(bannerId, updateData, { returnDocument: "after" });

			return { success: true, banner: updatedBanner };
		} catch (error) {
			console.error("Error updating banner:", error);
			throw error;
		}
	}

	async deleteBanner(bannerId) {
		try {
			const banner = await Banner.findById(bannerId);
			if (!banner) {
				throw new Error("Banner not found");
			}

			// Delete image from Cloudinary
			if (banner.imagePublicId) {
				await imageService.deleteImage(banner.imagePublicId);
			}

			await Banner.findByIdAndDelete(bannerId);

			return { success: true, message: "Banner deleted successfully" };
		} catch (error) {
			console.error("Error deleting banner:", error);
			throw error;
		}
	}
}

export default new BannerService();
