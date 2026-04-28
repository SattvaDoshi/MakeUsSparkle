import charmItemService from "../../services/charmItem.service.js";

export async function createCharmItem(req, res) {
  try {
    const imageFile = req.file || null;
    const result = await charmItemService.createCharmItem(req.body, imageFile);
    res.status(201).json(result);
  } catch (error) {
    console.error("Admin create charm item error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function updateCharmItem(req, res) {
  try {
    const imageFile = req.file || null;
    const result = await charmItemService.updateCharmItem(req.params.id, req.body, imageFile);
    res.json(result);
  } catch (error) {
    console.error("Admin update charm item error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function deleteCharmItem(req, res) {
  try {
    const result = await charmItemService.deleteCharmItem(req.params.id);
    res.json(result);
  } catch (error) {
    console.error("Admin delete charm item error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function getAllCharmItems(req, res) {
  try {
    const result = await charmItemService.getCharmItems(req.query);
    res.json(result);
  } catch (error) {
    console.error("Admin get charm items error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
}
