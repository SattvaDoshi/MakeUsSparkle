import Gender from "../models/gender.model.js";

class GenderService {
  async getGenders() {
    try {
      const genders = await Gender.find();
      return { success: true, genders };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getGenderById(id) {
    try {
      const gender = await Gender.findById(id);
      if (!gender) throw new Error("Gender not found");
      return { success: true, gender };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async createGender(data) {
    try {
      const gender = await Gender.create(data);
      return { success: true, gender };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateGender(id, data) {
    try {
      const gender = await Gender.findByIdAndUpdate(id, data, { returnDocument: "after" });
      if (!gender) throw new Error("Gender not found");
      return { success: true, gender };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async deleteGender(id) {
    try {
      const gender = await Gender.findByIdAndDelete(id);
      if (!gender) throw new Error("Gender not found");
      return { success: true, message: "Gender deleted successfully" };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

export default new GenderService();
