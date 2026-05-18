import Banner from "../models/banner.model.js";
import imageService from "./image.service.js";

class BannerService {
	parseTags(value) {
		if (Array.isArray(value)) {
			return value.map((item) => String(item).trim()).filter(Boolean);
		}

		if (typeof value === "string") {
			const trimmed = value.trim();
			if (!trimmed) return [];

			if (trimmed.startsWith("[")) {
				try {
					const parsed = JSON.parse(trimmed);
					if (Array.isArray(parsed)) {
						return parsed.map((item) => String(item).trim()).filter(Boolean);
					}
				} catch {
					// Fall back to comma-separated parsing.
				}
			}

			return trimmed.split(",").map((item) => item.trim()).filter(Boolean);
		}

		return [];
	}

	parseBoolean(value, defaultValue = true) {
		if (value === undefined || value === null || value === "") {
			return defaultValue;
		}

		if (typeof value === "boolean") {
			return value;
		}

		if (typeof value === "number") {
			return value !== 0;
		}

		if (typeof value === "string") {
			const normalized = value.trim().toLowerCase();
			if (normalized === "true" || normalized === "1") return true;
			if (normalized === "false" || normalized === "0") return false;
		}

		return defaultValue;
	}

	buildBannerPayload(data = {}) {
		const normalizedTitle = (data.title || data.text || "").trim();
		const normalizedSubtitle = (data.subtitle || data.description || "").trim();
		const normalizedBannerType = String(data.bannerType || "promo").trim().toLowerCase() === "main" ? "main" : "promo";

		return {
			bannerType: normalizedBannerType,
			text: (data.text || normalizedTitle).trim(),
			title: normalizedTitle,
			subtitle: normalizedSubtitle,
			tag: (data.tag || "").trim(),
			cta: (data.cta || "Shop Now").trim(),
			link: (data.link || "").trim(),
			description: (data.description || normalizedSubtitle).trim(),
			tags: this.parseTags(data.tags),
			product: data.product || undefined,
			image: typeof data.image === "string" ? data.image.trim() : "",
			imageAlt: (data.imageAlt || "").trim(),
			isActive: this.parseBoolean(data.isActive, true),
			sortOrder: Number.isFinite(Number(data.sortOrder)) ? Number(data.sortOrder) : 0,
		};
	}

	buildMainBannerPayload(data = {}, existingBanner = null) {
		return {
			bannerType: "main",
			link: (data.link || existingBanner?.link || "").trim(),
			isActive: this.parseBoolean(data.isActive, existingBanner?.isActive ?? true),
			image: typeof data.image === "string" && data.image.trim()
				? data.image.trim()
				: (existingBanner?.image || ""),
			imageAlt: (data.imageAlt || existingBanner?.imageAlt || "Main Banner").trim(),
			title: existingBanner?.title || "",
			subtitle: existingBanner?.subtitle || "",
			tag: existingBanner?.tag || "",
			cta: existingBanner?.cta || "",
			text: existingBanner?.text || "",
			description: existingBanner?.description || "",
			tags: existingBanner?.tags || [],
			sortOrder: existingBanner?.sortOrder ?? 0,
			product: existingBanner?.product || undefined,
		};
	}

	async getBanners() {
		try {
			const banners = await Banner.find({
				isActive: true,
				$or: [{ bannerType: "promo" }, { bannerType: { $exists: false } }],
			}).sort({ sortOrder: 1, createdAt: -1 });
			return { success: true, banners };
		} catch (error) {
			console.error("Error fetching banners:", error);
			throw error;
		}
	}

	async getMainBanner() {
		try {
			const banner = await Banner.findOne({ bannerType: "main", isActive: true }).sort({ updatedAt: -1, createdAt: -1 });
			return { success: true, banner };
		} catch (error) {
			console.error("Error fetching main banner:", error);
			throw error;
		}
	}

	async getMainBannersAdmin() {
		try {
			const banners = await Banner.find({ bannerType: "main" }).sort({ createdAt: -1 });
			return { success: true, banners };
		} catch (error) {
			console.error("Error fetching main banners:", error);
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

	async createMainBanner(bannerData, imageBuffer = null) {
		try {
			const payload = this.buildMainBannerPayload(bannerData);

			if (imageBuffer) {
				const uploadedImage = await imageService.uploadImage(imageBuffer, "banners");
				payload.image = uploadedImage.url;
				payload.imagePublicId = uploadedImage.publicId;
			}

			if (!payload.image) {
				throw new Error("Main banner image is required");
			}

			const banner = await Banner.create(payload);
			return { success: true, banner };
		} catch (error) {
			console.error("Error creating main banner:", error);
			throw error;
		}
	}

	async updateMainBanner(bannerId, updateData, newImageBuffer = null) {
		try {
			const banner = await Banner.findById(bannerId);
			if (!banner || banner.bannerType !== "main") {
				throw new Error("Main banner not found");
			}

			const payload = this.buildMainBannerPayload(updateData, banner);

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
			console.error("Error updating main banner:", error);
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
