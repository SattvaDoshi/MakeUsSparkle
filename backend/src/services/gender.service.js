import mongoose from "mongoose";
import Gender from "../models/gender.model.js";

const DEFAULT_GENDERS = [
  { name: "Women", slug: "women" },
  { name: "Men", slug: "men" },
];

const toSlug = (value = "") =>
  value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const normalizeGender = (gender) => ({
  ...gender,
  slug: gender.slug || toSlug(gender.name),
  isActive: gender.isActive !== false,
});

class GenderService {
  async getGenders() {
    try {
      const genders = await Gender.find({ isActive: { $ne: false } }).sort({ name: 1 }).lean();
      const genderMap = new Map();

      genders.map(normalizeGender).forEach((gender) => {
        genderMap.set(gender.slug, gender);
      });

      DEFAULT_GENDERS.forEach((gender) => {
        if (!genderMap.has(gender.slug)) {
          genderMap.set(gender.slug, {
            _id: gender.slug,
            name: gender.name,
            slug: gender.slug,
            isActive: true,
          });
        }
      });

      return { success: true, genders: Array.from(genderMap.values()) };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getGenderById(id) {
    try {
      const gender = mongoose.isValidObjectId(id)
        ? await Gender.findById(id)
        : await Gender.findOne({ slug: id });
      if (!gender) throw new Error("Gender not found");
      return { success: true, gender };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async createGender(data) {
    try {
      const gender = await Gender.create({
        ...data,
        slug: data.slug || toSlug(data.name),
      });
      return { success: true, gender };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateGender(id, data) {
    try {
      const query = mongoose.isValidObjectId(id) ? { _id: id } : { slug: id };
      const gender = await Gender.findOneAndUpdate(
        query,
        {
          ...data,
          ...(data.name && !data.slug ? { slug: toSlug(data.name) } : {}),
        },
        { returnDocument: "after" }
      );
      if (!gender) throw new Error("Gender not found");
      return { success: true, gender };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async deleteGender(id) {
    try {
      let gender = null;
      if (mongoose.isValidObjectId(id)) {
        gender = await Gender.findByIdAndDelete(id);
      } else {
        // try delete by slug
        gender = await Gender.findOneAndDelete({ slug: id });
        // if not found, it's likely a default slug that doesn't exist in DB
        if (!gender) throw new Error("Cannot delete default gender or gender not found");
      }
      return { success: true, message: "Gender deleted successfully" };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

export default new GenderService();
