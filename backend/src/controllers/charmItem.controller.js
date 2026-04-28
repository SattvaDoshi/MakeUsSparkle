import charmItemService from "../services/charmItem.service.js";

export async function getCharmItems(req, res) {
  try {
    const result = await charmItemService.getCharmItems(req.query);
    res.json(result);
  } catch (error) {
    console.error("Get charm items error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function getCharmItemById(req, res) {
  try {
    const result = await charmItemService.getCharmItemById(req.params.id);
    res.json(result);
  } catch (error) {
    console.error("Get charm item by ID error:", error);
    res.status(404).json({ success: false, message: error.message });
  }
}

export async function getCharmCategories(req, res) {
  try {
    const result = await charmItemService.getCharmCategories(req.query.parentCategory);
    res.json(result);
  } catch (error) {
    console.error("Get charm categories error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
}
