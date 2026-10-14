import Product from "../models/product.model.js";

const OBJECT_ID_PATTERN = /^[0-9a-fA-F]{24}$/;

/* ─────────────────────────────────────────────────────────────
   SELECTION CATEGORY REGISTRY
   ─────────────────────────────────────────────────────────────
   Maps a product category key  →  the configuration used when
   normalising selectionGroups for that category.

   To support a new selectable-item category (e.g. "bracelets"):
     registerSelectionCategory("bracelets", {
       type:           "multi_item_selection",
       label:          "Bracelets",
       selectionKey:   "selectedCharms",
       itemRefModel:   "CharmItem",
     });

   That's it — no other code changes required.
──────────────────────────────────────────────────────────────── */

/** @type {Map<string, { type: string; label: string; selectionKey: string; itemRefModel: string }>} */
const selectionCategoryRegistry = new Map();

/**
 * Register a new product category that uses the multi-item selection flow.
 *
 * @param {string} categoryKey  The value stored in order items' `category` field.
 * @param {{ type?: string; label: string; selectionKey?: string; itemRefModel?: string }} config
 */
export function registerSelectionCategory(categoryKey, config) {
	selectionCategoryRegistry.set(categoryKey, {
		type: config.type || "multi_item_selection",
		label: config.label,
		selectionKey: config.selectionKey || "selectedCharms",
		itemRefModel: config.itemRefModel || "CharmItem",
	});
}

/**
 * Returns the registered config for a category, or a sensible generic fallback.
 * @param {string} category
 */
export function getProductSelectionConfig(category) {
	return selectionCategoryRegistry.get(category) || null;
}

/**
 * Returns true if the given category has a registered multi-select config.
 * @param {string} category
 */
export function isSelectableCategory(category) {
	return selectionCategoryRegistry.has(category);
}

// ── Built-in registrations ──────────────────────────────────────────────────
// Register the two known selectable-item product categories.
// New categories can be registered in the same way from any module.

registerSelectionCategory("custom-charm-jewellery", {
	label: "Custom Charm Jewellery",
	selectionKey: "selectedCharms",
	itemRefModel: "CharmItem",
});

registerSelectionCategory("keychains", {
	label: "Keychains",
	selectionKey: "selectedCharms",
	itemRefModel: "CharmItem",
});

// ── Utility helpers ─────────────────────────────────────────────────────────

function isObjectId(value) {
	return OBJECT_ID_PATTERN.test(String(value || "").trim());
}

function asNumber(value, fallback = 0) {
	const numericValue = Number(value);
	return Number.isFinite(numericValue) ? numericValue : fallback;
}

function asPositiveInteger(value, fallback = 1) {
	return Math.max(1, Math.trunc(asNumber(value, fallback)));
}

function normalizeImageList(images) {
	if (!Array.isArray(images)) return [];
	return images.map((image) => String(image || "").trim()).filter(Boolean);
}

// ── Normalization helpers ────────────────────────────────────────────────────

function normalizeSelectionItem(entry = {}, group = {}) {
	const rawItemId = entry.item || entry.charm || entry.product || entry.id || entry._id;
	const item = isObjectId(rawItemId) ? String(rawItemId) : undefined;

	return {
		item,
		sourceId: item ? undefined : rawItemId ? String(rawItemId) : undefined,
		name: entry.name ? String(entry.name) : undefined,
		quantity: asPositiveInteger(entry.quantity ?? entry.qty, 1),
		price: asNumber(entry.price, 0),
		image: entry.image ? String(entry.image) : undefined,
		images: normalizeImageList(entry.images || entry.customImages),
		emoji: entry.emoji ? String(entry.emoji) : undefined,
		customText:
			entry.customText || entry.customNote || entry.note
				? String(entry.customText || entry.customNote || entry.note)
				: undefined,
		customData:
			entry.customData && typeof entry.customData === "object"
				? entry.customData
				: undefined,
	};
}

function normalizeSelectionGroup(group = {}, fallback = {}) {
	const items = Array.isArray(group.items)
		? group.items
				.map((item) => normalizeSelectionItem(item, group))
				.filter((item) => item.item || item.sourceId || item.name)
		: [];

	return {
		type: group.type || fallback.type || "multi_item_selection",
		category: group.category || group.parentCategory || fallback.category,
		label: group.label || fallback.label,
		selectionKey: group.selectionKey || fallback.selectionKey,
		itemRefModel: group.itemRefModel || fallback.itemRefModel || "CharmItem",
		items,
		metadata:
			group.metadata && typeof group.metadata === "object"
				? group.metadata
				: undefined,
	};
}

// ── Product ID resolver ──────────────────────────────────────────────────────

export async function resolveProductId(item = {}) {
	const directId = String(item.product || item.sourceId || item.id || "").trim();
	if (isObjectId(directId)) {
		return directId;
	}

	const title = String(item.name || "").trim();
	if (!title) {
		return undefined;
	}

	const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const product = await Product.findOne({
		title: new RegExp(`^${escaped}$`, "i"),
	})
		.select("_id")
		.lean();
	return product ? String(product._id) : undefined;
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Merge explicit selectionGroups from the cart item with any selectedCharms
 * array, producing a clean normalized array ready to store in the Order model.
 *
 * Backward-compatible: items without selectionGroups/selectedCharms simply
 * return an empty array and are stored as regular products.
 *
 * @param {object} item  Raw cart item from the frontend payload.
 * @returns {Array}  Normalized selectionGroups array.
 */
export function normalizeSelectionGroups(item = {}) {
	// 1. Normalize any explicitly provided selectionGroups
	const explicitGroups = Array.isArray(item.selectionGroups)
		? item.selectionGroups
		: [];
	const groups = explicitGroups
		.map((group) => normalizeSelectionGroup(group))
		.filter((group) => group.items.length > 0);

	// 2. Fall back: if selectedCharms[] is provided but no matching group exists,
	//    synthesise a group using the registry (or a generic fallback).
	const selectedCharms = Array.isArray(item.selectedCharms)
		? item.selectedCharms
		: [];

	if (
		selectedCharms.length > 0 &&
		!groups.some((group) => group.selectionKey === "selectedCharms")
	) {
		const category =
			item.category || item.parentCategory || item.sourceId;

		// Look up registry; fall back to a generic config if category is unknown
		const config = getProductSelectionConfig(category) || {
			type: "multi_item_selection",
			label: category || "Items",
			selectionKey: "selectedCharms",
			itemRefModel: "CharmItem",
		};

		groups.push(
			normalizeSelectionGroup(
				{
					type: config.type,
					category,
					label: config.label,
					selectionKey: "selectedCharms",
					itemRefModel: config.itemRefModel,
					items: selectedCharms.map((selection) =>
						typeof selection === "string" ? { id: selection } : selection
					),
				},
				config
			)
		);
	}

	return groups;
}

/**
 * Fully normalize a single cart item into the shape expected by the Order model.
 * Handles both regular products and charm/keychain selection products.
 *
 * @param {object} item  Raw cart item.
 * @returns {Promise<object>}  Normalized order item.
 */
export async function normalizeOrderItem(item = {}) {
	const selectionGroups = normalizeSelectionGroups(item);

	// Collect resolved CharmItem ObjectIds from all selectionGroups
	const selectedCharms = selectionGroups
		.flatMap((group) =>
			group.selectionKey === "selectedCharms" ? group.items : []
		)
		.map((selection) => selection.item)
		.filter(Boolean);

	return {
		product: await resolveProductId(item),
		sourceId:
			item.sourceId || item.id
				? String(item.sourceId || item.id)
				: undefined,
		name: item.name ? String(item.name) : undefined,
		category:
			item.category || item.parentCategory
				? String(item.category || item.parentCategory)
				: undefined,
		quantity: asPositiveInteger(item.quantity ?? item.qty, 1),
		price: asNumber(item.price, 0),
		color: item.color ? String(item.color) : undefined,
		colorHex: item.colorHex ? String(item.colorHex) : undefined,
		size: item.size ? String(item.size) : undefined,
		sku: item.sku ? String(item.sku) : undefined,
		customNote: item.customNote,
		customImages: normalizeImageList(item.customImages),
		customData:
			item.customData && typeof item.customData === "object"
				? item.customData
				: undefined,
		giftBox: Boolean(item.giftBox),
		giftBoxDetails:
			item.giftBoxDetails && typeof item.giftBoxDetails === "object"
				? {
						heading: item.giftBoxDetails.heading || "Premium Gift Box",
						description: item.giftBoxDetails.description,
						price: asNumber(item.giftBoxDetails.price, 99),
						image: item.giftBoxDetails.image,
				  }
				: item.giftBox
				? {
						heading: "Premium Gift Box",
						price: 99,
				  }
				: undefined,
		selectedCharms,
		selectionGroups,
	};
}
