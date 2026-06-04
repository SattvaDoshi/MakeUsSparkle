import genderService from "../services/gender.service.js";
import imageService from "../services/image.service.js";

export async function getGenders(req, res) {
  try {
    const result = await genderService.getGenders();
    res.json(result);
  } catch (error) {
    console.error("Get genders error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function getGenderById(req, res) {
  try {
    const result = await genderService.getGenderById(req.params.id);
    res.json(result);
  } catch (error) {
    console.error("Get gender error:", error);
    res.status(404).json({ success: false, message: error.message });
  }
}

export async function createGender(req, res) {
  try {
    const data = { ...req.body };
    if (req.file) {
      const uploaded = await imageService.uploadImage(req.file.buffer, "genders");
      data.image = uploaded.url;
      data.imagePublicId = uploaded.publicId;
    }
    const result = await genderService.createGender(data);
    res.status(201).json(result);
  } catch (error) {
    console.error("Create gender error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function updateGender(req, res) {
  try {
    const data = { ...req.body };
    if (req.file) {
      const uploaded = await imageService.uploadImage(req.file.buffer, "genders");
      data.image = uploaded.url;
      data.imagePublicId = uploaded.publicId;
    }
    const result = await genderService.updateGender(req.params.id, data);
    res.json(result);
  } catch (error) {
    console.error("Update gender error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function deleteGender(req, res) {
  try {
    const result = await genderService.deleteGender(req.params.id);
    res.json(result);
  } catch (error) {
    console.error("Delete gender error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
}
