import Category from "../models/category.model.js";
import SubCategory from "../models/subCategory.model.js";

class CategoryService {
	async getCategories() {
		try {
			const categories = await Category.find();
			return { success: true, categories };
		} catch (error) {
			console.error("Error fetching categories:", error);
			throw error;
		}
	}

	async getCategoryById(categoryId) {
		try {
			const category = await Category.findById(categoryId);
			if (!category) {
				throw new Error("Category not found");
			}
			return { success: true, category };
		} catch (error) {
			console.error("Error fetching category:", error);
			throw error;
		}
	}

	async createCategory(categoryData) {
		try {
			const category = await Category.create(categoryData);
			return { success: true, category };
		} catch (error) {
			console.error("Error creating category:", error);
			throw error;
		}
	}

	async updateCategory(categoryId, updateData) {
		try {
			const category = await Category.findByIdAndUpdate(categoryId, updateData, { returnDocument: "after" });
			if (!category) {
				throw new Error("Category not found");
			}
			return { success: true, category };
		} catch (error) {
			console.error("Error updating category:", error);
			throw error;
		}
	}

	async deleteCategory(categoryId) {
		try {
			await Category.findByIdAndDelete(categoryId);
			return { success: true, message: "Category deleted successfully" };
		} catch (error) {
			console.error("Error deleting category:", error);
			throw error;
		}
	}

	async getSubCategories(categoryId) {
		try {
			const query = categoryId ? { category: categoryId } : {};
			const subcategories = await SubCategory.find(query).populate("category");
			return { success: true, subcategories };
		} catch (error) {
			console.error("Error fetching subcategories:", error);
			throw error;
		}
	}

	async createSubCategory(subCategoryData) {
		try {
			const subCategory = await SubCategory.create(subCategoryData);
			return { success: true, subCategory };
		} catch (error) {
			console.error("Error creating subcategory:", error);
			throw error;
		}
	}

	async updateSubCategory(subCategoryId, updateData) {
		try {
			const subCategory = await SubCategory.findByIdAndUpdate(subCategoryId, updateData, { returnDocument: "after" });
			if (!subCategory) {
				throw new Error("Subcategory not found");
			}
			return { success: true, subCategory };
		} catch (error) {
			console.error("Error updating subcategory:", error);
			throw error;
		}
	}

	async deleteSubCategory(subCategoryId) {
		try {
			await SubCategory.findByIdAndDelete(subCategoryId);
			return { success: true, message: "Subcategory deleted successfully" };
		} catch (error) {
			console.error("Error deleting subcategory:", error);
			throw error;
		}
	}
}

export default new CategoryService();
