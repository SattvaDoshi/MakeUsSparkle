import { v2 as cloudinary } from "cloudinary";
import WatchBuyVideo from "../models/watchBuyVideo.model.js";
import Product from "../models/product.model.js";
import productService from "./product.service.js";
import "../config/upload.config.js"; // configures cloudinary

export const WATCH_BUY_FOLDER = "makeusparkle/watch-buy";
const MAX_VIDEOS = 24;

function cloudName() {
	return process.env.CLOUDINARY_CLOUD_NAME || "";
}

/** Light, mobile-friendly delivery URLs built from the Cloudinary id. */
function deliveryUrls(doc) {
	const base = `https://res.cloudinary.com/${cloudName()}/video/upload`;
	if (doc.publicId && cloudName()) {
		return {
			// H.264 mp4, auto quality, capped at 540px wide, audio kept low-bitrate.
			src: `${base}/f_mp4,vc_h264,q_auto:eco,w_540,c_limit,ac_aac/${doc.publicId}.mp4`,
			poster:
				doc.posterUrl ||
				`${base}/so_0,f_auto,q_auto,w_360,h_640,c_fill,g_auto/${doc.publicId}.jpg`,
		};
	}
	return { src: doc.videoUrl, poster: doc.posterUrl || "" };
}

function serialize(doc) {
	const obj = typeof doc.toObject === "function" ? doc.toObject() : doc;
	const { src, poster } = deliveryUrls(obj);
	return { ...obj, src, poster };
}

function assertValid(data, { partial = false } = {}) {
	const out = {};
	if (data.title !== undefined) out.title = String(data.title).trim().slice(0, 120);
	if (data.product !== undefined) out.product = String(data.product).trim();
	if (data.publicId !== undefined) {
		const id = String(data.publicId).trim();
		if (id && !id.startsWith(`${WATCH_BUY_FOLDER}/`)) throw new Error("Invalid video asset id");
		out.publicId = id;
	}
	if (data.videoUrl !== undefined) {
		const url = String(data.videoUrl).trim();
		if (url && !/^https:\/\//i.test(url)) throw new Error("Video URL must start with https://");
		out.videoUrl = url;
	}
	if (data.posterUrl !== undefined) {
		const url = String(data.posterUrl).trim();
		if (url && !/^https:\/\//i.test(url)) throw new Error("Poster URL must start with https://");
		out.posterUrl = url;
	}
	if (data.duration !== undefined) out.duration = Math.max(0, Number(data.duration) || 0);
	if (data.isActive !== undefined) out.isActive = data.isActive === true || data.isActive === "true";
	if (data.sortOrder !== undefined) out.sortOrder = Number(data.sortOrder) || 0;

	if (!partial) {
		if (!out.product) throw new Error("Choose the product this video sells");
		if (!out.publicId && !out.videoUrl) throw new Error("Upload a video or paste a video URL");
	}
	return out;
}

class WatchBuyService {
	/** Signed params so the admin browser can upload a video directly to Cloudinary. */
	signUpload() {
		if (!cloudName() || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
			throw new Error("Cloudinary is not configured on the server");
		}
		const timestamp = Math.round(Date.now() / 1000);
		const params = { folder: WATCH_BUY_FOLDER, timestamp };
		const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET);
		return {
			success: true,
			cloudName: cloudName(),
			apiKey: process.env.CLOUDINARY_API_KEY,
			folder: WATCH_BUY_FOLDER,
			timestamp,
			signature,
			uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName()}/video/upload`,
		};
	}

	async listPublic() {
		const docs = await WatchBuyVideo.find({ isActive: true })
			.sort({ sortOrder: 1, createdAt: -1 })
			.limit(MAX_VIDEOS)
			.populate("product");
		const items = docs.filter((d) => d.product && d.product.isActive !== false).map(serialize);
		await productService.attachOfferTags(items.map((i) => i.product));
		return { success: true, videos: items };
	}

	async listAdmin() {
		const docs = await WatchBuyVideo.find({})
			.sort({ sortOrder: 1, createdAt: -1 })
			.populate("product", "title mainImage images price");
		return { success: true, videos: docs.map(serialize) };
	}

	async create(data) {
		if ((await WatchBuyVideo.countDocuments({})) >= 60) throw new Error("Video limit reached — delete one first");
		const payload = assertValid(data);
		if (!(await Product.exists({ _id: payload.product }))) throw new Error("Product not found");
		const doc = await WatchBuyVideo.create(payload);
		return { success: true, video: serialize(doc) };
	}

	async update(id, data) {
		const payload = assertValid(data, { partial: true });
		if (payload.product && !(await Product.exists({ _id: payload.product }))) throw new Error("Product not found");
		const doc = await WatchBuyVideo.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
		if (!doc) throw new Error("Video not found");
		return { success: true, video: serialize(doc) };
	}

	async remove(id) {
		const doc = await WatchBuyVideo.findByIdAndDelete(id);
		if (!doc) throw new Error("Video not found");
		if (doc.publicId) {
			try {
				await cloudinary.uploader.destroy(doc.publicId, { resource_type: "video", invalidate: true });
			} catch (err) {
				console.error("Watch&Buy: failed to delete Cloudinary video", err);
			}
		}
		return { success: true, message: "Video deleted" };
	}
}

export default new WatchBuyService();
