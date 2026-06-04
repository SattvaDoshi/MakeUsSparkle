import Style from "../models/style.model.js";
import Gender from "../models/gender.model.js";
import mongoose from "mongoose";

class StyleService {
	async getStyles() {
		try {
			// fetch styles without populate to avoid casting errors when gender is a string
			const styles = await Style.find().sort({ name: 1 }).lean();

			// resolve any string gender values safely (by _id, slug, or name)
			for (const s of styles) {
				if (!s.gender) continue;
				// already populated object
				if (typeof s.gender === "object" && !(s.gender instanceof mongoose.Types.ObjectId)) continue;
				const raw = String(s.gender);
				let genderDoc = null;
				if (mongoose.Types.ObjectId.isValid(raw)) {
					genderDoc = await Gender.findById(raw).lean();
				}
				if (!genderDoc) {
					const slug = raw.toLowerCase();
					genderDoc = await Gender.findOne({ slug }).lean();
				}
				if (!genderDoc) {
					genderDoc = await Gender.findOne({ name: new RegExp(`^${raw}$`, "i") }).lean();
				}
				// keep the original string if we couldn't resolve to a document
				if (genderDoc) s.gender = genderDoc;
				else s.gender = raw;
			}

			return { success: true, styles };
		} catch (error) {
			throw new Error(error.message);
		}
	}

	async getStyleById(styleId) {
		try {
			const style = await Style.findById(styleId).lean();
			if (!style) throw new Error("Style not found");
			if (style.gender) {
				const raw = String(style.gender);
				let genderDoc = null;
				if (mongoose.Types.ObjectId.isValid(raw)) {
					genderDoc = await Gender.findById(raw).lean();
				}
				if (!genderDoc) {
					genderDoc = await Gender.findOne({ slug: raw }).lean();
				}
				if (!genderDoc) {
					genderDoc = await Gender.findOne({ name: new RegExp(`^${raw}$`, "i") }).lean();
				}
				if (genderDoc) style.gender = genderDoc;
				else style.gender = raw;
			}
			return { success: true, style };
		} catch (error) {
			throw new Error(error.message);
		}
	}

	async createStyle(styleData) {
		try {
			// normalize gender when provided as a slug or name
			if (styleData && styleData.gender && typeof styleData.gender === "string") {
				const raw = String(styleData.gender).toLowerCase();
				let genderDoc = null;
				// try find by _id first
				if (mongoose.Types.ObjectId.isValid(raw)) {
					genderDoc = await Gender.findById(raw);
				}
				if (!genderDoc) {
					genderDoc = await Gender.findOne({ slug: raw }) || await Gender.findOne({ name: new RegExp(`^${raw}$`, 'i') });
				}
				if (genderDoc) styleData.gender = genderDoc._id;
			}
			const style = await Style.create(styleData);
			// normalize returned style.gender to the full gender doc or slug
			const result = style.toObject ? style.toObject() : style;
			if (result && result.gender) {
				const raw = String(result.gender);
				let genderDoc = null;
				if (mongoose.Types.ObjectId.isValid(raw)) {
					genderDoc = await Gender.findById(raw).lean();
				}
				if (!genderDoc) {
					genderDoc = await Gender.findOne({ slug: raw }).lean();
				}
				if (!genderDoc) {
					genderDoc = await Gender.findOne({ name: new RegExp(`^${raw}$`, "i") }).lean();
				}
				if (genderDoc) result.gender = genderDoc;
				else result.gender = raw;
			}
			return { success: true, style: result };
		} catch (error) {
			throw new Error(error.message);
		}
	}

	async updateStyle(styleId, updateData) {
		try {
			// normalize gender when provided as a slug or name
			if (updateData && updateData.gender && typeof updateData.gender === "string") {
				const raw = String(updateData.gender).toLowerCase();
				let genderDoc = null;
				if (mongoose.Types.ObjectId.isValid(raw)) {
					genderDoc = await Gender.findById(raw);
				}
				if (!genderDoc) {
					genderDoc = await Gender.findOne({ slug: raw }) || await Gender.findOne({ name: new RegExp(`^${raw}$`, 'i') });
				}
				if (genderDoc) updateData.gender = genderDoc._id;
			}
			const style = await Style.findByIdAndUpdate(styleId, updateData, { returnDocument: "after" });
			if (!style) throw new Error("Style not found");
			const result = style.toObject ? style.toObject() : style;
			if (result && result.gender) {
				const raw = String(result.gender);
				let genderDoc = null;
				if (mongoose.Types.ObjectId.isValid(raw)) {
					genderDoc = await Gender.findById(raw).lean();
				}
				if (!genderDoc) {
					genderDoc = await Gender.findOne({ slug: raw }).lean();
				}
				if (!genderDoc) {
					genderDoc = await Gender.findOne({ name: new RegExp(`^${raw}$`, "i") }).lean();
				}
				if (genderDoc) result.gender = genderDoc;
				else result.gender = raw;
			}
			return { success: true, style: result };
		} catch (error) {
			throw new Error(error.message);
		}
	}

	async deleteStyle(styleId) {
		try {
			const style = await Style.findByIdAndDelete(styleId);
			if (!style) throw new Error("Style not found");
			return { success: true, message: "Style deleted successfully" };
		} catch (error) {
			throw new Error(error.message);
		}
	}
}

export default new StyleService();
