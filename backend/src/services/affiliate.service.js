import crypto from "crypto";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import Combo from "../models/combo.model.js";
import Coupon from "../models/coupon.model.js";
import AffiliateCommission from "../models/affiliate.model.js";
import AffiliateLink from "../models/affiliateLink.model.js";

const COMMISSION_RATE = 0.1; // 10% commission

function getFrontendUrl() {
	if (process.env.NODE_ENV === "production" && (!process.env.FRONTEND_URL || process.env.FRONTEND_URL.includes("localhost"))) {
		return "https://makeyousparkle.in";
	}
	return process.env.FRONTEND_URL || "https://makeyousparkle.in";
}

/**
 * Generate a collision-resistant 8-char uppercase hex code.
 */
async function generateUniqueCode() {
	for (let i = 0; i < 5; i++) {
		const code = crypto.randomBytes(4).toString("hex").toUpperCase();
		const existing = await User.findOne({ referralCode: code });
		if (!existing) return code;
	}
	return crypto.randomBytes(8).toString("hex").toUpperCase();
}

class AffiliateService {
	/**
	 * Ensure the user has a referral code, generating one if missing.
	 * Returns the base affiliate link and code.
	 */
	async ensureAffiliateLink(userId) {
		const user = await User.findById(userId);
		if (!user) throw new Error("User not found");

		if (!user.referralCode) {
			user.referralCode = await generateUniqueCode();
			await user.save();
		}

		const frontendUrl = getFrontendUrl();
		const affiliateLink = `${frontendUrl}/signup?ref=${user.referralCode}`;
		return {
			success: true,
			affiliateCode: user.referralCode,
			affiliateLink,
		};
	}

	/**
	 * Record a referral during signup.
	 */
	async recordReferral(newUserId, refCode) {
		if (!refCode) return;
		const cleanCode = String(refCode).trim().toUpperCase();

		const affiliate = await User.findOne({ referralCode: cleanCode });
		if (!affiliate) return;
		if (affiliate._id.toString() === newUserId.toString()) return;

		const alreadyReferred = await User.findById(newUserId);
		if (alreadyReferred?.referredBy) return;

		await User.findByIdAndUpdate(newUserId, {
			referredBy: affiliate._id,
		});
	}

	/**
	 * Search and list products and combos (both curated and custom) for the affiliate to pick and generate links.
	 * Returns 10 products/combos by default, with search filtering support.
	 */
	async getProducts({ search = "", page = 1, limit = 10 } = {}) {
		const numLimit = Math.max(1, Math.min(Number(limit) || 10, 50));
		const numPage = Math.max(1, Number(page) || 1);
		const cleanSearch = search ? String(search).trim() : "";

		const productQuery = {};
		const comboQuery = { status: { $ne: "inactive" } };

		if (cleanSearch) {
			const reg = new RegExp(cleanSearch, "i");
			productQuery.$or = [
				{ title: reg },
				{ tags: reg },
				{ productLabel: reg },
			];
			comboQuery.$or = [
				{ name: reg },
				{ description: reg },
				{ tagline: reg },
				{ badge: reg },
				{ "products.title": reg },
			];
		}

		// Retrieve matching products and combos concurrently
		const [rawProducts, rawCombos, totalProdCount, totalComboCount] = await Promise.all([
			Product.find(productQuery)
				.select("_id title price discountedPrice mainImage images category subCategory stock productLabel allowCustomization createdAt")
				.populate("category", "name slug")
				.populate("subCategory", "name slug")
				.sort({ createdAt: -1 })
				.limit(numLimit * numPage)
				.lean(),
			Combo.find(comboQuery)
				.select("_id name type price originalPrice image images tagline badge products status createdAt pricingVariants")
				.sort({ displayOrder: 1, createdAt: -1 })
				.limit(numLimit * numPage)
				.lean(),
			Product.countDocuments(productQuery),
			Combo.countDocuments(comboQuery),
		]);

		const total = totalProdCount + totalComboCount;

		// Normalize products
		const normalizedProducts = rawProducts.map((p) => ({
			_id: p._id.toString(),
			title: p.title,
			price: p.price,
			discountedPrice: p.discountedPrice || null,
			mainImage: p.mainImage || (p.images && p.images[0]) || null,
			images: p.images || [],
			category: p.category || null,
			stock: p.stock ?? null,
			itemType: "product",
			createdAt: p.createdAt,
		}));

		// Normalize combos (both curated and custom)
		const normalizedCombos = rawCombos.map((c) => {
			const comboPrice = c.price || (c.pricingVariants && c.pricingVariants[0]?.price) || 0;
			const categoryLabel = c.type === "custom" ? "Custom Combo" : "Curated Combo";
			return {
				_id: c._id.toString(),
				title: c.name || (c.type === "custom" ? "Custom Combo" : "Curated Combo"),
				price: comboPrice,
				discountedPrice: c.originalPrice && c.originalPrice > comboPrice ? comboPrice : null,
				mainImage: c.image || (c.images && c.images[0]) || (c.products && c.products[0]?.image) || null,
				images: c.images || [],
				category: { name: categoryLabel, slug: c.type === "custom" ? "custom-combo" : "curated-combo" },
				stock: null,
				itemType: "combo",
				comboType: c.type, // "curated" | "custom"
				createdAt: c.createdAt,
			};
		});

		// Merge and paginate: if searching, interleave or combine; otherwise, show combos and products together
		let combined = [];
		if (cleanSearch) {
			combined = [...normalizedCombos, ...normalizedProducts];
		} else {
			// Mix combos first or together so both are immediately discoverable on default view
			combined = [...normalizedCombos, ...normalizedProducts];
		}

		const startIndex = (numPage - 1) * numLimit;
		const paginatedItems = combined.slice(startIndex, startIndex + numLimit);

		return {
			success: true,
			products: paginatedItems,
			pagination: {
				page: numPage,
				limit: numLimit,
				total,
				totalPages: Math.ceil(total / numLimit),
			},
		};
	}

	/**
	 * Generate or retrieve an affiliate link for a specific product or combo.
	 */
	async generateProductLink(userId, productId) {
		if (!productId) throw new Error("Product ID is required");

		const user = await User.findById(userId);
		if (!user) throw new Error("User not found");

		if (!user.referralCode) {
			user.referralCode = await generateUniqueCode();
			await user.save();
		}

		// Check if productId is a Product or a Combo
		let product = await Product.findById(productId)
			.select("_id title price discountedPrice mainImage images category")
			.populate("category", "name")
			.lean();

		let combo = null;
		if (!product) {
			combo = await Combo.findById(productId)
				.select("_id name type price originalPrice image images products pricingVariants")
				.lean();
		}

		if (!product && !combo) {
			throw new Error("Item not found");
		}

		const isCombo = Boolean(combo);
		const existingQuery = isCombo
			? { affiliate: userId, combo: productId }
			: { affiliate: userId, product: productId };

		let existingLink = await AffiliateLink.findOne(existingQuery)
			.populate("product", "title price discountedPrice mainImage images category")
			.populate("combo", "name type price originalPrice image images products pricingVariants");

		const formatLink = (linkDoc) => {
			let itemObj = null;
			if (linkDoc.product) {
				itemObj = {
					id: (linkDoc.product._id || linkDoc.product.id).toString(),
					title: linkDoc.product.title,
					price: linkDoc.product.price,
					discountedPrice: linkDoc.product.discountedPrice,
					mainImage: linkDoc.product.mainImage,
					itemType: "product",
				};
			} else if (linkDoc.combo) {
				const c = linkDoc.combo;
				const cPrice = c.price || (c.pricingVariants && c.pricingVariants[0]?.price) || 0;
				itemObj = {
					id: (c._id || c.id).toString(),
					title: c.name || (c.type === "custom" ? "Custom Combo" : "Curated Combo"),
					price: cPrice,
					discountedPrice: c.originalPrice && c.originalPrice > cPrice ? cPrice : null,
					mainImage: c.image || (c.images && c.images[0]) || (c.products && c.products[0]?.image) || null,
					itemType: "combo",
					comboType: c.type,
				};
			} else if (linkDoc.itemTitle) {
				itemObj = {
					id: (linkDoc.product || linkDoc.combo || linkDoc._id).toString(),
					title: linkDoc.itemTitle,
					price: linkDoc.itemPrice || 0,
					discountedPrice: null,
					mainImage: linkDoc.itemImage || null,
					itemType: linkDoc.itemType || "product",
				};
			}

			return {
				id: linkDoc._id.toString(),
				linkCode: linkDoc.linkCode,
				url: linkDoc.url,
				clicks: linkDoc.clicks || 0,
				ordersCount: linkDoc.ordersCount || 0,
				totalEarned: linkDoc.totalEarned || 0,
				createdAt: linkDoc.createdAt ? linkDoc.createdAt.toISOString() : "",
				product: itemObj,
			};
		};

		if (existingLink) {
			return {
				success: true,
				link: formatLink(existingLink),
				created: false,
			};
		}

		const linkCode = crypto.randomBytes(4).toString("hex").toLowerCase();
		const frontendUrl = getFrontendUrl();
		let targetUrl = "";

		let itemTitle = "";
		let itemImage = "";
		let itemPrice = 0;
		let itemCategory = "";

		if (isCombo) {
			const cPrice = combo.price || (combo.pricingVariants && combo.pricingVariants[0]?.price) || 0;
			itemTitle = combo.name || (combo.type === "custom" ? "Custom Combo" : "Curated Combo");
			itemImage = combo.image || (combo.images && combo.images[0]) || (combo.products && combo.products[0]?.image) || "";
			itemPrice = cPrice;
			itemCategory = combo.type === "custom" ? "Custom Combo" : "Curated Combo";

			if (combo.type === "custom") {
				targetUrl = `${frontendUrl}/categories/women/curated-combos?custom=${combo._id}&aff=${user.referralCode}&link=${linkCode}`;
			} else {
				targetUrl = `${frontendUrl}/categories/women/curated-combos?combo=${combo._id}&aff=${user.referralCode}&link=${linkCode}`;
			}
		} else {
			itemTitle = product.title;
			itemImage = product.mainImage || (product.images && product.images[0]) || "";
			itemPrice = product.price || 0;
			itemCategory = typeof product.category === "object" ? product.category?.name : (product.category || "");
			targetUrl = `${frontendUrl}/products/${productId}?aff=${user.referralCode}&link=${linkCode}`;
		}

		const newLink = await AffiliateLink.create({
			affiliate: userId,
			product: isCombo ? null : productId,
			combo: isCombo ? productId : null,
			itemType: isCombo ? "combo" : "product",
			itemTitle,
			itemImage,
			itemPrice,
			itemCategory,
			affiliateCode: user.referralCode,
			linkCode,
			url: targetUrl,
			clicks: 0,
			ordersCount: 0,
			totalEarned: 0,
		});

		const populated = await AffiliateLink.findById(newLink._id)
			.populate("product", "title price discountedPrice mainImage images category")
			.populate("combo", "name type price originalPrice image images products pricingVariants");

		return {
			success: true,
			link: formatLink(populated),
			created: true,
		};
	}

	/**
	 * Create or retrieve an affiliate coupon code for the logged in user.
	 */
	async createAffiliateCoupon(userId, customCode = "") {
		const user = await User.findById(userId);
		if (!user) throw new Error("User not found");

		if (!user.referralCode) {
			user.referralCode = await generateUniqueCode();
			await user.save();
		}

		const cleanCode = (customCode || `${user.referralCode}10`)
			.trim()
			.toUpperCase()
			.replace(/[^A-Z0-9]/g, "");

		if (cleanCode.length < 3 || cleanCode.length > 20) {
			throw new Error("Coupon code must be between 3 and 20 alphanumeric characters.");
		}

		const mapCoupon = (cp) => ({
			id: cp._id.toString(),
			code: cp.code,
			name: cp.name,
			discountValue: cp.discountValue,
			discountType: cp.discountType,
			usedCount: cp.usedCount || 0,
			isActive: cp.isActive !== false,
			createdAt: cp.createdAt ? cp.createdAt.toISOString() : "",
		});

		const existing = await Coupon.findOne({ code: cleanCode });
		if (existing) {
			if (String(existing.affiliateUser) === String(userId)) {
				return { success: true, coupon: mapCoupon(existing), created: false };
			}
			throw new Error("This coupon code is already taken. Please choose another code.");
		}

		const coupon = await Coupon.create({
			code: cleanCode,
			name: `Affiliate Coupon - ${user.name || user.email || user.referralCode}`,
			description: "10% off affiliate coupon",
			discountType: "percentage",
			discountValue: 10,
			minOrderValue: 0,
			usageLimit: 999999,
			isActive: true,
			isAffiliateCoupon: true,
			affiliateUser: userId,
			issuedForUserId: userId,
		});

		return {
			success: true,
			coupon: mapCoupon(coupon),
			created: true,
		};
	}

	/**
	 * Track click on an affiliate link.
	 * Fixed: Avoid double counting clicks between AffiliateLink and User.affiliateClicks.
	 */
	async trackClick({ affiliateCode, productId, linkCode } = {}) {
		try {
			// Case 1: Specific link clicked (by linkCode)
			if (linkCode) {
				const link = await AffiliateLink.findOneAndUpdate(
					{ linkCode },
					{ $inc: { clicks: 1 } },
					{ new: true }
				);
				return { success: true, clicks: link?.clicks || 1 };
			}

			// Case 2: Affiliate code with specific product or combo
			if (affiliateCode && productId) {
				const cleanCode = String(affiliateCode).trim().toUpperCase();
				const user = await User.findOne({ referralCode: cleanCode });
				if (user) {
					const link = await AffiliateLink.findOneAndUpdate(
						{
							affiliate: user._id,
							$or: [{ product: productId }, { combo: productId }],
						},
						{ $inc: { clicks: 1 } },
						{ new: true }
					);
					if (link) {
						return { success: true, clicks: link.clicks };
					}
				}
			}

			// Case 3: Generic invite link (/signup?ref=CODE) without specific link/product
			if (affiliateCode) {
				const cleanCode = String(affiliateCode).trim().toUpperCase();
				const user = await User.findOneAndUpdate(
					{ referralCode: cleanCode },
					{ $inc: { affiliateClicks: 1 } },
					{ new: true }
				);
				return { success: true, clicks: user?.affiliateClicks || 1 };
			}

			return { success: false, message: "Missing tracking parameters" };
		} catch (err) {
			console.error("[AffiliateService] trackClick error:", err.message);
			return { success: false, error: err.message };
		}
	}

	/**
	 * Called when an order is created (both COD and ONLINE).
	 * Connects the order with the affiliate and creates a PENDING commission record.
	 * Commission ONLY reflects as earned when order status is marked DELIVERED by admin!
	 */
	async onOrderCreated(order, orderData = {}) {
		try {
			if (!order || !order._id) return;

			let affiliateUserId = null;
			let affiliateLinkDoc = null;
			let affiliateProduct = null;
			let couponCodeUsed = order.discountCode || orderData.discountCode || null;

			// 1. Check if discount code used is an affiliate coupon
			if (couponCodeUsed) {
				const couponDoc = await Coupon.findOne({
					code: String(couponCodeUsed).trim().toUpperCase(),
				});
				if (couponDoc?.affiliateUser) {
					affiliateUserId = couponDoc.affiliateUser;
				}
			}

			// 2. Check if affiliate link code was passed
			const linkCode = orderData.affiliateLinkCode || orderData.linkCode;
			if (linkCode) {
				affiliateLinkDoc = await AffiliateLink.findOne({ linkCode });
				if (affiliateLinkDoc) {
					affiliateUserId = affiliateUserId || affiliateLinkDoc.affiliate;
					affiliateProduct = affiliateLinkDoc.product;
				}
			}

			// 3. Check if affiliate code / product ID was passed
			const affiliateCode = orderData.affiliateCode || orderData.ref;
			if (!affiliateUserId && affiliateCode) {
				const affUser = await User.findOne({
					referralCode: String(affiliateCode).trim().toUpperCase(),
				});
				if (affUser) {
					affiliateUserId = affUser._id;
				}
			}

			if (affiliateUserId && !affiliateLinkDoc && orderData.affiliateProductId) {
				affiliateLinkDoc = await AffiliateLink.findOne({
					affiliate: affiliateUserId,
					product: orderData.affiliateProductId,
				});
				if (affiliateLinkDoc) {
					affiliateProduct = affiliateLinkDoc.product;
				}
			}

			// 4. Fallback to buyer's referredBy
			if (!affiliateUserId && order.user) {
				const buyer = await User.findById(order.user).select("referredBy");
				if (buyer?.referredBy) {
					affiliateUserId = buyer.referredBy;
				}
			}

			if (!affiliateUserId) return;

			// Prevent self-referral
			if (order.user && affiliateUserId.toString() === order.user.toString()) return;

			// Check if commission already exists for this order
			const existingCommission = await AffiliateCommission.findOne({ order: order._id });
			if (existingCommission) return;

			// 10% commission on the total order amount
			const orderAmount = Number(order.totalAmount || orderData.totalAmount || 0);
			const commission = Math.round(orderAmount * COMMISSION_RATE);

			// Persist affiliate details onto the order document
			await order.constructor.findByIdAndUpdate(order._id, {
				affiliateUser: affiliateUserId,
				affiliateCode: affiliateCode || null,
				affiliateLink: affiliateLinkDoc?._id || null,
				affiliateProduct: affiliateProduct || null,
			});

			// Create the commission record in "pending" status.
			// It will ONLY reflect in dashboard earnings once marked DELIVERED by admin!
			await AffiliateCommission.create({
				affiliate: affiliateUserId,
				referredUser: order.user || null,
				order: order._id,
				product: affiliateProduct || null,
				affiliateLink: affiliateLinkDoc?._id || null,
				couponCode: couponCodeUsed || null,
				orderAmount,
				commission,
				status: "pending",
			});
		} catch (err) {
			console.error("[AffiliateService] onOrderCreated error:", err.message);
		}
	}

	/**
	 * Called when admin updates order status to "delivered" (or "completed").
	 * Commission transitions from "pending" to "delivered" and is officially credited!
	 */
	async onOrderDelivered(orderIdOrDoc) {
		try {
			const orderId = orderIdOrDoc?._id || orderIdOrDoc;
			if (!orderId) return;

			const commission = await AffiliateCommission.findOne({ order: orderId });
			if (!commission) return;

			if (commission.status === "pending") {
				commission.status = "delivered";
				await commission.save();

				if (commission.affiliateLink) {
					await AffiliateLink.findByIdAndUpdate(commission.affiliateLink, {
						$inc: {
							ordersCount: 1,
							totalEarned: commission.commission,
						},
					});
				}
			}
		} catch (err) {
			console.error("[AffiliateService] onOrderDelivered error:", err.message);
		}
	}

	/**
	 * Called when an order is cancelled or RTO.
	 */
	async onOrderCancelled(orderIdOrDoc) {
		try {
			const orderId = orderIdOrDoc?._id || orderIdOrDoc;
			if (!orderId) return;

			const commission = await AffiliateCommission.findOne({ order: orderId });
			if (!commission) return;

			if (commission.status === "delivered" && commission.affiliateLink) {
				await AffiliateLink.findByIdAndUpdate(commission.affiliateLink, {
					$inc: {
						ordersCount: -1,
						totalEarned: -commission.commission,
					},
				});
			}

			commission.status = "cancelled";
			await commission.save();
		} catch (err) {
			console.error("[AffiliateService] onOrderCancelled error:", err.message);
		}
	}

	/**
	 * Fetch comprehensive affiliate dashboard data for the given user.
	 *
	 * Earnings reflect:
	 * - totalEarned: Only DELIVERED orders (status === "delivered" | "approved" | "paid")
	 * - pendingEarned: Orders placed and awaiting delivery (status === "pending")
	 * - totalClicks: Real clicks across all user's generated product links
	 */
	async getDashboard(affiliateId) {
		const user = await User.findById(affiliateId).select("referralCode affiliateClicks name email");
		if (!user) throw new Error("User not found");

		if (!user.referralCode) {
			user.referralCode = await generateUniqueCode();
			await user.save();
		}

		const [commissions, affiliateLinks, coupons, totalRegisteredReferrals] = await Promise.all([
			AffiliateCommission.find({ affiliate: affiliateId })
				.sort({ createdAt: -1 })
				.populate("referredUser", "name email")
				.populate("order", "totalAmount status createdAt paymentMode")
				.populate("product", "title mainImage price")
				.lean(),
			AffiliateLink.find({ affiliate: affiliateId })
				.sort({ createdAt: -1 })
				.populate("product", "title mainImage price category")
				.populate("combo", "name type price originalPrice image images products pricingVariants")
				.lean(),
			Coupon.find({ affiliateUser: affiliateId })
				.sort({ createdAt: -1 })
				.lean(),
			User.countDocuments({ referredBy: affiliateId }),
		]);

		const rows = commissions.map((c) => {
			const isDelivered = c.status === "delivered" || c.status === "approved" || c.status === "paid";
			const isCancelled = c.status === "cancelled";
			return {
				id: c._id.toString(),
				orderId: c.order?._id ? String(c.order._id) : "N/A",
				referredName:
					c.referredUser?.name ||
					c.referredUser?.email ||
					"Customer",
				productTitle: c.product?.title || null,
				couponCode: c.couponCode || null,
				orderAmount: c.orderAmount || c.order?.totalAmount || 0,
				date: c.createdAt ? c.createdAt.toISOString() : new Date().toISOString(),
				earning: c.commission,
				status: c.status,
				isDelivered,
				isCancelled,
				orderStatus: c.order?.status || (isDelivered ? "delivered" : "placed"),
			};
		});

		// Total Delivered Earnings (10% of delivered orders)
		const deliveredCommissions = rows.filter((r) => r.isDelivered);
		const pendingCommissions = rows.filter((r) => r.status === "pending");

		const totalEarned = deliveredCommissions.reduce((sum, r) => sum + r.earning, 0);
		const pendingEarned = pendingCommissions.reduce((sum, r) => sum + r.earning, 0);
		const totalOrderValue = rows
			.filter((r) => !r.isCancelled)
			.reduce((sum, r) => sum + r.orderAmount, 0);

		// Total clicks from all product links + user direct clicks
		const linkClicks = affiliateLinks.reduce((sum, l) => sum + (l.clicks || 0), 0);
		const totalClicks = linkClicks + (user.affiliateClicks || 0);

		const frontendUrl = getFrontendUrl();
		const generalAffiliateLink = `${frontendUrl}/signup?ref=${user.referralCode}`;

		return {
			success: true,
			affiliateCode: user.referralCode,
			affiliateLink: generalAffiliateLink,
			stats: {
				totalEarned,          // Delivered & approved (reflected)
				pendingEarned,        // In transit / awaiting delivery
				totalOrderValue,
				totalClicks,          // Number of clicks tracked
				totalOrders: rows.filter((r) => !r.isCancelled).length,
				deliveredOrders: deliveredCommissions.length,
				pendingOrders: pendingCommissions.length,
				totalReferrals: totalRegisteredReferrals,
			},
			commissions: rows,
			affiliateLinks: affiliateLinks.map((link) => {
				let prodData = null;
				if (link.product) {
					prodData = {
						id: link.product._id.toString(),
						title: link.product.title,
						price: link.product.price,
						discountedPrice: link.product.discountedPrice,
						mainImage: link.product.mainImage,
						itemType: "product",
					};
				} else if (link.combo) {
					const c = link.combo;
					const cPrice = c.price || (c.pricingVariants && c.pricingVariants[0]?.price) || 0;
					prodData = {
						id: c._id.toString(),
						title: c.name || (c.type === "custom" ? "Custom Combo" : "Curated Combo"),
						price: cPrice,
						discountedPrice: c.originalPrice && c.originalPrice > cPrice ? cPrice : null,
						mainImage: c.image || (c.images && c.images[0]) || (c.products && c.products[0]?.image) || null,
						itemType: "combo",
						comboType: c.type,
					};
				} else if (link.itemTitle) {
					prodData = {
						id: (link.product || link.combo || link._id).toString(),
						title: link.itemTitle,
						price: link.itemPrice || 0,
						discountedPrice: null,
						mainImage: link.itemImage || null,
						itemType: link.itemType || "product",
					};
				}

				return {
					id: link._id.toString(),
					linkCode: link.linkCode,
					url: link.url,
					clicks: link.clicks || 0,
					ordersCount: link.ordersCount || 0,
					totalEarned: link.totalEarned || 0,
					createdAt: link.createdAt ? link.createdAt.toISOString() : "",
					product: prodData,
				};
			}),
			coupons: coupons.map((cp) => ({
				id: cp._id.toString(),
				code: cp.code,
				name: cp.name,
				discountValue: cp.discountValue,
				discountType: cp.discountType,
				usedCount: cp.usedCount || 0,
				isActive: cp.isActive !== false,
				createdAt: cp.createdAt ? cp.createdAt.toISOString() : "",
			})),
		};
	}
}

export default new AffiliateService();
export { generateUniqueCode };
