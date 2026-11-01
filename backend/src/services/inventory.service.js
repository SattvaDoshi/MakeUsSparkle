import Product from "../models/product.model.js";
import Combo from "../models/combo.model.js";
import Order from "../models/order.model.js";

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

function isValidObjectId(id) {
	return typeof id === "string" && OBJECT_ID_REGEX.test(id.trim());
}

function normalizeText(val) {
	return String(val || "").trim().toLowerCase();
}

/**
 * Extracts numeric charm numbers from various formats:
 * - ["1", "5", "8"]
 * - ["Charm 1", "Charm 5"]
 * - [{ sourceId: "1" }, { name: "Charm 5" }]
 */
function extractCharmNumbers(item = {}) {
	const numbers = new Set();

	const parseNum = (val) => {
		if (val === null || val === undefined) return;
		if (typeof val === "number" && Number.isFinite(val) && val > 0) {
			numbers.add(Math.trunc(val));
			return;
		}
		const str = String(val).trim();
		const match = str.match(/\d+/);
		if (match) {
			const num = parseInt(match[0], 10);
			if (!isNaN(num) && num > 0) {
				numbers.add(num);
			}
		}
	};

	if (Array.isArray(item.charms)) {
		item.charms.forEach(parseNum);
	}
	if (item.customData && Array.isArray(item.customData.charms)) {
		item.customData.charms.forEach(parseNum);
	}
	if (item.customData && Array.isArray(item.customData.selectedCharms)) {
		item.customData.selectedCharms.forEach(parseNum);
	}
	if (Array.isArray(item.selectedCharms)) {
		item.selectedCharms.forEach((c) => {
			if (c && typeof c === "object") {
				parseNum(c.sourceId || c.name || c.charmNumber || c.charm);
			} else {
				parseNum(c);
			}
		});
	}
	if (Array.isArray(item.selectionGroups)) {
		item.selectionGroups.forEach((group) => {
			if (Array.isArray(group.items)) {
				group.items.forEach((subItem) => {
					parseNum(subItem.sourceId || subItem.name || subItem.charmNumber);
					if (subItem.customData) {
						parseNum(subItem.customData.charmNumber || subItem.customData.charm);
					}
				});
			}
		});
	}

	return Array.from(numbers);
}

/**
 * Finds the variant inside product.variants that best matches the ordered item.
 */
function findMatchingVariant(variants = [], item = {}) {
	if (!Array.isArray(variants) || variants.length === 0) return null;

	const targetColor = normalizeText(item.color);
	const targetSize = normalizeText(item.size);
	const targetChain = normalizeText(item.chain || item.customData?.chain);

	// 1. Exact match on both color and size
	if (targetColor && targetSize) {
		const match = variants.find(
			(v) =>
				normalizeText(v.color) === targetColor &&
				normalizeText(v.size) === targetSize
		);
		if (match) return match;
	}

	// 2. Match on bandName or chain
	if (targetChain) {
		const match = variants.find(
			(v) =>
				normalizeText(v.bandName) === targetChain ||
				normalizeText(v.color) === targetChain
		);
		if (match) return match;
	}

	// 3. Match on color only
	if (targetColor) {
		const match = variants.find((v) => normalizeText(v.color) === targetColor);
		if (match) return match;
	}

	// 4. Match on size only
	if (targetSize) {
		const match = variants.find((v) => normalizeText(v.size) === targetSize);
		if (match) return match;
	}

	return null;
}

class InventoryService {
	/**
	 * Deducts stock across all ordered items:
	 * - Regular products: decrements product.stock and matching variant.stock
	 * - Multi-piece sets: decrements variant stocks for each piece
	 * - Charms products: decrements individual charm stocks in product.charmStocks
	 * - Combos: decrements combo.stock, sub-product stocks, and variant options
	 */
	async deductOrderInventory(orderOrId) {
		try {
			const orderId = typeof orderOrId === "object" && orderOrId?._id ? orderOrId._id : orderOrId;
			const order = await Order.findById(orderId);
			if (!order) {
				console.warn(`[InventoryService] Order ${orderId} not found for deduction`);
				return { success: false, message: "Order not found" };
			}

			// Idempotency: avoid double deduction
			if (order.inventoryDeducted) {
				return { success: true, message: "Inventory already deducted" };
			}

			const items = order.items || [];
			for (const item of items) {
				const qty = Math.max(1, Number(item.quantity) || 1);

				// ──────────────────────────────────────────
				// 1. COMBOS DEDUCTION
				// ──────────────────────────────────────────
				const isComboItem =
					(item.sku && String(item.sku).includes("COMBO")) ||
					item.category === "preset" ||
					item.category === "custom";

				let comboId = null;
				if (isValidObjectId(String(item.sourceId || ""))) {
					comboId = String(item.sourceId);
				} else if (isValidObjectId(String(item.product || ""))) {
					comboId = String(item.product);
				} else if (item.sku && item.sku.includes("COMBO")) {
					const parts = item.sku.split("-");
					const possibleId = parts[parts.length - 1];
					if (isValidObjectId(possibleId)) comboId = possibleId;
				}

				if (isComboItem && comboId) {
					try {
						const combo = await Combo.findById(comboId);
						if (combo) {
							// Deduct combo-level stock if tracked
							if (typeof combo.stock === "number" && !isNaN(combo.stock)) {
								combo.stock = Math.max(0, combo.stock - qty);
							}

							// Deduct included products within the combo
							const includedGroup = (item.selectionGroups || []).find(
								(g) => g.category === "preset" || g.category === "custom" || (Array.isArray(g.items) && g.items.length > 0)
							);

							if (includedGroup && Array.isArray(includedGroup.items)) {
								for (const subItem of includedGroup.items) {
									const subProdId = String(subItem.id || subItem.sourceId || subItem._id || "");
									const comboProd = (combo.products || []).find(
										(p) => String(p._id) === subProdId || normalizeText(p.title) === normalizeText(subItem.name)
									);

									if (comboProd) {
										const subQty = Math.max(1, Number(subItem.quantity) || 1) * qty;
										if (typeof comboProd.stock === "number" && !isNaN(comboProd.stock)) {
											comboProd.stock = Math.max(0, comboProd.stock - subQty);
										}

										// Deduct combo product variant selections (e.g. Color, Size options)
										const selections = subItem.customData?.selections;
										if (selections && typeof selections === "object" && Array.isArray(comboProd.variants)) {
											for (const [varName, selectedOpt] of Object.entries(selections)) {
												const varGroup = comboProd.variants.find(
													(v) => normalizeText(v.name) === normalizeText(varName)
												);
												if (varGroup && Array.isArray(varGroup.options)) {
													const opt = varGroup.options.find(
														(o) => normalizeText(o.name) === normalizeText(selectedOpt)
													);
													if (opt && typeof opt.stock === "number" && !isNaN(opt.stock)) {
														opt.stock = Math.max(0, opt.stock - subQty);
													}
												}
											}
										}
									}

									// If the sub-product is also an independent Product document, update it
									if (isValidObjectId(subProdId)) {
										try {
											const linkedProduct = await Product.findById(subProdId);
											if (linkedProduct && typeof linkedProduct.stock === "number" && !isNaN(linkedProduct.stock)) {
												linkedProduct.stock = Math.max(0, linkedProduct.stock - qty);
												await linkedProduct.save();
											}
										} catch (e) {
											console.warn(`[InventoryService] Error updating linked combo product ${subProdId}:`, e.message);
										}
									}
								}
							}

							combo.markModified("products");
							await combo.save();
						}
					} catch (comboErr) {
						console.error(`[InventoryService] Error updating combo stock for ${comboId}:`, comboErr);
					}
				}

				// ──────────────────────────────────────────
				// 2. PRODUCT DEDUCTION (Regular, Variants, Charms)
				// ──────────────────────────────────────────
				const rawProdId = String(item.product?._id || item.product || item.sourceId || "");
				if (isValidObjectId(rawProdId)) {
					try {
						const product = await Product.findById(rawProdId);
						if (product) {
							// A. Multi-piece selection variant deduction (e.g. Matching Jewellery Piece 1 & 2)
							const selectionsGroup = (item.selectionGroups || []).find((g) => g.type === "selections");
							if (selectionsGroup && Array.isArray(selectionsGroup.items) && selectionsGroup.items.length > 0) {
								for (const piece of selectionsGroup.items) {
									const pieceColor = piece.customData?.color;
									const pieceSize = piece.customData?.size;
									const matchingVar = findMatchingVariant(product.variants, { color: pieceColor, size: pieceSize });
									if (matchingVar && typeof matchingVar.stock === "number" && !isNaN(matchingVar.stock)) {
										matchingVar.stock = Math.max(0, matchingVar.stock - qty);
									}
								}
							} else {
								// B. Single product variant matching
								const matchingVar = findMatchingVariant(product.variants, item);
								if (matchingVar && typeof matchingVar.stock === "number" && !isNaN(matchingVar.stock)) {
									matchingVar.stock = Math.max(0, matchingVar.stock - qty);
								}
							}

							// C. Base product stock deduction
							if (typeof product.stock === "number" && !isNaN(product.stock)) {
								product.stock = Math.max(0, product.stock - qty);
							}

							// D. Individual Charm stocks deduction (product.charmStocks: [{ charmNumber, stock }])
							const selectedCharmNums = extractCharmNumbers(item);
							if (selectedCharmNums.length > 0 && Array.isArray(product.charmStocks) && product.charmStocks.length > 0) {
								for (const num of selectedCharmNums) {
									const charmStockEntry = product.charmStocks.find(
										(s) => Number(s.charmNumber) === Number(num)
									);
									if (charmStockEntry && typeof charmStockEntry.stock === "number" && !isNaN(charmStockEntry.stock)) {
										charmStockEntry.stock = Math.max(0, charmStockEntry.stock - qty);
									}
								}
								product.markModified("charmStocks");
							}

							product.markModified("variants");
							await product.save();
						}
					} catch (prodErr) {
						console.error(`[InventoryService] Error updating product stock for ${rawProdId}:`, prodErr);
					}
				}
			}

			// Mark order as inventory deducted
			order.inventoryDeducted = true;
			await order.save();

			return { success: true };
		} catch (error) {
			console.error("[InventoryService] deductOrderInventory error:", error);
			return { success: false, error: error.message };
		}
	}

	/**
	 * Restores stock if an order is cancelled or payment failed after deduction.
	 */
	async restoreOrderInventory(orderOrId) {
		try {
			const orderId = typeof orderOrId === "object" && orderOrId?._id ? orderOrId._id : orderOrId;
			const order = await Order.findById(orderId);
			if (!order) {
				return { success: false, message: "Order not found" };
			}

			// Only restore if inventory was previously deducted
			if (!order.inventoryDeducted) {
				return { success: true, message: "No inventory deduction to restore" };
			}

			const items = order.items || [];
			for (const item of items) {
				const qty = Math.max(1, Number(item.quantity) || 1);

				// 1. COMBOS RESTORATION
				let comboId = null;
				if (isValidObjectId(String(item.sourceId || ""))) {
					comboId = String(item.sourceId);
				} else if (isValidObjectId(String(item.product || ""))) {
					comboId = String(item.product);
				} else if (item.sku && item.sku.includes("COMBO")) {
					const parts = item.sku.split("-");
					const possibleId = parts[parts.length - 1];
					if (isValidObjectId(possibleId)) comboId = possibleId;
				}

				if (comboId) {
					try {
						const combo = await Combo.findById(comboId);
						if (combo) {
							if (typeof combo.stock === "number" && !isNaN(combo.stock)) {
								combo.stock += qty;
							}

							const includedGroup = (item.selectionGroups || []).find(
								(g) => g.category === "preset" || g.category === "custom" || (Array.isArray(g.items) && g.items.length > 0)
							);

							if (includedGroup && Array.isArray(includedGroup.items)) {
								for (const subItem of includedGroup.items) {
									const subProdId = String(subItem.id || subItem.sourceId || subItem._id || "");
									const comboProd = (combo.products || []).find(
										(p) => String(p._id) === subProdId || normalizeText(p.title) === normalizeText(subItem.name)
									);

									if (comboProd) {
										const subQty = Math.max(1, Number(subItem.quantity) || 1) * qty;
										if (typeof comboProd.stock === "number" && !isNaN(comboProd.stock)) {
											comboProd.stock += subQty;
										}

										const selections = subItem.customData?.selections;
										if (selections && typeof selections === "object" && Array.isArray(comboProd.variants)) {
											for (const [varName, selectedOpt] of Object.entries(selections)) {
												const varGroup = comboProd.variants.find(
													(v) => normalizeText(v.name) === normalizeText(varName)
												);
												if (varGroup && Array.isArray(varGroup.options)) {
													const opt = varGroup.options.find(
														(o) => normalizeText(o.name) === normalizeText(selectedOpt)
													);
													if (opt && typeof opt.stock === "number" && !isNaN(opt.stock)) {
														opt.stock += subQty;
													}
												}
											}
										}
									}

									if (isValidObjectId(subProdId)) {
										try {
											const linkedProduct = await Product.findById(subProdId);
											if (linkedProduct && typeof linkedProduct.stock === "number" && !isNaN(linkedProduct.stock)) {
												linkedProduct.stock += qty;
												await linkedProduct.save();
											}
										} catch (e) {
											console.warn(`[InventoryService] Error restoring combo product ${subProdId}:`, e.message);
										}
									}
								}
							}

							combo.markModified("products");
							await combo.save();
						}
					} catch (comboErr) {
						console.error(`[InventoryService] Error restoring combo stock for ${comboId}:`, comboErr);
					}
				}

				// 2. PRODUCT RESTORATION
				const rawProdId = String(item.product?._id || item.product || item.sourceId || "");
				if (isValidObjectId(rawProdId)) {
					try {
						const product = await Product.findById(rawProdId);
						if (product) {
							const selectionsGroup = (item.selectionGroups || []).find((g) => g.type === "selections");
							if (selectionsGroup && Array.isArray(selectionsGroup.items) && selectionsGroup.items.length > 0) {
								for (const piece of selectionsGroup.items) {
									const pieceColor = piece.customData?.color;
									const pieceSize = piece.customData?.size;
									const matchingVar = findMatchingVariant(product.variants, { color: pieceColor, size: pieceSize });
									if (matchingVar && typeof matchingVar.stock === "number" && !isNaN(matchingVar.stock)) {
										matchingVar.stock += qty;
									}
								}
							} else {
								const matchingVar = findMatchingVariant(product.variants, item);
								if (matchingVar && typeof matchingVar.stock === "number" && !isNaN(matchingVar.stock)) {
									matchingVar.stock += qty;
								}
							}

							if (typeof product.stock === "number" && !isNaN(product.stock)) {
								product.stock += qty;
							}

							const selectedCharmNums = extractCharmNumbers(item);
							if (selectedCharmNums.length > 0 && Array.isArray(product.charmStocks) && product.charmStocks.length > 0) {
								for (const num of selectedCharmNums) {
									const charmStockEntry = product.charmStocks.find(
										(s) => Number(s.charmNumber) === Number(num)
									);
									if (charmStockEntry && typeof charmStockEntry.stock === "number" && !isNaN(charmStockEntry.stock)) {
										charmStockEntry.stock += qty;
									}
								}
								product.markModified("charmStocks");
							}

							product.markModified("variants");
							await product.save();
						}
					} catch (prodErr) {
						console.error(`[InventoryService] Error restoring product stock for ${rawProdId}:`, prodErr);
					}
				}
			}

			order.inventoryDeducted = false;
			await order.save();

			return { success: true };
		} catch (error) {
			console.error("[InventoryService] restoreOrderInventory error:", error);
			return { success: false, error: error.message };
		}
	}
}

export default new InventoryService();

