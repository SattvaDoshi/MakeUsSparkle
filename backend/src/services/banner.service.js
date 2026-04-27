import Banner from "../models/banner.model.js";
import imageService from "./image.service.js";

class BannerService {
	buildBannerPayload(data = {}) {
		const normalizedTitle = (data.title || data.text || "").trim();
		const normalizedSubtitle = (data.subtitle || data.description || "").trim();

		return {
			text: (data.text || normalizedTitle).trim(),
			title: normalizedTitle,
			subtitle: normalizedSubtitle,
			tag: (data.tag || "").trim(),
			cta: (data.cta || "Shop Now").trim(),
			link: (data.link || "").trim(),
			description: (data.description || normalizedSubtitle).trim(),
			tags: Array.isArray(data.tags) ? data.tags : [],
			product: data.product || undefined,
			image: typeof data.image === "string" ? data.image.trim() : "",
			imageAlt: (data.imageAlt || "").trim(),
			isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
			sortOrder: Number.isFinite(Number(data.sortOrder)) ? Number(data.sortOrder) : 0,
		};
	}

	async getBanners() {
		try {
			const banners = await Banner.find({ isActive: true }).sort({ sortOrder: 1, createdAt: -1 });
			return { success: true, banners };
		} catch (error) {
			console.error("Error fetching banners:", error);
			throw error;
		}
	}

	async createBanner(bannerData, imageBuffer = null) {
		try {
			const payload = this.buildBannerPayload(bannerData);

			// Upload image if provided
			if (imageBuffer) {
				const uploadedImage = await imageService.uploadImage(imageBuffer, "banners");
				payload.image = uploadedImage.url;
				payload.imagePublicId = uploadedImage.publicId;
			}

			const banner = await Banner.create(payload);

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

			const payload = this.buildBannerPayload({ ...banner.toObject(), ...updateData });

			// Handle image update
			if (newImageBuffer) {
				if (banner.imagePublicId) {
					await imageService.deleteImage(banner.imagePublicId);
				}

				const uploadedImage = await imageService.uploadImage(newImageBuffer, "banners");
				payload.image = uploadedImage.url;
				payload.imagePublicId = uploadedImage.publicId;
			}

			const updatedBanner = await Banner.findByIdAndUpdate(bannerId, payload, { returnDocument: "after" });

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
