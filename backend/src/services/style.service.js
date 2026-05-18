import Style from "../models/style.model.js";

class StyleService {
	async getStyles() {
		try {
			const styles = await Style.find().populate("gender").sort({ name: 1 });
			return { success: true, styles };
		} catch (error) {
			throw new Error(error.message);
		}
	}

	async getStyleById(styleId) {
		try {
			const style = await Style.findById(styleId);
			if (!style) throw new Error("Style not found");
			return { success: true, style };
		} catch (error) {
			throw new Error(error.message);
		}
	}

	async createStyle(styleData) {
		try {
			const style = await Style.create(styleData);
			return { success: true, style };
		} catch (error) {
			throw new Error(error.message);
		}
	}

	async updateStyle(styleId, updateData) {
		try {
			const style = await Style.findByIdAndUpdate(styleId, updateData, { returnDocument: "after" });
			if (!style) throw new Error("Style not found");
			return { success: true, style };
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
