/**
 * Server-side order pricing. The browser tells us WHAT is in the cart and which options were chosen;
 * this module decides what it COSTS. Nothing money-related from the request body is trusted:
 *
 *   - every line price is checked against the catalog (a price below the cheapest legitimate price is rejected),
 *   - offers, coupon, shipping, gift wrap, COD fee, express fee and reward points are recomputed here,
 *   - totals / advance / balance are produced here and are the only amounts ever stored or charged.
 *
 * Mirrors the cart maths in frontend/lib/cartContext.tsx and app/checkout/page.tsx — keep them in step.
 */
import Product from "../models/product.model.js";
import Combo from "../models/combo.model.js";
import CharmItem from "../models/charmItem.model.js";
import Offer from "../models/offer.model.js";
import User from "../models/user.model.js";
import couponService from "./coupon.service.js";

const HEX24 = /^[0-9a-fA-F]{24}$/;
const FREE_SHIPPING_THRESHOLD = 999;
const STANDARD_SHIPPING = 60;
const EXPRESS_DELIVERY = 110;
const COD_FEE = 80;
const PARTIAL_COD_RATE = 0.2;
const MAX_LINES = 60;
const MAX_QTY = 99;
const GIFT_OPTIONS = { classic: 25, luxury: 250 };
const PAYMENT_MODES = new Set(["ONLINE", "PARTIAL_COD", "COD"]);

export class PricingError extends Error {
	constructor(message, code = "INVALID_ORDER", extra = {}) {
		super(message);
		this.name = "PricingError";
		this.code = code;
		this.extra = extra;
	}
}

const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
const positive = (...vals) => vals.map(Number).filter((n) => Number.isFinite(n) && n > 0);
const hexIds = (...vals) => [...new Set(vals.map((v) => String(v ?? "").trim()).filter((v) => HEX24.test(v)))];

/* ───────────── catalog floors (cheapest legitimate unit price) ───────────── */

async function productFloor(product, item) {
	const colour = String(item.color || "").trim().toLowerCase();
	const size = String(item.size || "").trim().toLowerCase();

	// If the shopper's exact colour/size variant exists, hold them to that variant's price.
	const variants = Array.isArray(product.variants) ? product.variants : [];
	const exact = variants.find(
		(v) => (!colour || String(v.color || "").toLowerCase() === colour) && (!size || String(v.size || "").toLowerCase() === size)
	);
	const base = exact
		? positive(exact.salePrice, exact.price, product.discountedPrice, product.price)
		: positive(
				product.price,
				product.discountedPrice,
				...variants.flatMap((v) => positive(v.price, v.salePrice)),
		  );

	const extra = [
		...(product.quantityVariants || []).flatMap((q) => (q.price > 0 ? [q.price / Math.max(1, num(q.quantity, 1))] : [])),
		...(product.charmPiecePricing || []).flatMap((c) => positive(c.price)),
		...(product.perCharmPrice > 0 ? [product.perCharmPrice] : []),
	];

	let floor = Math.min(...base, ...(exact ? [] : extra));
	if (!Number.isFinite(floor)) floor = 0;

	// Volume discounts only ever lower the price, by at most the biggest tier.
	const maxDiscount = Math.max(0, ...(product.volumeDiscounts || []).map((d) => num(d.discountPercentage, 0)));
	floor = floor * (1 - Math.min(maxDiscount, 100) / 100);
	return Math.max(0, Math.floor(floor));
}

function comboFloor(combo) {
	const prices = positive(combo.price, ...(combo.pricingVariants || []).map((p) => p.price));
	return prices.length ? Math.floor(Math.min(...prices)) : 0;
}

/** Charms chosen by the shopper, with prices taken from the database. */
function collectCharmSelections(item) {
	const out = [];
	for (const g of Array.isArray(item.selectionGroups) ? item.selectionGroups : []) {
		if (g?.selectionKey && g.selectionKey !== "selectedCharms") continue;
		for (const it of Array.isArray(g?.items) ? g.items : []) {
			const id = hexIds(it?.item, it?.charm, it?.id, it?._id)[0];
			if (id) out.push({ id, qty: Math.max(1, Math.min(MAX_QTY, Math.trunc(num(it.quantity ?? it.qty, 1)))) });
		}
	}
	if (!out.length) {
		for (const c of Array.isArray(item.selectedCharms) ? item.selectedCharms : []) {
			const id = typeof c === "string" ? hexIds(c)[0] : hexIds(c?.id, c?._id)[0];
			if (id) out.push({ id, qty: 1 });
		}
	}
	return out;
}

/** Resolve one cart line to a catalog floor, or throw. */
async function lineFloor(item) {
	const ids = hexIds(item.product, item.sourceId, item.id);
	for (const id of ids) {
		const combo = await Combo.findById(id).select("price pricingVariants status").lean();
		if (combo) return { floor: comboFloor(combo), kind: "combo", paymentMode: "cod_allowed" };
		const product = await Product.findById(id).lean();
		if (product) {
			return { floor: await productFloor(product, item), kind: "product", paymentMode: product.paymentMode || "cod_allowed" };
		}
		const charm = await CharmItem.findById(id).select("price").lean();
		if (charm) return { floor: Math.floor(num(charm.price)), kind: "charm", paymentMode: "cod_allowed" };
	}

	// Builder lines (custom charm / keychain): worth at least the sum of the chosen charms.
	const picks = collectCharmSelections(item);
	if (picks.length) {
		const charms = await CharmItem.find({ _id: { $in: picks.map((p) => p.id) } }).select("price").lean();
		const byId = new Map(charms.map((c) => [String(c._id), c.price]));
		if (picks.every((p) => byId.has(p.id))) {
			const sum = picks.reduce((s, p) => s + num(byId.get(p.id)) * p.qty, 0);
			return { floor: Math.floor(sum), kind: "builder", paymentMode: "cod_allowed" };
		}
	}
	throw new PricingError(`"${String(item.name || "An item").slice(0, 60)}" is no longer available. Please remove it from your cart.`, "ITEM_UNAVAILABLE");
}

/* ───────────── store offers (port of cartContext) ───────────── */

function offerAppliesTo(poolItem, offer) {
	const hasProducts = Array.isArray(offer.applicableProducts) && offer.applicableProducts.length > 0;
	const hasCategories = Array.isArray(offer.applicableCategories) && offer.applicableCategories.length > 0;
	if (!hasProducts && !hasCategories) return true;
	const products = (offer.applicableProducts || []).map(String);
	const cats = (offer.applicableCategories || []).map(String);
	const inProducts = hasProducts && products.includes(String(poolItem.sourceId || poolItem.id));
	const inCats = hasCategories && ((poolItem.categoryId && cats.includes(String(poolItem.categoryId))) || (poolItem.subCategoryId && cats.includes(String(poolItem.subCategoryId))));
	if (hasProducts && hasCategories) return inProducts || inCats;
	return hasProducts ? inProducts : inCats;
}

async function computeOffers(lines, optedInIds) {
	const now = Date.now();
	const offers = await Offer.find({ isActive: true }).lean();
	const live = offers.filter((o) => {
		if (o.startsAt && new Date(o.startsAt).getTime() > now) return false;
		if (o.expiryDate && new Date(o.expiryDate).getTime() < now) return false;
		if (o.usageLimit > 0 && o.usedCount >= o.usageLimit) return false;
		return true;
	});

	let pool = [];
	for (const l of lines) for (let q = 0; q < l.qty; q++) pool.push({ id: l.id, sourceId: l.sourceId, categoryId: l.categoryId, subCategoryId: l.subCategoryId, price: l.price });

	let auto = 0;
	const applied = [];
	for (const offer of live) {
		if (offer.offerType === "free_shipping") continue;
		// The shopper can untick an offer in the cart; only offers they kept are applied.
		if (!optedInIds.has(String(offer._id))) continue;
		const idxs = [];
		pool.forEach((p, i) => { if (offerAppliesTo(p, offer)) idxs.push(i); });
		if (!idxs.length) continue;

		let discount = 0;
		const used = new Set();
		if (offer.offerType === "buy_x_for_y") {
			const X = offer.buyQuantity || 1;
			const Y = offer.discountValue || 0;
			const sorted = idxs.map((idx) => ({ idx, price: pool[idx].price })).sort((a, b) => b.price - a.price);
			for (let g = 0; g < Math.floor(sorted.length / X); g++) {
				const group = sorted.slice(g * X, (g + 1) * X);
				const sum = group.reduce((s, it) => s + it.price, 0);
				if (sum > Y) { discount += sum - Y; group.forEach((it) => used.add(it.idx)); }
			}
		} else if (offer.offerType === "bogo") {
			const X = offer.buyQuantity || 1;
			const Y = offer.getQuantity || 1;
			const size = X + Y;
			const sorted = idxs.map((idx) => ({ idx, price: pool[idx].price })).sort((a, b) => b.price - a.price);
			for (let i = 0; i + size <= sorted.length; i += size) {
				const group = sorted.slice(i, i + size);
				discount += group.slice(-Y).reduce((s, it) => s + it.price, 0);
				group.forEach((it) => used.add(it.idx));
			}
		} else if (offer.offerType === "percentage") {
			const v = offer.discountValue || 0;
			idxs.forEach((idx) => { discount += pool[idx].price * (v / 100); used.add(idx); });
		} else if (offer.offerType === "fixed") {
			discount = offer.discountValue || 0;
			idxs.forEach((idx) => used.add(idx));
		}

		if (discount > 0) {
			auto += discount;
			applied.push({ id: String(offer._id), title: offer.title, amount: Math.round(discount) });
			pool = pool.filter((_, idx) => !used.has(idx));
		}
	}

	const freeShipping = live.some(
		(o) =>
			o.offerType === "free_shipping" &&
			lines.some((l) => {
				const hasProducts = Array.isArray(o.applicableProducts) && o.applicableProducts.length > 0;
				if (hasProducts && !o.applicableProducts.map(String).includes(String(l.sourceId || l.id))) return false;
				const hasCats = Array.isArray(o.applicableCategories) && o.applicableCategories.length > 0;
				if (hasCats && !(l.categoryId && o.applicableCategories.map(String).includes(String(l.categoryId)))) return false;
				return true;
			})
	);
	return { autoDiscount: Math.round(auto), appliedOffers: applied, freeShipping, offerIds: applied.map((a) => a.id) };
}

/* ───────────── main entry ───────────── */

/**
 * @param {string} userId
 * @param {object} body   raw request body from the browser
 * @returns the authoritative price breakdown. Throws PricingError on anything that does not add up.
 */
export async function priceOrder(userId, body = {}) {
	const rawItems = Array.isArray(body.items) ? body.items : [];
	if (!rawItems.length) throw new PricingError("Your cart is empty.", "EMPTY_CART");
	if (rawItems.length > MAX_LINES) throw new PricingError("Too many items in one order.", "TOO_MANY_ITEMS");

	const paymentMode = String(body.paymentMode || "");
	if (!PAYMENT_MODES.has(paymentMode)) throw new PricingError("Invalid payment method.", "INVALID_PAYMENT_MODE");
	const deliveryType = body.deliveryType === "express" ? "express" : "standard";

	// 1. Lines: quantity sane, price never below what the catalog allows.
	const lines = [];
	let strictest = "cod_allowed";
	for (const raw of rawItems) {
		const qty = Math.trunc(num(raw.quantity ?? raw.qty, 0));
		const price = num(raw.price, NaN);
		if (!(qty >= 1 && qty <= MAX_QTY)) throw new PricingError("Invalid item quantity.", "INVALID_QTY");
		if (!Number.isFinite(price) || price < 0) throw new PricingError("Invalid item price.", "INVALID_PRICE");

		const { floor, paymentMode: pm } = await lineFloor(raw);
		if (price + 0.5 < floor) {
			throw new PricingError(
				`The price of "${String(raw.name || "an item").slice(0, 60)}" has changed. Please refresh your cart and try again.`,
				"PRICE_CHANGED"
			);
		}
		if (pm === "prepaid_only") strictest = "prepaid_only";
		else if (pm === "partial_cod" && strictest !== "prepaid_only") strictest = "partial_cod";

		lines.push({
			id: String(raw.id || raw.sourceId || ""),
			sourceId: raw.sourceId ? String(raw.sourceId) : undefined,
			categoryId: raw.categoryId,
			subCategoryId: raw.subCategoryId,
			price: Math.round(price * 100) / 100,
			qty,
		});
	}

	// Payment-method restrictions set on the products (prepaid-only / partial-COD-only).
	if (strictest === "prepaid_only" && paymentMode !== "ONLINE") throw new PricingError("This order must be paid online.", "PAYMENT_MODE_NOT_ALLOWED");
	if (strictest === "partial_cod" && paymentMode === "COD") throw new PricingError("This order needs an advance payment.", "PAYMENT_MODE_NOT_ALLOWED");

	const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);

	// 2. Store offers (the shopper's un-ticked offers are not applied).
	const optedIn = new Set((Array.isArray(body.appliedOffers) ? body.appliedOffers : []).map((o) => String(o?.id)));
	const { autoDiscount, appliedOffers, freeShipping } = await computeOffers(lines, optedIn);

	// 3. Coupon, validated and valued by the coupon service.
	let couponDiscount = 0;
	let discountCode = "";
	const code = typeof body.discountCode === "string" ? body.discountCode.trim() : "";
	if (code) {
		try {
			const user = await User.findById(userId).select("email").lean();
			const validation = await couponService.validateCoupon(
				code,
				{
					cartTotal: subtotal,
					items: rawItems.map((i) => ({ product: i.sourceId || i.id, qty: i.quantity ?? i.qty, name: i.name, sourceId: i.sourceId, category: i.category, style: i.style })),
					productIds: rawItems.map((i) => i.sourceId || i.id),
					categoryIds: rawItems.map((i) => i.category).filter(Boolean),
					styleIds: rawItems.map((i) => i.style).filter(Boolean),
				},
				{ userId, email: user?.email }
			);
			if (validation?.valid) {
				couponDiscount = couponService.calculateDiscount(validation.coupon, subtotal);
				discountCode = validation.coupon.code;
			}
		} catch {
			/* unknown / unusable coupon: no discount (the total check below tells the shopper) */
		}
	}

	// 4. Gift wrap, delivery, COD fee — all fixed by the store.
	const giftCharge = body.isGift && GIFT_OPTIONS[body.selectedGiftId] ? GIFT_OPTIONS[body.selectedGiftId] : 0;
	const cartShipping = freeShipping || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
	const deliveryCharge = deliveryType === "express" ? EXPRESS_DELIVERY : cartShipping;
	const codCharge = paymentMode === "COD" || paymentMode === "PARTIAL_COD" ? COD_FEE : 0;

	const afterDiscounts = Math.max(0, subtotal + cartShipping + giftCharge - couponDiscount - autoDiscount);
	const baseTotal = afterDiscounts - cartShipping + deliveryCharge + codCharge;

	// 5. Reward points: ₹1 per point, capped by what the user really has.
	let pointsRedeemed = 0;
	const requestedPoints = Math.max(0, Math.floor(num(body.rewardPointsRedeemed, 0)));
	if (requestedPoints > 0) {
		const user = await User.findById(userId).select("rewardPoints").lean();
		pointsRedeemed = Math.min(requestedPoints, Math.max(0, Math.floor(num(user?.rewardPoints, 0))), Math.floor(baseTotal));
	}

	const totalAmount = Math.max(0, Math.round(baseTotal - pointsRedeemed));
	let advanceAmount = totalAmount;
	if (paymentMode === "PARTIAL_COD") advanceAmount = Math.round(totalAmount * PARTIAL_COD_RATE);
	else if (paymentMode === "COD") advanceAmount = 0;
	const balanceAmount = Math.max(totalAmount - advanceAmount, 0);

	if (paymentMode !== "COD" && advanceAmount <= 0) throw new PricingError("Invalid payable amount.", "INVALID_AMOUNT");

	// 6. The shopper must be charged exactly what they were shown (±₹1 rounding).
	const shown = num(body.totalAmount, NaN);
	if (!Number.isFinite(shown) || Math.abs(shown - totalAmount) > 1) {
		throw new PricingError(
			"Some prices or discounts have changed since you opened this page. Please review your order total and try again.",
			"TOTAL_MISMATCH",
			{ serverTotal: totalAmount, discountApplied: Boolean(discountCode) }
		);
	}

	return {
		subtotal,
		paymentMode,
		deliveryType,
		discountCode,
		discountAmount: Math.round(couponDiscount),
		autoDiscountAmount: autoDiscount,
		appliedOffers,
		giftCharge,
		deliveryCharge,
		codCharge,
		rewardPointsRedeemed: pointsRedeemed,
		totalAmount,
		advanceAmount,
		balanceAmount,
	};
}
