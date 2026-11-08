import Faq from "../models/faq.model.js";
import Review from "../models/review.model.js";
import { getSetting, setSetting } from "../models/appSettings.model.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/upload.config.js";

const FOUNDER_KEY = "founderMessage";
const FAQ_SETTINGS_KEY = "faqSettings";

const FOUNDER_DEFAULT = {
	isActive: false,
	desktopImage: "", desktopPublicId: "", desktopWidth: 0, desktopHeight: 0,
	mobileImage: "", mobilePublicId: "", mobileWidth: 0, mobileHeight: 0,
	alt: "A message from our founder",
	link: "",
};

const FAQ_SETTINGS_DEFAULT = {
	eyebrow: "Good to know",
	title: "Frequently asked questions",
	subtitle: "Everything you need to know about orders, shipping and caring for your jewellery.",
};

const clip = (v, n) => String(v ?? "").trim().slice(0, n);
const bool = (v, d = true) => (v === undefined || v === "" ? d : v === true || v === "true" || v === "1");

class SiteContentService {
	/* ───────── Founder message ───────── */
	async getFounder({ publicOnly = false } = {}) {
		const value = { ...FOUNDER_DEFAULT, ...((await getSetting(FOUNDER_KEY, {})) || {}) };
		if (publicOnly && (!value.isActive || !value.desktopImage)) return null;
		return value;
	}

	async saveFounder(body = {}, files = {}) {
		const current = await this.getFounder();
		const next = { ...current };

		const link = clip(body.link, 300);
		if (link && !/^(\/|https?:\/\/)/i.test(link)) throw new Error("Link must start with / or https://");
		next.link = link;
		next.alt = clip(body.alt, 200) || FOUNDER_DEFAULT.alt;
		next.isActive = bool(body.isActive, current.isActive);

		for (const slot of ["desktop", "mobile"]) {
			const file = files?.[`${slot}Image`]?.[0];
			const remove = bool(body[`remove${slot[0].toUpperCase()}${slot.slice(1)}`], false);
			if (file || remove) {
				if (current[`${slot}PublicId`]) await deleteFromCloudinary(current[`${slot}PublicId`]);
				next[`${slot}Image`] = ""; next[`${slot}PublicId`] = ""; next[`${slot}Width`] = 0; next[`${slot}Height`] = 0;
			}
			if (file) {
				const up = await uploadToCloudinary(file.buffer, "founder");
				next[`${slot}Image`] = up.secure_url;
				next[`${slot}PublicId`] = up.public_id;
				next[`${slot}Width`] = up.width || 0;
				next[`${slot}Height`] = up.height || 0;
			}
		}

		if (next.isActive && !next.desktopImage) throw new Error("Upload a banner image before showing this section");
		await setSetting(FOUNDER_KEY, next);
		return next;
	}

	/* ───────── FAQs ───────── */
	async getFaqSettings() {
		return { ...FAQ_SETTINGS_DEFAULT, ...((await getSetting(FAQ_SETTINGS_KEY, {})) || {}) };
	}

	async saveFaqSettings(body = {}) {
		const next = {
			eyebrow: clip(body.eyebrow, 60),
			title: clip(body.title, 120) || FAQ_SETTINGS_DEFAULT.title,
			subtitle: clip(body.subtitle, 300),
		};
		await setSetting(FAQ_SETTINGS_KEY, next);
		return next;
	}

	async listFaqs({ activeOnly = false } = {}) {
		return Faq.find(activeOnly ? { isActive: true } : {}).sort({ sortOrder: 1, createdAt: 1 }).limit(100).lean();
	}

	faqPayload(body, partial = false) {
		const out = {};
		if (body.question !== undefined) out.question = clip(body.question, 200);
		if (body.answer !== undefined) out.answer = clip(body.answer, 3000);
		if (body.isActive !== undefined) out.isActive = bool(body.isActive);
		if (body.sortOrder !== undefined) out.sortOrder = Number(body.sortOrder) || 0;
		if (!partial && (!out.question || !out.answer)) throw new Error("Both a question and an answer are required");
		if (partial && (out.question === "" || out.answer === "")) throw new Error("Question and answer can't be empty");
		return out;
	}

	async createFaq(body) {
		if ((await Faq.countDocuments({})) >= 100) throw new Error("FAQ limit reached");
		const payload = this.faqPayload(body);
		if (payload.sortOrder === undefined) {
			const last = await Faq.findOne({}).sort({ sortOrder: -1 }).select("sortOrder").lean();
			payload.sortOrder = last ? (last.sortOrder || 0) + 1 : 0;
		}
		return Faq.create(payload);
	}

	async updateFaq(id, body) {
		const doc = await Faq.findByIdAndUpdate(id, this.faqPayload(body, true), { new: true, runValidators: true });
		if (!doc) throw new Error("FAQ not found");
		return doc;
	}

	async deleteFaq(id) {
		const doc = await Faq.findByIdAndDelete(id);
		if (!doc) throw new Error("FAQ not found");
	}

	/* ───────── Featured reviews (homepage) ───────── */
	async featuredReviews() {
		const [docs, agg] = await Promise.all([
			Review.find({ rating: { $gte: 4 }, product: { $exists: true, $ne: null }, body: { $regex: /^[\s\S]{30,}$/ } })
				.sort({ createdAt: -1 })
				.limit(40)
				.populate("user", "name firstName lastName")
				.populate("product", "title mainImage images")
				.lean(),
			Review.aggregate([{ $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } }]),
		]);

		const reviews = docs
			.filter((r) => r.product && r.user)
			.map((r) => {
				const first = clip(r.user.firstName || String(r.user.name || "").split(/\s+/)[0] || "Customer", 30);
				const lastRaw = r.user.lastName || String(r.user.name || "").split(/\s+/).slice(1).join(" ");
				const last = lastRaw ? ` ${lastRaw.trim()[0].toUpperCase()}.` : ""; // privacy: first name + last initial only
				return {
					id: String(r._id),
					rating: r.rating,
					body: clip(r.body, 400),
					name: `${first}${last}`,
					verified: r.isVerifiedPurchase === true,
					date: r.createdAt,
					image: (r.images || [])[0] || "",
					product: {
						id: String(r.product._id),
						title: r.product.title || "",
						image: r.product.mainImage || (r.product.images || [])[0] || "",
					},
				};
			})
			.slice(0, 12);

		const stats = agg[0] ? { average: Math.round(agg[0].avg * 10) / 10, count: agg[0].count } : { average: 0, count: 0 };
		return { success: true, reviews, stats };
	}
}

export default new SiteContentService();
