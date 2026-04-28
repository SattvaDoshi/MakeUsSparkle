import CharmItem from "../models/charmItem.model.js";
import imageService from "./image.service.js";

class CharmItemService {
  async getCharmItems(queryParams = {}) {
    try {
      const filter = { active: true };

      if (queryParams.parentCategory) {
        filter.parentCategory = queryParams.parentCategory;
      }
      if (queryParams.charmCategory) {
        filter.charmCategory = queryParams.charmCategory;
      }

      const items = await CharmItem.find(filter).sort({ charmCategory: 1, sortOrder: 1, createdAt: 1 });
      return { success: true, charmItems: items };
    } catch (error) {
      console.error("Error fetching charm items:", error);
      throw error;
    }
  }

  async getCharmItemById(id) {
    try {
      const item = await CharmItem.findById(id);
      if (!item) throw new Error("Charm item not found");
      return { success: true, charmItem: item };
    } catch (error) {
      console.error("Error fetching charm item:", error);
      throw error;
    }
  }

  async createCharmItem(data, imageFile) {
    try {
      let imageUrl = data.image || "/images/hero.png";
      let imagePublicId = null;

      if (imageFile) {
        const uploaded = await imageService.uploadImage(imageFile.buffer, "charms");
        imageUrl = uploaded.url;
        imagePublicId = uploaded.publicId;
      }

      const item = await CharmItem.create({
        ...data,
        image: imageUrl,
        imagePublicId,
      });

      return { success: true, charmItem: item };
    } catch (error) {
      console.error("Error creating charm item:", error);
      throw error;
    }
  }

  async updateCharmItem(id, data, imageFile) {
    try {
      const item = await CharmItem.findById(id);
      if (!item) throw new Error("Charm item not found");

      if (imageFile) {
        if (item.imagePublicId) {
          await imageService.deleteImage(item.imagePublicId).catch((err) => console.error("Could not delete old charm image", err));
        }
        const uploaded = await imageService.uploadImage(imageFile.buffer, "charms");
        data.image = uploaded.url;
        data.imagePublicId = uploaded.publicId;
      }

      const updated = await CharmItem.findByIdAndUpdate(id, data, { returnDocument: "after" });
      return { success: true, charmItem: updated };
    } catch (error) {
      console.error("Error updating charm item:", error);
      throw error;
    }
  }

  async deleteCharmItem(id) {
    try {
      const item = await CharmItem.findById(id);
      if (!item) throw new Error("Charm item not found");

      if (item.imagePublicId) {
        await imageService.deleteImage(item.imagePublicId).catch((err) => console.error("Could not delete charm image", err));
      }

      await CharmItem.findByIdAndDelete(id);
      return { success: true, message: "Charm item deleted" };
    } catch (error) {
      console.error("Error deleting charm item:", error);
      throw error;
    }
  }

  async getCharmCategories(parentCategory) {
    try {
      const filter = { active: true };
      if (parentCategory) filter.parentCategory = parentCategory;

      const categories = await CharmItem.distinct("charmCategory", filter);
      return { success: true, charmCategories: categories };
    } catch (error) {
      console.error("Error fetching charm categories:", error);
      throw error;
    }
  }
}

export default new CharmItemService();
