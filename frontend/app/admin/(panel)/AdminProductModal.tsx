"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/api";

type GenderValue = "men" | "women" | "kids" | "unisex";
type GenderRef = { _id?: string; name?: string; slug?: string } | string;
type TaxonomyItem = {
	_id: string;
	name?: string;
	title?: string;
	slug?: string;
	gender?: GenderRef;
	category?: { _id: string; gender?: GenderRef } | string;
};

type Color = { name: string; hex: string; existingImage?: string; existingImagePublicId?: string; imageFile?: File | null };
type Variant = {
	variantIndex: number;
	color: string;
	size: string;
	price?: number | string;
	salePrice?: number | string;
	stock: number;
	existingImage?: string;
	existingImagePublicId?: string;
	imageFile?: File;
};

type AdminProductModalProps = {
	mode: "create" | "edit";
	initialData?: any;
	onClose: () => void;
	onSuccess: (message: string) => void;
};

const VALID_GENDERS: GenderValue[] = ["women", "men", "kids", "unisex"];
const FALLBACK_GENDERS: TaxonomyItem[] = [
	{ _id: "women", name: "Women", slug: "women" },
	{ _id: "men", name: "Men", slug: "men" },
	{ _id: "kids", name: "Kids", slug: "kids" },
	{ _id: "unisex", name: "Unisex", slug: "unisex" },
];

const slugify = (value = "") =>
	value
		.toLowerCase()
		.trim()
		.replace(/&/g, " and ")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "");

const getGenderSlug = (gender: GenderRef | undefined): GenderValue | "" => {
	const raw = typeof gender === "string" ? gender : gender?.slug || gender?.name || "";
	const slug = slugify(raw);
	return VALID_GENDERS.includes(slug as GenderValue) ? (slug as GenderValue) : "";
};

const getGenderLabel = (gender: TaxonomyItem) => gender.name || gender.title || gender.slug || gender._id;

const getTaxonomyGender = (item: TaxonomyItem): GenderRef | undefined => item.gender;

const matchesGender = (itemGender: GenderRef | undefined, selected: TaxonomyItem | undefined, selectedSlug: string) => {
	if (!selectedSlug) return false;
	if (!itemGender) return selectedSlug === "unisex";
	const rawId = typeof itemGender === "string" ? itemGender : itemGender?._id || "";
	const rawSlug = getGenderSlug(itemGender);
	
	if (selectedSlug === "unisex") {
		return rawSlug === "unisex" || rawSlug === "men" || rawSlug === "women" || rawId === selected?._id || rawId === selected?.slug;
	}
	
	return rawSlug === selectedSlug || rawId === selected?._id || rawId === selected?.slug;
};

const toPlainText = (value = "") =>
	value
		.replace(/<br\s*\/?>/gi, "\n")
		.replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
		.replace(/<[^>]*>/g, "")
		.replace(/&nbsp;/gi, " ")
		.replace(/&amp;/gi, "&")
		.replace(/&lt;/gi, "<")
		.replace(/&gt;/gi, ">")
		.replace(/\r\n/g, "\n")
		.replace(/\n{3,}/g, "\n\n");

export default function AdminProductModal({ mode, initialData, onClose, onSuccess }: AdminProductModalProps) {
	const [step, setStep] = useState(1);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const productId = initialData?._id || initialData?.id || "";

	const [categories, setCategories] = useState<TaxonomyItem[]>([]);
	const [subCategories, setSubCategories] = useState<TaxonomyItem[]>([]);
	const [styles, setStyles] = useState<TaxonomyItem[]>([]);
	const [genders, setGenders] = useState<TaxonomyItem[]>([]);
	const [allTags, setAllTags] = useState<string[]>([]);
	const [newTagInput, setNewTagInput] = useState("");
	const [newSeoTagInput, setNewSeoTagInput] = useState("");

	// Main form state
	const [form, setForm] = useState({
		title: initialData?.title || "",
		category: initialData?.category?._id || initialData?.category || "",
		subCategory: initialData?.subCategory?._id || initialData?.subCategory || "",
		styles: initialData?.styles?.map((s: any) => s._id || s) || (initialData?.style ? [initialData?.style?._id || initialData?.style] : []),
		gender: getGenderSlug(initialData?.gender),
		price: initialData?.price?.toString() || "",
		costPrice: initialData?.costPrice?.toString() || "",
		discountedPrice: initialData?.discountedPrice?.toString() || "",
		discountTag: initialData?.discountTag || "",
		productLabel: initialData?.productLabel || "",
		displayOrder: initialData?.displayOrder?.toString() || "0",
		allowCustomization: Boolean(initialData?.allowCustomization),
		maxCustomImages: initialData?.maxCustomImages?.toString() || "1",
		customImageLabels: initialData?.customImageLabels?.join(", ") || "",
		maxQuantity: initialData?.maxQuantity?.toString() || "10",
		numberOfProducts: initialData?.numberOfProducts?.toString() || "1",
		stock: initialData?.stock?.toString() || "",
		description: initialData?.description || "",
		about: toPlainText(initialData?.about || ""),
		tags: initialData?.tags || [],
		seoTags: initialData?.seoTags || [],
		mainImage: initialData?.mainImage || null,
		galleryImages: initialData?.images || [],
		totalCharms: initialData?.totalCharms?.toString() || "0",
		perCharmPrice: initialData?.perCharmPrice?.toString() || "0",
		sizeChartImage: initialData?.sizeChartImage || null,
		sizeChartSteps: initialData?.sizeChartSteps || "",
		giftBoxEnabled: initialData?.giftBox?.enabled ?? true,
		giftBoxHeading: initialData?.giftBox?.heading || "Premium Gift Box",
		giftBoxDescription: initialData?.giftBox?.description || "Rigid magnetic-close box · satin ribbon · message card",
		giftBoxPrice: initialData?.giftBox?.price?.toString() || "99",
		giftBoxImage: initialData?.giftBox?.image || null,
		partialCODEnabled: initialData?.partialCOD?.enabled ?? false,
		partialCODPercentage: initialData?.partialCOD?.percentage?.toString() || "0",
	});

	// Charm piece-count options (e.g. [3, 5, 7])
	const [charmPieceOptions, setCharmPieceOptions] = useState<number[]>(
		Array.isArray(initialData?.charmPieceOptions) ? initialData.charmPieceOptions : []
	);
	const [newPieceInput, setNewPieceInput] = useState("");

	// Volume discounts
	const [volumeDiscounts, setVolumeDiscounts] = useState<{ quantity: number; discountPercentage: number }[]>(
		Array.isArray(initialData?.volumeDiscounts) ? initialData.volumeDiscounts : []
	);

	// Quantity Variants
	const [quantityVariants, setQuantityVariants] = useState<{ label: string; quantity: number; price: number }[]>(
		Array.isArray(initialData?.quantityVariants) ? initialData.quantityVariants : []
	);

	// Colors management
	const [colors, setColors] = useState<Color[]>(initialData?.colors || []);
	const [newColor, setNewColor] = useState<Color>({ name: "", hex: "#000000", imageFile: null });

	// Sizes management
	const [sizes, setSizes] = useState<string[]>(initialData?.sizes || []);
	const [newSize, setNewSize] = useState("");

	// Variants management
	const [variants, setVariants] = useState<Variant[]>(() => {
		if (initialData?.variants && Array.isArray(initialData.variants)) {
			return initialData.variants.map((v: any, idx: number) => ({
				variantIndex: idx,
				color: v.color || "",
				size: v.size || "",
				price: v.price || "",
				salePrice: v.salePrice || "",
				stock: v.stock || 0,
				existingImage: v.image,
				existingImagePublicId: v.imagePublicId,
			}));
		}
		return [];
	});
	const [variantImageFile, setVariantImageFile] = useState<Record<number, File>>({});

	// Image file states
	const [mainImageFile, setMainImageFile] = useState<File | null>(null);
	const [galleryImageFiles, setGalleryImageFiles] = useState<File[]>([]);
	const [sizeChartImageFile, setSizeChartImageFile] = useState<File | null>(null);
	const [giftBoxImageFile, setGiftBoxImageFile] = useState<File | null>(null);

	// Fetch taxonomy data
	useEffect(() => {
		const fetchTaxonomy = async () => {
			try {
				const [cats, subs, stys, tRes, gendersResp] = await Promise.all([
					apiRequest<{ success: boolean; categories: TaxonomyItem[] }>("/categories"),
					apiRequest<{ success: boolean; subcategories: TaxonomyItem[] }>("/subcategories"),
					apiRequest<{ success: boolean; styles: TaxonomyItem[] }>("/styles"),
					apiRequest<{ success: boolean; tags: string[] }>("/products/tags"),
					apiRequest<{ success: boolean; genders: TaxonomyItem[] }>("/genders"),
				]);
				setCategories(cats.categories || []);
				setSubCategories(subs.subcategories || []);
				setStyles(stys.styles || []);
				setAllTags(tRes.tags || []);
				setGenders(gendersResp.genders || []);
			} catch (err) {
				console.error("Failed to load taxonomy", err);
			}
		};
		void fetchTaxonomy();
	}, []);

	const genderOptions = useMemo(() => {
		const bySlug = new Map<string, TaxonomyItem>();
		[...genders, ...FALLBACK_GENDERS].forEach((gender) => {
			const slug = getGenderSlug(gender);
			if (slug && !bySlug.has(slug)) {
				bySlug.set(slug, { ...gender, slug });
			}
		});
		return Array.from(bySlug.values());
	}, [genders]);

	const selectedGender = genderOptions.find((gender) => getGenderSlug(gender) === form.gender);

	// Detect if selected category is a charm/keychain selectable-item category
	const CHARM_KEYCHAIN_CATEGORY_NAMES = useMemo(() => new Set([
		"custom charms", "custom charm", "keychains", "keychain", "key chain",
	]), []);

	const isCharmOrKeychain = useMemo(() => {
		if (!form.category) return false;
		const selectedCat = categories.find(c => c._id === form.category);
		if (!selectedCat) return false;
		const nameSlug = (selectedCat.name || selectedCat.title || "").toLowerCase().trim();
		return CHARM_KEYCHAIN_CATEGORY_NAMES.has(nameSlug);
	}, [form.category, categories, CHARM_KEYCHAIN_CATEGORY_NAMES]);

	const addPieceOption = () => {
		const n = parseInt(newPieceInput, 10);
		if (!Number.isFinite(n) || n <= 0 || charmPieceOptions.includes(n)) return;
		setCharmPieceOptions(prev => [...prev, n].sort((a, b) => a - b));
		setNewPieceInput("");
	};

	const removePieceOption = (value: number) => {
		setCharmPieceOptions(prev => prev.filter(v => v !== value));
	};

	const filteredCategories = categories.filter((category) =>
		matchesGender(getTaxonomyGender(category), selectedGender, form.gender)
	);

	const filteredStyles = styles.filter((style) =>
		matchesGender(getTaxonomyGender(style), selectedGender, form.gender)
	);

	const filteredSubCategories = subCategories.filter((sc) => {
		if (!form.category) return true;
		const catId = typeof sc.category === "object" ? sc.category?._id : sc.category;
		return catId === form.category;
	});

	// Color management
	const addColor = () => {
		if (!newColor.name.trim()) return;
		setColors((prev) => [...prev, { name: newColor.name, hex: newColor.hex, imageFile: newColor.imageFile }]);
		setNewColor({ name: "", hex: "#000000", imageFile: null });
	};

	const removeColor = (index: number) => {
		setColors((prev) => prev.filter((_, i) => i !== index));
	};

	// Size management
	const addSize = () => {
		if (!newSize.trim() || sizes.includes(newSize.trim())) return;
		setSizes((prev) => [...prev, newSize.trim()]);
		setNewSize("");
	};

	const removeSize = (index: number) => {
		setSizes((prev) => prev.filter((_, i) => i !== index));
	};

	// Variant management
	const addVariant = () => {
		const newIndex = Math.max(...variants.map((v) => v.variantIndex), -1) + 1;
		setVariants((prev) => [
			...prev,
			{ variantIndex: newIndex, color: "", size: "", price: "", salePrice: "", stock: 0 },
		]);
	};

	const updateVariant = (index: number, field: string, value: any) => {
		setVariants((prev) =>
			prev.map((v, i) =>
				i === index ? { ...v, [field]: value } : v
			)
		);
	};

	const removeVariant = (index: number) => {
		setVariants((prev) => prev.filter((_, i) => i !== index));
		const variant = variants[index];
		if (variantImageFile[variant.variantIndex]) {
			const newFiles = { ...variantImageFile };
			delete newFiles[variant.variantIndex];
			setVariantImageFile(newFiles);
		}
	};

	// Tag management
	const addTag = (tag: string) => {
		const trimmed = tag.trim();
		if (!trimmed || form.tags.includes(trimmed)) return;
		setForm((prev) => ({ ...prev, tags: [...prev.tags, trimmed] }));
		if (!allTags.includes(trimmed)) setAllTags((prev) => [...prev, trimmed]);
		setNewTagInput("");
	};

	const removeTag = (tag: string) => {
		setForm((prev) => ({ ...prev, tags: prev.tags.filter((t: string) => t !== tag) }));
	};

	const addSeoTag = (tag: string) => {
		const trimmed = tag.trim();
		if (!trimmed || form.seoTags.includes(trimmed)) return;
		setForm((prev) => ({ ...prev, seoTags: [...prev.seoTags, trimmed] }));
		setNewSeoTagInput("");
	};

	const removeSeoTag = (tag: string) => {
		setForm((prev) => ({ ...prev, seoTags: prev.seoTags.filter((t: string) => t !== tag) }));
	};

	// Form submission
	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setError(null);
		setLoading(true);

		try {
			const formData = new FormData();
			formData.append("title", form.title);
			formData.append("description", toPlainText(form.description));
			formData.append("about", toPlainText(form.about));
			formData.append("price", String(form.price));
			if (form.costPrice) formData.append("costPrice", String(form.costPrice));
			if (form.discountedPrice) formData.append("discountedPrice", String(form.discountedPrice));
			if (form.discountTag) formData.append("discountTag", form.discountTag);
			if (form.productLabel) formData.append("productLabel", form.productLabel);
			formData.append("displayOrder", String(form.displayOrder || 0));
			formData.append("allowCustomization", String(form.allowCustomization));
			if (form.allowCustomization) {
				formData.append("maxCustomImages", String(form.maxCustomImages));
				if (form.customImageLabels.trim()) {
					form.customImageLabels.split(",").map(l => l.trim()).filter(Boolean).forEach(label => formData.append("customImageLabels", label));
				}
			}
			formData.append("maxQuantity", String(form.maxQuantity));
			formData.append("volumeDiscounts", JSON.stringify(volumeDiscounts));
			formData.append("quantityVariants", JSON.stringify(quantityVariants));
			formData.append("numberOfProducts", String(form.numberOfProducts));
			formData.append("charmPieceOptions", JSON.stringify(charmPieceOptions));
			formData.append("totalCharms", String(form.totalCharms || "0"));
			formData.append("perCharmPrice", String(form.perCharmPrice || "0"));
			formData.append("stock", String(form.stock));
			formData.append("sizeChartSteps", form.sizeChartSteps);
			if (form.gender) formData.append("gender", form.gender);

			if (form.category) formData.append("category", form.category);
			if (form.subCategory) formData.append("subCategory", form.subCategory);
			if (form.styles.length > 0) formData.append("styles", JSON.stringify(form.styles));

			form.tags.forEach((t: string) => formData.append("tags", t));
			form.seoTags.forEach((t: string) => formData.append("seoTags", t));

			// Colors & Sizes
			if (colors.length > 0) {
				const processedColors = colors.map((c) => ({
					name: c.name,
					hex: c.hex,
					existingImage: c.existingImage,
					existingImagePublicId: c.existingImagePublicId,
				}));
				formData.append("colors", JSON.stringify(processedColors));
				colors.forEach((c, idx) => {
					if (c.imageFile) {
						formData.append(`colorImage_${idx}`, c.imageFile);
					}
				});
			}
			if (sizes.length > 0) formData.append("sizes", JSON.stringify(sizes));

			// Variants
			const processedVariants = variants.map((v) => ({
				color: v.color,
				size: v.size,
				price: v.price,
				salePrice: v.salePrice,
				stock: v.stock,
				existingImage: v.existingImage,
				existingImagePublicId: v.existingImagePublicId,
				variantIndex: v.variantIndex,
			}));
			if (processedVariants.length > 0) {
				formData.append("variants", JSON.stringify(processedVariants));
			}

			// Images
			if (mainImageFile) {
				formData.append("mainImage", mainImageFile);
			} else if (form.mainImage === null && mode === "edit") {
				// Explicitly cleared
				formData.append("mainImage", "");
			}
			form.galleryImages.forEach((img: string) => formData.append("existingImages", img));
			galleryImageFiles.forEach((file) => formData.append("images", file));

			if (sizeChartImageFile) {
				formData.append("sizeChartImage", sizeChartImageFile);
			} else if (form.sizeChartImage === null && mode === "edit") {
				formData.append("sizeChartImage", "");
			}

			// Variant images
			Object.entries(variantImageFile).forEach(([varIndex, file]) => {
				formData.append(`variantImage_${varIndex}`, file);
			});

			// Gift Box
			formData.append("giftBoxEnabled", String(form.giftBoxEnabled));
			formData.append("giftBoxHeading", form.giftBoxHeading);
			formData.append("giftBoxDescription", form.giftBoxDescription);
			formData.append("giftBoxPrice", form.giftBoxPrice);
			
			// Partial COD
			formData.append("partialCODEnabled", String(form.partialCODEnabled));
			formData.append("partialCODPercentage", form.partialCODPercentage);
			
			if (giftBoxImageFile) {
				formData.append("giftBoxImage", giftBoxImageFile);
			} else if (form.giftBoxImage === null && mode === "edit") {
				formData.append("giftBoxImage", "");
			}

			if (mode === "edit" && productId) {
				await apiRequest(`/admin/products/${productId}`, {
					method: "PUT",
					body: formData,
				});
				onSuccess("Product updated successfully");
			} else {
				await apiRequest("/admin/products", {
					method: "POST",
					body: formData,
				});
				onSuccess("Product created successfully");
			}
			onClose();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Request failed");
		} finally {
			setLoading(false);
		}
	};

	const steps = ["Basic Info", "Pricing", "Colors & Sizes", "Variants", "Media & Gift Box"];

	return (
		<div
			className="admin-modal-backdrop"
			onClick={onClose}
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				padding: "2rem 1rem",
				background: "rgba(26, 31, 15, 0.6)",
				backdropFilter: "blur(4px)",
			}}
		>
			<div
				className="admin-modal"
				style={{
					maxWidth: "800px",
					width: "100%",
					maxHeight: "90vh",
					display: "flex",
					flexDirection: "column",
					padding: 0,
					overflow: "hidden",
					backgroundColor: "#fafaf7",
					borderRadius: "12px",
					boxShadow: "0 24px 48px rgba(0,0,0,0.15)",
				}}
				onClick={(event) => event.stopPropagation()}
			>
				{/* Header */}
				<div
					style={{
						padding: "1.5rem",
						borderBottom: "1px solid rgba(74, 92, 34, 0.1)",
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						backgroundColor: "#fff",
					}}
				>
					<div>
						<h3
							style={{
								margin: 0,
								fontFamily: "var(--font-heading)",
								fontSize: "1.4rem",
								color: "#1a1f0f",
							}}
						>
							{mode === "edit" ? "Edit Product" : "Add New Product"}
						</h3>
						<p style={{ margin: "0.2rem 0 0", fontSize: "0.85rem", color: "#6b6b60" }}>
							Step {step} of {steps.length} • {steps[step - 1]}
						</p>
					</div>
					<button
						className="admin-btn admin-btn-muted"
						type="button"
						onClick={onClose}
						style={{
							background: "transparent",
							color: "#6b6b60",
							border: "1px solid currentColor",
							padding: "0.4rem 1rem",
						}}
					>
						Close
					</button>
				</div>

				{/* Content area: Scrollable */}
				<div style={{ padding: "1.5rem", overflowY: "auto", flex: 1 }}>
					{error && (
						<div
							style={{
								padding: "0.8rem",
								background: "#ffebee",
								color: "#c62828",
								borderRadius: "6px",
								marginBottom: "1.5rem",
								fontSize: "0.9rem",
							}}
						>
							{error}
						</div>
					)}

					<form
						id="product-form"
						onSubmit={(e) => {
							e.preventDefault();
							if (step === steps.length) {
								handleSubmit(e);
							} else {
								setStep(step + 1);
							}
						}}
					>
						{/* Step 1: Basic Info */}
						{step === 1 && (
							<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem" }}>
								<div className="input-group" style={{ gridColumn: "1 / -1", display: "grid", gap: "0.4rem" }}>
									<label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>
										Product Title *
									</label>
									<input
										placeholder="Enter product title..."
										value={form.title}
										onChange={(e) => setForm({ ...form, title: e.target.value })}
										required
										style={{
											padding: "0.7rem",
											border: "1px solid #d4d4c8",
											borderRadius: "6px",
											fontSize: "0.95rem",
										}}
									/>
								</div>

								<div className="input-group" style={{ display: "grid", gap: "0.4rem" }}>
									<label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>
										Product Label (e.g. Best Seller)
									</label>
									<input
										placeholder="e.g. Best Seller, New Arrival"
										value={form.productLabel}
										onChange={(e) => setForm({ ...form, productLabel: e.target.value })}
										list="label-options"
										style={{
											padding: "0.7rem",
											border: "1px solid #d4d4c8",
											borderRadius: "6px",
											fontSize: "0.95rem",
										}}
									/>
									<datalist id="label-options">
										<option value="Best Seller" />
										<option value="New Arrival" />
										<option value="Limited Edition" />
										<option value="Trending" />
									</datalist>
								</div>

								<div className="input-group" style={{ display: "grid", gap: "0.4rem" }}>
									<label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>
										Display Order
									</label>
									<input
										type="number"
										placeholder="0"
										value={form.displayOrder}
										onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
										style={{
											padding: "0.7rem",
											border: "1px solid #d4d4c8",
											borderRadius: "6px",
											fontSize: "0.95rem",
										}}
									/>
									<span style={{ fontSize: "0.75rem", color: "#6b6b60" }}>
										Higher number = appears first (e.g. 10 shows before 0)
									</span>
								</div>

								<div className="input-group" style={{ display: "grid", gap: "0.4rem" }}>
									<label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>
										Gender Focus
									</label>
									<select
										value={form.gender}
										onChange={(e) =>
											setForm({
												...form,
												gender: e.target.value as GenderValue | "",
												category: "",
												subCategory: "",
												styles: [],
											})
										}
										style={{
											padding: "0.7rem",
											border: "1px solid #d4d4c8",
											borderRadius: "6px",
											fontSize: "0.95rem",
											background: "#fff",
										}}
									>
										<option value="">Select Gender...</option>
										{genderOptions.map((g) => (
											<option key={g._id} value={getGenderSlug(g)}>
												{getGenderLabel(g)}
											</option>
										))}
									</select>
								</div>

								<div className="input-group" style={{ display: "grid", gap: "0.4rem" }}>
									<label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>
										Category
									</label>
									<select
										value={form.category}
										onChange={(e) => {
											setForm({ ...form, category: e.target.value, subCategory: "" });
										}}
										disabled={!form.gender}
										style={{
											padding: "0.7rem",
											border: "1px solid #d4d4c8",
											borderRadius: "6px",
											fontSize: "0.95rem",
											background: "#fff",
											opacity: !form.gender ? 0.6 : 1,
										}}
									>
										<option value="">
											{form.gender ? "Select Category..." : "Select gender first"}
										</option>
										{filteredCategories.map((c) => (
											<option key={c._id} value={c._id}>
												{c.name || c.title}
											</option>
										))}
									</select>
								</div>

								<div className="input-group" style={{ display: "grid", gap: "0.4rem" }}>
									<label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>
										Sub Category
									</label>
									<select
										value={form.subCategory}
										onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
										disabled={!form.category}
										style={{
											padding: "0.7rem",
											border: "1px solid #d4d4c8",
											borderRadius: "6px",
											fontSize: "0.95rem",
											background: "#fff",
											opacity: !form.category ? 0.6 : 1,
										}}
									>
										<option value="">
											{form.category ? "Select Sub Category..." : "Select category first"}
										</option>
										{filteredSubCategories.map((c: any) => (
											<option key={c._id} value={c._id}>
												{c.name || c.title}
											</option>
										))}
									</select>
								</div>

								<div className="input-group" style={{ display: "grid", gap: "0.4rem" }}>
									<label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>Styles (Multi-select)</label>
									<div
										style={{
											padding: "0.7rem",
											border: "1px solid #d4d4c8",
											borderRadius: "6px",
											fontSize: "0.95rem",
											background: "#fff",
											maxHeight: "150px",
											overflowY: "auto",
											opacity: !form.gender ? 0.6 : 1,
											pointerEvents: !form.gender ? "none" : "auto",
										}}
									>
										{!form.gender && (
											<span style={{ color: "#6b6b60" }}>Select gender first</span>
										)}
										{form.gender && filteredStyles.map((c) => (
											<label key={c._id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem", cursor: "pointer" }}>
												<input
													type="checkbox"
													checked={form.styles.includes(c._id)}
													onChange={(e) => {
														const newStyles = e.target.checked
															? [...form.styles, c._id]
															: form.styles.filter((id: string) => id !== c._id);
														setForm({ ...form, styles: newStyles });
													}}
												/>
												<span style={{ fontSize: "0.9rem" }}>{c.name || c.title}</span>
											</label>
										))}
									</div>
								</div>

								<div className="input-group" style={{ gridColumn: "1 / -1", display: "grid", gap: "0.4rem" }}>
									<label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>
										Short Description
									</label>
									<textarea
										placeholder="Write a short summary..."
										value={form.description}
										onChange={(e) => setForm({ ...form, description: e.target.value })}
										rows={3}
										style={{
											padding: "0.7rem",
											border: "1px solid #d4d4c8",
											borderRadius: "6px",
											fontSize: "0.95rem",
											resize: "vertical",
										}}
									/>
								</div>

								<div className="input-group" style={{ gridColumn: "1 / -1", display: "grid", gap: "0.4rem" }}>
									<label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>
										Detailed About
									</label>
									<textarea
										placeholder="Write full details. Use Enter for new lines."
										value={form.about}
										onChange={(e) => setForm({ ...form, about: toPlainText(e.target.value) })}
										rows={4}
										style={{
											padding: "0.7rem",
											border: "1px solid #d4d4c8",
											borderRadius: "6px",
											fontSize: "0.95rem",
											resize: "vertical",
										}}
									/>
								</div>

								<label
									style={{
										gridColumn: "1 / -1",
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										gap: "1rem",
										padding: "0.9rem 1rem",
										border: "1px solid #d4d4c8",
										borderRadius: "8px",
										background: "#f9f9f7",
										cursor: "pointer",
									}}
								>
									<span style={{ display: "grid", gap: "0.2rem" }}>
										<span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#3d4a20" }}>
											Allow Customization
										</span>
										<span style={{ fontSize: "0.78rem", color: "#6b6b60" }}>
											Show the customization and gift message box on this product detail page.
										</span>
									</span>
									<span
										style={{
											position: "relative",
											width: 46,
											height: 26,
											borderRadius: 999,
											background: form.allowCustomization ? "#4a5c22" : "#d4d4c8",
											flex: "0 0 auto",
											transition: "background 0.2s ease",
										}}
									>
										<input
											type="checkbox"
											checked={form.allowCustomization}
											onChange={(e) => setForm({ ...form, allowCustomization: e.target.checked })}
											style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
										/>
										<span
											style={{
												position: "absolute",
												top: 3,
												left: form.allowCustomization ? 23 : 3,
												width: 20,
												height: 20,
												borderRadius: "50%",
												background: "#fff",
												boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
												transition: "left 0.2s ease",
												pointerEvents: "none",
											}}
										/>
									</span>
								</label>

								{form.allowCustomization && (
									<>
										<div className="input-group" style={{ gridColumn: "1 / -1", marginTop: "-0.5rem", padding: "0 1rem 1rem 1rem", borderBottom: "1px solid #e1e1d8" }}>
										<label htmlFor="maxCustomImages" style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20", marginBottom: "0.2rem" }}>
											Maximum Custom Images Allowed
										</label>
										<input
											id="maxCustomImages"
											type="number"
											min="0"
											max="10"
											value={form.maxCustomImages}
											onChange={(e) => setForm({ ...form, maxCustomImages: e.target.value })}
											style={{
												width: "100%",
												maxWidth: "200px",
												padding: "0.6rem 0.8rem",
												border: "1.5px solid #d4d4c8",
												borderRadius: "6px",
												fontSize: "0.9rem",
												outline: "none",
											}}
										/>
										<span style={{ display: "block", fontSize: "0.75rem", color: "#6b6b60", marginTop: "0.3rem" }}>
											How many images the user is allowed to upload.
										</span>
									</div>

									<div className="input-group" style={{ gridColumn: "1 / -1", marginTop: "-0.5rem", padding: "0 1rem 1rem 1rem", borderBottom: "1px solid #e1e1d8" }}>
										<label htmlFor="customImageLabels" style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20", marginBottom: "0.2rem" }}>
											Custom Image Labels (Comma-separated)
										</label>
										<input
											id="customImageLabels"
											type="text"
											value={form.customImageLabels}
											onChange={(e) => setForm({ ...form, customImageLabels: e.target.value })}
											placeholder="e.g. Image for polaroid, Image for card"
											style={{
												width: "100%",
												padding: "0.6rem 0.8rem",
												border: "1.5px solid #d4d4c8",
												borderRadius: "6px",
												fontSize: "0.9rem",
												outline: "none",
											}}
										/>
										<span style={{ display: "block", fontSize: "0.75rem", color: "#6b6b60", marginTop: "0.3rem" }}>
											Optional: Specify text regarding each image. The user will be asked to upload images for these specific labels.
										</span>
									</div>
									</>
								)}

								<div className="input-group" style={{ gridColumn: "1 / -1", display: "grid", gap: "0.4rem", padding: "1rem", border: "1px solid #d4d4c8", borderRadius: "8px", background: "#f9f9f7" }}>
									<label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>
										Quantity Variants (e.g. Single, Pair)
									</label>
									<span style={{ fontSize: "0.75rem", color: "#6b6b60", marginBottom: "0.5rem" }}>
										Replaces the old "Number of items in set". Leave empty if not applicable.
									</span>
									{quantityVariants.map((qv, idx) => (
										<div key={idx} style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
											<input
												type="text"
												placeholder="Label (e.g. Single)"
												value={qv.label}
												onChange={(e) => {
													const newQv = [...quantityVariants];
													newQv[idx].label = e.target.value;
													setQuantityVariants(newQv);
												}}
												style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc", flex: 1 }}
											/>
											<input
												type="number"
												placeholder="Quantity (e.g. 1)"
												value={qv.quantity}
												onChange={(e) => {
													const newQv = [...quantityVariants];
													newQv[idx].quantity = Number(e.target.value);
													setQuantityVariants(newQv);
												}}
												style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc", flex: 1 }}
											/>
											<input
												type="number"
												placeholder="Price (₹)"
												value={qv.price}
												onChange={(e) => {
													const newQv = [...quantityVariants];
													newQv[idx].price = Number(e.target.value);
													setQuantityVariants(newQv);
												}}
												style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc", flex: 1 }}
											/>
											<button
												type="button"
												onClick={() => setQuantityVariants(quantityVariants.filter((_, i) => i !== idx))}
												style={{ background: "#ffebee", color: "#c62828", border: "none", borderRadius: "4px", padding: "0.4rem 0.6rem", cursor: "pointer" }}
											>
												Remove
											</button>
										</div>
									))}
									<button
										type="button"
										onClick={() => setQuantityVariants([...quantityVariants, { label: "", quantity: 1, price: 0 }])}
										style={{ alignSelf: "flex-start", background: "#4a5c22", color: "#fff", border: "none", borderRadius: "4px", padding: "0.5rem 1rem", fontSize: "0.8rem", cursor: "pointer", marginTop: "0.5rem" }}
									>
										+ Add Quantity Variant
									</button>
								</div>

								{/* Number of Pieces — only for Custom Charms / Keychains */}
								{isCharmOrKeychain && (
									<div
										style={{
											gridColumn: "1 / -1",
											border: "1.5px solid #b5c27a",
											borderRadius: "10px",
											padding: "1rem 1.1rem",
											background: "linear-gradient(135deg, #f4f7e8 0%, #fafbf2 100%)",
											display: "grid",
											gap: "0.75rem",
										}}
									>
										<div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
											<span style={{ fontSize: "1rem" }}>💎</span>
											<span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#3d4a20" }}>
												Number of Pieces Options
											</span>
											<span style={{ fontSize: "0.75rem", color: "#6b6b60", marginLeft: 4 }}>
												— customers pick one (e.g. 3, 5, 7)
											</span>
										</div>

										{/* Current options as chips */}
										{charmPieceOptions.length > 0 ? (
											<div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
												{charmPieceOptions.map((val) => (
													<span
														key={val}
														style={{
															display: "inline-flex",
															alignItems: "center",
															gap: "0.35rem",
															padding: "0.35rem 0.85rem",
															borderRadius: "999px",
															background: "#4a5c22",
															color: "#fff",
															fontSize: "0.88rem",
															fontWeight: 700,
															letterSpacing: "0.04em",
														}}
													>
														{val} pcs
														<button
															type="button"
															onClick={() => removePieceOption(val)}
															style={{
																background: "rgba(255,255,255,0.25)",
																border: "none",
																borderRadius: "50%",
																width: 18,
																height: 18,
																cursor: "pointer",
																color: "#fff",
																fontSize: 13,
																display: "flex",
																alignItems: "center",
																justifyContent: "center",
																padding: 0,
																lineHeight: 1,
															}}
															aria-label={`Remove ${val}`}
														>
															×
														</button>
													</span>
												))}
											</div>
										) : (
											<p style={{ fontSize: "0.8rem", color: "#9b9b8c", margin: 0 }}>
												No options added yet. Add at least one (e.g. 3, 5, 7).
											</p>
										)}

										{/* Add new option */}
										<div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
											<input
												type="number"
												min={1}
												max={99}
												placeholder="e.g. 3"
												value={newPieceInput}
												onChange={(e) => setNewPieceInput(e.target.value)}
												onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addPieceOption(); } }}
												style={{
													width: 90,
													padding: "0.5rem 0.7rem",
													border: "1px solid #b5c27a",
													borderRadius: "6px",
													fontSize: "0.95rem",
													background: "#fff",
												}}
											/>
											<button
												type="button"
												onClick={addPieceOption}
												style={{
													padding: "0.5rem 1rem",
													background: "#4a5c22",
													color: "#fff",
													border: "none",
													borderRadius: "6px",
													fontWeight: 600,
													fontSize: "0.85rem",
													cursor: "pointer",
													whiteSpace: "nowrap",
												}}
											>
												+ Add Option
											</button>
											<span style={{ fontSize: "0.78rem", color: "#9b9b8c" }}>
												Press Enter or click Add
											</span>
										</div>

										{/* Total number of charms available */}
										<div style={{ display: "grid", gap: "0.4rem", marginTop: "0.5rem" }}>
											<label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>
												Total Available Charms in Reference Image
											</label>
											<input
												type="number"
												min={1}
												value={form.totalCharms}
												onChange={(e) => setForm(f => ({ ...f, totalCharms: e.target.value }))}
												placeholder="e.g. 42"
												style={{
													width: "100%",
													padding: "0.6rem 0.8rem",
													border: "1.5px solid #d9cdb8",
													borderRadius: "8px",
													fontSize: "0.95rem",
													background: "#fff",
												}}
											/>
											<span style={{ fontSize: "0.75rem", color: "#6b6b60" }}>
												— Customers will choose their charms from Charm 1 to Charm N based on this count
											</span>
										</div>

										<div style={{ display: "grid", gap: "0.4rem", marginTop: "0.5rem" }}>
											<label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>
												Price Per Charm (₹)
											</label>
											<input
												type="number"
												min={0}
												value={form.perCharmPrice}
												onChange={(e) => setForm(f => ({ ...f, perCharmPrice: e.target.value }))}
												placeholder="e.g. 50"
												style={{
													width: "100%",
													padding: "0.6rem 0.8rem",
													border: "1.5px solid #d9cdb8",
													borderRadius: "8px",
													fontSize: "0.95rem",
													background: "#fff",
												}}
											/>
											<span style={{ fontSize: "0.75rem", color: "#6b6b60" }}>
												— Added to the base price per charm selected
											</span>
										</div>
									</div>
								)}

							</div>
						)}

						{/* Step 2: Pricing */}
						{step === 2 && (
							<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem" }}>
								<div className="input-group" style={{ display: "grid", gap: "0.4rem" }}>
									<label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>
										Price (INR) *
									</label>
									<input
										placeholder="0"
										type="number"
										value={form.price}
										onChange={(e) => setForm({ ...form, price: e.target.value })}
										required
										style={{
											padding: "0.7rem",
											border: "1px solid #d4d4c8",
											borderRadius: "6px",
											fontSize: "0.95rem",
										}}
									/>
								</div>

								<div className="input-group" style={{ display: "grid", gap: "0.4rem" }}>
									<label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>
										Discounted Price (INR)
									</label>
									<input
										placeholder="0 (Optional)"
										type="number"
										value={form.discountedPrice}
										onChange={(e) => setForm({ ...form, discountedPrice: e.target.value })}
										style={{
											padding: "0.7rem",
											border: "1px solid #d4d4c8",
											borderRadius: "6px",
											fontSize: "0.95rem",
										}}
									/>
								</div>

								<div className="input-group" style={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem", padding: "1rem", border: "1px solid #d4d4c8", borderRadius: "8px", background: "#f9f9f7" }}>
									<div style={{ display: "grid", gap: "0.4rem" }}>
										<label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>
											Cost Price (INR)
										</label>
										<input
											placeholder="0 (For profit calculation)"
											type="number"
											value={form.costPrice}
											onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
											style={{
												padding: "0.7rem",
												border: "1px solid #d4d4c8",
												borderRadius: "6px",
												fontSize: "0.95rem",
											}}
										/>
									</div>
									<div style={{ display: "grid", gap: "0.4rem", alignContent: "center" }}>
										<label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>
											Estimated Profit
										</label>
										{(() => {
											const cp = Number(form.costPrice) || 0;
											const sp = Number(form.discountedPrice) || Number(form.price) || 0;
											if (cp > 0 && sp > 0) {
												const profit = sp - cp;
												const margin = ((profit / sp) * 100).toFixed(1);
												return (
													<div style={{ color: profit >= 0 ? "#4a5c22" : "#c62828", fontWeight: 600, fontSize: "1.1rem" }}>
														₹{profit} <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>({margin}% margin)</span>
													</div>
												);
											}
											return <span style={{ color: "#6b6b60", fontSize: "0.9rem" }}>Enter price and cost price</span>;
										})()}
									</div>
								</div>

								<div className="input-group" style={{ gridColumn: "1 / -1", display: "grid", gap: "0.4rem" }}>
									<label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>
										Discount Tag
									</label>
									<input
										placeholder="e.g. 20% OFF or Limited Time Deal"
										value={form.discountTag}
										onChange={(e) => setForm({ ...form, discountTag: e.target.value })}
										style={{
											padding: "0.7rem",
											border: "1px solid #d4d4c8",
											borderRadius: "6px",
											fontSize: "0.95rem",
										}}
									/>
								</div>

								<div className="input-group" style={{ gridColumn: "1 / -1", display: "grid", gap: "0.4rem" }}>
									<label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>
										Stock Count
									</label>
									<input
										placeholder="0"
										type="number"
										value={form.stock}
										onChange={(e) => setForm({ ...form, stock: e.target.value })}
										style={{
											padding: "0.7rem",
											border: "1px solid #d4d4c8",
											borderRadius: "6px",
											fontSize: "0.95rem",
										}}
									/>
								</div>

								<div className="input-group" style={{ display: "grid", gap: "0.4rem" }}>
									<label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>
										Max Quantity per Order
									</label>
									<input
										placeholder="e.g. 10"
										type="number"
										value={form.maxQuantity}
										onChange={(e) => setForm({ ...form, maxQuantity: e.target.value })}
										style={{
											padding: "0.7rem",
											border: "1px solid #d4d4c8",
											borderRadius: "6px",
											fontSize: "0.95rem",
										}}
									/>
								</div>


								<div className="input-group" style={{ gridColumn: "1 / -1", display: "grid", gap: "0.4rem" }}>
									<label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>
										Main Product Image
									</label>
									{form.mainImage && (
										<div style={{ fontSize: "0.85rem", color: "#555", marginBottom: "0.5rem", display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
											{typeof form.mainImage === "string" ? (
												<img src={form.mainImage} alt="main" style={{ maxWidth: 120, maxHeight: 80, objectFit: 'cover', borderRadius: 6, border: '1px solid #d4d4c8' }} />
											) : (
												<strong>Pending upload</strong>
											)}
										</div>
									)}
									<input
										type="file"
										accept="image/*"
										onChange={(e) => {
											if (e.target.files?.[0]) {
												setMainImageFile(e.target.files[0]);
											}
										}}
										style={{
											padding: "0.4rem",
											border: "1px solid #d4d4c8",
											borderRadius: "6px",
											fontSize: "0.95rem",
										}}
									/>
								</div>

								<div className="input-group" style={{ gridColumn: "1 / -1", display: "grid", gap: "0.4rem" }}>
									<label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>
										Gallery Images
									</label>
									<div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
										{form.galleryImages.map((img: string) => (
											<div key={img} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f5f4ef', padding: 6, borderRadius: 6, border: '1px solid #d4d4c8' }}>
												{typeof img === 'string' ? (
													<img src={img} alt="gallery" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 6, border: '1px solid #ddd' }} />
												) : (
													<span style={{ width: 80, height: 60, display: 'inline-block', background: '#e8ead0', borderRadius: 6 }} />
												)}
												<span style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis' }}>{typeof img === 'string' ? img : 'Image'}</span>
												<button
													type="button"
													onClick={() =>
														setForm((prev) => ({
															...prev,
															galleryImages: prev.galleryImages.filter((i: string) => i !== img),
														}))
													}
													style={{
														background: 'none',
														border: 'none',
														cursor: 'pointer',
														color: '#943b2a',
														padding: 0,
													}}
												>
													×
												</button>
											</div>
										))}
										{galleryImageFiles.map((file, i) => (
											<span
												key={i}
												style={{
													background: "#e8ead0",
													border: "1px solid #b5c27a",
													padding: "0.3rem 0.6rem",
													borderRadius: "4px",
													fontSize: "0.75rem",
													display: "flex",
													alignItems: "center",
													gap: "0.4rem",
													color: "#1c1c1a",
												}}
											>
												{file.name.substring(0, 20)}
												<button
													type="button"
													onClick={() => setGalleryImageFiles((prev) => prev.filter((_, idx) => idx !== i))}
													style={{
														background: "none",
														border: "none",
														cursor: "pointer",
														color: "#943b2a",
														padding: 0,
													}}
												>
													×
												</button>
											</span>
										))}
									</div>
									<input
										type="file"
										multiple
										accept="image/*"
										onChange={(e) => {
											if (e.target.files) {
												setGalleryImageFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
											}
										}}
										style={{
											padding: "0.4rem",
											border: "1px solid #d4d4c8",
											borderRadius: "6px",
											fontSize: "0.95rem",
										}}
									/>
								</div>

								<div className="input-group" style={{ gridColumn: "1 / -1", display: "grid", gap: "0.4rem" }}>
									<label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>Tags</label>
									<div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
										{form.tags.map((t: string) => (
											<span
												key={t}
												style={{
													background: "#e8ead0",
													color: "#2d3318",
													padding: "0.3rem 0.6rem",
													borderRadius: "100px",
													fontSize: "0.85rem",
													display: "flex",
													alignItems: "center",
													gap: "0.4rem",
													fontWeight: 500,
												}}
											>
												{t}
												<button
													type="button"
													onClick={() => removeTag(t)}
													style={{
														background: "none",
														border: "none",
														cursor: "pointer",
														color: "#943b2a",
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
													}}
												>
													×
												</button>
											</span>
										))}
									</div>
									<div style={{ display: "flex", gap: "0.5rem" }}>
										<input
											placeholder="Type tag and press enter..."
											value={newTagInput}
											onChange={(e) => setNewTagInput(e.target.value)}
											onKeyDown={(e) => {
												if (e.key === "Enter") {
													e.preventDefault();
													addTag(newTagInput);
												}
											}}
											list="available-tags"
											style={{
												flex: 1,
												padding: "0.7rem",
												border: "1px solid #d4d4c8",
												borderRadius: "6px",
												fontSize: "0.95rem",
											}}
										/>
										<datalist id="available-tags">
											{allTags.map((t) => (
												<option key={t} value={t} />
											))}
										</datalist>
										<button
											type="button"
											onClick={() => addTag(newTagInput)}
											style={{
												padding: "0.7rem",
												background: "#4a5c22",
												color: "#fff",
												border: "none",
												borderRadius: "6px",
												fontWeight: 500,
												cursor: "pointer",
											}}
										>
											Add Tag
										</button>
									</div>
								</div>

								<div className="input-group" style={{ gridColumn: "1 / -1", display: "grid", gap: "0.4rem" }}>
									<label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>SEO Tags</label>
									<div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
										{form.seoTags.map((t: string) => (
											<span
												key={t}
												style={{
													background: "#f5f4ef",
													color: "#2d3318",
													padding: "0.3rem 0.6rem",
													borderRadius: "100px",
													border: "1px solid #d4d4c8",
													fontSize: "0.85rem",
													display: "flex",
													alignItems: "center",
													gap: "0.4rem",
													fontWeight: 500,
												}}
											>
												{t}
												<button
													type="button"
													onClick={() => removeSeoTag(t)}
													style={{
														background: "none",
														border: "none",
														cursor: "pointer",
														color: "#943b2a",
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
													}}
												>
													×
												</button>
											</span>
										))}
									</div>
									<div style={{ display: "flex", gap: "0.5rem" }}>
										<input
											placeholder="Type SEO keyword and press enter..."
											value={newSeoTagInput}
											onChange={(e) => setNewSeoTagInput(e.target.value)}
											onKeyDown={(e) => {
												if (e.key === "Enter") {
													e.preventDefault();
													addSeoTag(newSeoTagInput);
												}
											}}
											style={{
												flex: 1,
												padding: "0.7rem",
												border: "1px solid #d4d4c8",
												borderRadius: "6px",
												fontSize: "0.95rem",
											}}
										/>
										<button
											type="button"
											onClick={() => addSeoTag(newSeoTagInput)}
											style={{
												padding: "0.7rem",
												background: "#4a5c22",
												color: "#fff",
												border: "none",
												borderRadius: "6px",
												fontWeight: 500,
												cursor: "pointer",
											}}
										>
											Add SEO Tag
										</button>
									</div>
									<small style={{ color: "#6b6b60" }}>
										Used as product page SEO keywords. Example: gold necklace, gift jewellery, party earrings.
									</small>
								</div>
							</div>
						)}

						{/* Step 3: Colors & Sizes */}
						{step === 3 && (
							<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", alignItems: "start" }}>
								{/* Colors Section */}
								<div style={{ display: "grid", gap: "0.9rem", alignContent: "start", background: "#f9f9f7", border: "1px solid #e2e2d8", borderRadius: "8px", padding: "1rem" }}>
									<h4 style={{ margin: 0, fontSize: "1rem", color: "#3d4a20", fontWeight: 600 }}>
										Colors
									</h4>
									<div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", minHeight: 40, alignItems: "flex-start" }}>
										{colors.map((color, idx) => (
											<div
												key={idx}
												style={{
													display: "flex",
													alignItems: "center",
													gap: "0.5rem",
													background: "#fff",
													padding: "0.45rem 0.6rem",
													borderRadius: "6px",
													border: "1px solid #d4d4c8",
													minHeight: 40,
												}}
											>
												<div
													style={{
														width: "24px",
														height: "24px",
														borderRadius: "4px",
														backgroundColor: color.hex,
														border: "1px solid #ccc",
													}}
												/>
												{color.existingImage && (
													<img src={color.existingImage} alt={color.name} style={{ width: 24, height: 24, objectFit: 'cover', borderRadius: 4 }} />
												)}
												{color.imageFile && (
													<span style={{ fontSize: '0.75rem', color: '#4a5c22', display: 'flex', alignItems: 'center' }}>
														<span style={{ display: 'inline-block', maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{color.imageFile.name}</span>
													</span>
												)}
												<span style={{ fontSize: "0.85rem", fontWeight: 500 }}>{color.name}</span>
												<button
													type="button"
													onClick={() => removeColor(idx)}
													style={{
														background: "none",
														border: "none",
														cursor: "pointer",
														color: "#943b2a",
														padding: 0,
													}}
												>
													×
												</button>
											</div>
										))}
									</div>

									<div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 100px", gap: "0.7rem", alignItems: "stretch" }}>
										<input
											placeholder="e.g. Gold, Silver, Red"
											value={newColor.name}
											onChange={(e) => setNewColor({ ...newColor, name: e.target.value })}
											onKeyDown={(e) => {
												if (e.key === "Enter") {
													e.preventDefault();
													addColor();
												}
											}}
											style={{
												padding: "0.6rem",
												border: "1px solid #d4d4c8",
												borderRadius: "4px",
												fontSize: "0.9rem",
												minHeight: 44,
												boxSizing: "border-box",
											}}
										/>
										<div style={{ position: "relative", minHeight: 44 }}>
											<input
												type="file"
												accept="image/*"
												id="color-image-upload"
												onChange={(e) => {
													if (e.target.files?.[0]) {
														setNewColor({ ...newColor, imageFile: e.target.files[0] });
													}
												}}
												style={{
													position: "absolute",
													inset: 0,
													opacity: 0,
													cursor: "pointer",
													width: "100%",
												}}
											/>
											<div style={{ 
												display: "flex", 
												alignItems: "center", 
												justifyContent: "center", 
												height: "100%", 
												border: "1px solid #d4d4c8", 
												borderRadius: "4px", 
												background: "#fff", 
												fontSize: "0.8rem", 
												color: newColor.imageFile ? "#4a5c22" : "#6b6b60" 
											}}>
												{newColor.imageFile ? '✓ Image' : '+ Image'}
											</div>
										</div>
										<button
											type="button"
											onClick={addColor}
											style={{
												padding: "0.6rem",
												background: "#4a5c22",
												color: "#fff",
												border: "none",
												borderRadius: "4px",
												fontWeight: 500,
												cursor: "pointer",
												gridColumn: "1 / -1",
												minHeight: 44,
											}}
										>
											Add Color
										</button>
									</div>
								</div>

								{/* Sizes Section */}
								<div style={{ display: "grid", gap: "0.9rem", alignContent: "start", background: "#f9f9f7", border: "1px solid #e2e2d8", borderRadius: "8px", padding: "1rem" }}>
									<h4 style={{ margin: 0, fontSize: "1rem", color: "#3d4a20", fontWeight: 600 }}>
										Sizes
									</h4>
									<div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", minHeight: 40, alignItems: "flex-start" }}>
										{sizes.map((size, idx) => (
											<span
												key={idx}
												style={{
													background: "#e8ead0",
													color: "#2d3318",
													padding: "0.45rem 0.65rem",
													borderRadius: "4px",
													fontSize: "0.9rem",
													display: "flex",
													alignItems: "center",
													gap: "0.4rem",
													fontWeight: 500,
													minHeight: 40,
													boxSizing: "border-box",
												}}
											>
												{size}
												<button
													type="button"
													onClick={() => removeSize(idx)}
													style={{
														background: "none",
														border: "none",
														cursor: "pointer",
														color: "#943b2a",
														padding: 0,
													}}
												>
													×
												</button>
											</span>
										))}
									</div>

									<div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 78px", gap: "0.7rem", alignItems: "stretch" }}>
										<input
											placeholder="e.g. XS, S, M, L, XL, XXL"
											value={newSize}
											onChange={(e) => setNewSize(e.target.value)}
											onKeyDown={(e) => {
												if (e.key === "Enter") {
													e.preventDefault();
													addSize();
												}
											}}
											style={{
												padding: "0.6rem",
												border: "1px solid #d4d4c8",
												borderRadius: "4px",
												fontSize: "0.9rem",
												minHeight: 44,
												boxSizing: "border-box",
												width: "100%",
											}}
										/>
										<button
											type="button"
											onClick={addSize}
											style={{
												padding: "0.6rem 1rem",
												background: "#4a5c22",
												color: "#fff",
												border: "none",
												borderRadius: "4px",
												fontWeight: 500,
												cursor: "pointer",
												whiteSpace: "nowrap",
												minHeight: 44,
											}}
										>
											Add
										</button>
									</div>
								</div>
							</div>
						)}

						{/* Step 4: Variants */}
						{step === 4 && (
							<div style={{ display: "grid", gap: "1rem" }}>
								<h4 style={{ margin: 0, fontSize: "1rem", color: "#3d4a20", fontWeight: 600 }}>
									Product Variants (Color + Size + Stock + Image)
								</h4>

								{variants.length === 0 ? (
									<p style={{ color: "#6b6b60", fontSize: "0.9rem" }}>
										No variants yet. Add combinations of color and size with stock levels and images.
									</p>
								) : (
									<div style={{ display: "grid", gap: "0.8rem" }}>
										{variants.map((variant, idx) => (
											<div
												key={idx}
												style={{
													background: "#f9f9f7",
													padding: "1.2rem",
													borderRadius: "8px",
													border: "1px solid #d4d4c8",
													display: "flex",
													flexDirection: "column",
													gap: "1.2rem",
												}}
											>
												<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "1rem" }}>
													<div style={{ display: "grid", gap: "0.4rem" }}>
														<label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>
															Color
														</label>
														<select
															value={variant.color}
															onChange={(e) => updateVariant(idx, "color", e.target.value)}
															style={{
																padding: "0.6rem",
																border: "1px solid #d4d4c8",
																borderRadius: "4px",
																fontSize: "0.9rem",
																background: "#fff",
																width: "100%",
															}}
														>
															<option value="">Select Color</option>
															{colors.map((c, i) => (
																<option key={i} value={c.name}>
																	{c.name}
																</option>
															))}
														</select>
													</div>

													<div style={{ display: "grid", gap: "0.4rem" }}>
														<label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>
															Size
														</label>
														<select
															value={variant.size}
															onChange={(e) => updateVariant(idx, "size", e.target.value)}
															style={{
																padding: "0.6rem",
																border: "1px solid #d4d4c8",
																borderRadius: "4px",
																fontSize: "0.9rem",
																background: "#fff",
																width: "100%",
															}}
														>
															<option value="">Select Size</option>
															{sizes.map((s, i) => (
																<option key={i} value={s}>
																	{s}
																</option>
															))}
														</select>
													</div>

													<div style={{ display: "grid", gap: "0.4rem" }}>
														<label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>
															Price (INR)
														</label>
														<input
															type="number"
															value={variant.price}
															onChange={(e) => updateVariant(idx, "price", e.target.value)}
															placeholder="Optional"
															style={{
																padding: "0.6rem",
																border: "1px solid #d4d4c8",
																borderRadius: "4px",
																fontSize: "0.9rem",
																width: "100%",
																boxSizing: "border-box",
															}}
														/>
													</div>

													<div style={{ display: "grid", gap: "0.4rem" }}>
														<label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>
															Sale Price (INR)
														</label>
														<input
															type="number"
															value={variant.salePrice || ""}
															onChange={(e) => updateVariant(idx, "salePrice", e.target.value)}
															placeholder="Optional"
															style={{
																padding: "0.6rem",
																border: "1px solid #d4d4c8",
																borderRadius: "4px",
																fontSize: "0.9rem",
																width: "100%",
																boxSizing: "border-box",
															}}
														/>
													</div>

													<div style={{ display: "grid", gap: "0.4rem" }}>
														<label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>
															Stock
														</label>
														<input
															type="number"
															value={variant.stock}
															onChange={(e) => updateVariant(idx, "stock", parseInt(e.target.value) || 0)}
															placeholder="0"
															style={{
																padding: "0.6rem",
																border: "1px solid #d4d4c8",
																borderRadius: "4px",
																fontSize: "0.9rem",
																width: "100%",
																boxSizing: "border-box",
															}}
														/>
													</div>
												</div>

												<div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", borderTop: "1px solid #e8ead0", paddingTop: "1rem" }}>
													<div style={{ display: "flex", alignItems: "flex-end", gap: "1rem", flex: 1 }}>
														<div style={{ display: "grid", gap: "0.4rem", flex: 1, maxWidth: "300px" }}>
															<label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>
																Image
															</label>
															<input
																type="file"
																accept="image/*"
																onChange={(e) => {
																	if (e.target.files?.[0]) {
																		setVariantImageFile((prev) => ({
																			...prev,
																			[variant.variantIndex]: e.target.files![0],
																		}));
																	}
																}}
																style={{
																	padding: "0.5rem",
																	border: "1px dashed #b5c27a",
																	borderRadius: "6px",
																	fontSize: "0.85rem",
																	background: "#fff",
																	cursor: "pointer",
																	width: "100%",
																	boxSizing: "border-box",
																}}
															/>
														</div>
														
														<div style={{ display: "flex", alignItems: "center", gap: "0.5rem", minHeight: "42px" }}>
															{variantImageFile[variant.variantIndex] ? (
																<span style={{ color: "#4a5c22", fontWeight: 500, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
																	✓ <span style={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{variantImageFile[variant.variantIndex].name}</span>
																</span>
															) : variant.existingImage && typeof variant.existingImage === 'string' ? (
																<img src={variant.existingImage} alt="variant" style={{ width: 42, height: 42, objectFit: 'cover', borderRadius: 6, border: '1px solid #d4d4c8' }} />
															) : null}
														</div>
													</div>

													<button
														type="button"
														onClick={() => removeVariant(idx)}
														onMouseOver={(e) => { e.currentTarget.style.background = "#c62828"; e.currentTarget.style.color = "#fff"; }}
														onMouseOut={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#c62828"; }}
														style={{
															padding: "0.6rem 1.2rem",
															background: "#fff",
															color: "#c62828",
															border: "1px solid #c62828",
															borderRadius: "6px",
															fontWeight: 500,
															cursor: "pointer",
															transition: "all 0.2s ease",
															whiteSpace: "nowrap",
														}}
													>
														Remove Variant
													</button>
												</div>
											</div>
										))}
									</div>
								)}

								<button
									type="button"
									onClick={addVariant}
									style={{
										padding: "0.8rem",
										background: "#e8ead0",
										color: "#2d3318",
										border: "1px solid #b5c27a",
										borderRadius: "6px",
										fontWeight: 600,
										cursor: "pointer",
										fontSize: "0.95rem",
									}}
								>
									+ Add Variant
								</button>
							</div>
						)}

						{step === 5 && (
							<div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
								{/* Size Chart Section */}
								<div>
									<h3 style={{ fontSize: "1.1rem", color: "#2d3715", marginBottom: "0.5rem" }}>Size Chart</h3>
									<p style={{ fontSize: "0.85rem", color: "#666", marginBottom: "1rem" }}>
										Upload a custom size chart image for this product. If left empty, the global default size chart will be used.
									</p>
									<div
										style={{
											border: "2px dashed #e0e0e0",
											borderRadius: "8px",
											padding: "1rem",
											textAlign: "center",
											cursor: "pointer",
											background: "#fafafa",
										}}
									>
										<input
											type="file"
											accept="image/*"
											id="sizeChartUpload"
											style={{ display: "none" }}
											onChange={(e) => {
												if (e.target.files && e.target.files[0]) {
													setSizeChartImageFile(e.target.files[0]);
												}
											}}
										/>
										<label htmlFor="sizeChartUpload" style={{ cursor: "pointer", display: "block" }}>
											{sizeChartImageFile ? (
												<div style={{ color: "#4a5c22", fontWeight: 500 }}>New file selected: {sizeChartImageFile.name}</div>
											) : form.sizeChartImage ? (
												<div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
													{/* eslint-disable-next-line @next/next/no-img-element */}
													<img src={form.sizeChartImage} alt="Current Size Chart" style={{ height: "60px", borderRadius: "4px" }} />
													<span style={{ fontSize: "0.85rem", color: "#666" }}>Click to replace</span>
													<button
														type="button"
														onClick={(e) => {
															e.preventDefault();
															setForm({ ...form, sizeChartImage: null });
														}}
														style={{
															marginTop: "0.5rem",
															fontSize: "0.8rem",
															color: "#d32f2f",
															background: "none",
															border: "none",
															cursor: "pointer",
															textDecoration: "underline",
														}}
													>
														Remove Image (Use Default)
													</button>
												</div>
											) : (
												<div style={{ color: "#666" }}>
													<div>Click to upload a custom Size Chart image</div>
													<div style={{ fontSize: "0.8rem", marginTop: "4px" }}>Using default size chart</div>
												</div>
											)}
										</label>
									</div>
								</div>

								{/* Steps to measure it */}
								<div className="input-group" style={{ marginTop: "1.5rem" }}>
									<label htmlFor="sizeChartSteps" style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20", marginBottom: "0.4rem", display: "block" }}>
										Steps to measure it
									</label>
									<textarea
										id="sizeChartSteps"
										value={form.sizeChartSteps}
										onChange={(e) => setForm({ ...form, sizeChartSteps: e.target.value })}
										placeholder="e.g. 1. Take a soft measuring tape&#10;2. Wrap it around your wrist"
										rows={4}
										style={{
											width: "100%",
											padding: "0.8rem",
											border: "1px solid #d4d4c8",
											borderRadius: "6px",
											fontSize: "0.9rem",
											fontFamily: "inherit",
											resize: "vertical",
										}}
									/>
									<span style={{ display: "block", fontSize: "0.75rem", color: "#6b6b60", marginTop: "0.4rem" }}>
										These instructions will appear below the size chart. You can use line breaks.
									</span>
								</div>


								<hr style={{ border: "none", borderTop: "1px solid #eee" }} />

								{/* Gift Box Section */}
								<div>
									<h3 style={{ fontSize: "1.1rem", color: "#2d3715", marginBottom: "0.5rem" }}>Premium Gift Box Upsell</h3>
									<p style={{ fontSize: "0.85rem", color: "#666", marginBottom: "1rem" }}>
										Configure the gift box add-on for this product. Uncheck the box below to disable the upsell entirely for this item.
									</p>

									<label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem", cursor: "pointer" }}>
										<input
											type="checkbox"
											checked={form.giftBoxEnabled}
											onChange={(e) => setForm({ ...form, giftBoxEnabled: e.target.checked })}
											style={{ width: "18px", height: "18px", accentColor: "#4a5c22" }}
										/>
										<span style={{ fontWeight: 500, color: "#2d3715" }}>Enable Gift Box Upsell</span>
									</label>

									{form.giftBoxEnabled && (
										<div style={{ display: "flex", flexDirection: "column", gap: "1.2rem", background: "#fcfcfa", padding: "1.5rem", borderRadius: "8px", border: "1px solid #eee" }}>
											<div style={{ display: "flex", gap: "1rem" }}>
												<div style={{ flex: 2 }}>
													<label className="admin-modal-label" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4a5c22', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Heading</label>
													<input
														type="text"
														value={form.giftBoxHeading}
														onChange={(e) => setForm({ ...form, giftBoxHeading: e.target.value })}
														style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d9be', background: '#fcfcfc', fontSize: '0.95rem', color: '#2d3318', outline: 'none', transition: 'border-color 0.2s ease, box-shadow 0.2s ease' }}
														placeholder="Premium Gift Box"
													/>
												</div>
												<div style={{ flex: 1 }}>
													<label className="admin-modal-label" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4a5c22', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price (+₹)</label>
													<input
														type="number"
														value={form.giftBoxPrice}
														onChange={(e) => setForm({ ...form, giftBoxPrice: e.target.value })}
														style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d9be', background: '#fcfcfc', fontSize: '0.95rem', color: '#2d3318', outline: 'none', transition: 'border-color 0.2s ease, box-shadow 0.2s ease' }}
														min="0"
													/>
												</div>
											</div>

											<div>
												<label className="admin-modal-label" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4a5c22', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</label>
												<input
													type="text"
													value={form.giftBoxDescription}
													onChange={(e) => setForm({ ...form, giftBoxDescription: e.target.value })}
													style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d9be', background: '#fcfcfc', fontSize: '0.95rem', color: '#2d3318', outline: 'none', transition: 'border-color 0.2s ease, box-shadow 0.2s ease' }}
													placeholder="Rigid magnetic-close box · satin ribbon · message card"
												/>
											</div>

											<div>
												<label className="admin-modal-label" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4a5c22', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gift Box Image</label>
												<div
													style={{
														border: "2px dashed #e0e0e0",
														borderRadius: "8px",
														padding: "1rem",
														textAlign: "center",
														cursor: "pointer",
														background: "#fff",
													}}
												>
													<input
														type="file"
														accept="image/*"
														id="giftBoxUpload"
														style={{ display: "none" }}
														onChange={(e) => {
															if (e.target.files && e.target.files[0]) {
																setGiftBoxImageFile(e.target.files[0]);
															}
														}}
													/>
													<label htmlFor="giftBoxUpload" style={{ cursor: "pointer", display: "block" }}>
														{giftBoxImageFile ? (
															<div style={{ color: "#4a5c22", fontWeight: 500 }}>New file selected: {giftBoxImageFile.name}</div>
														) : form.giftBoxImage ? (
															<div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
																{/* eslint-disable-next-line @next/next/no-img-element */}
																<img src={form.giftBoxImage} alt="Current Gift Box" style={{ height: "60px", borderRadius: "4px" }} />
																<span style={{ fontSize: "0.85rem", color: "#666" }}>Click to replace</span>
																<button
																	type="button"
																	onClick={(e) => {
																		e.preventDefault();
																		setForm({ ...form, giftBoxImage: null });
																	}}
																	style={{
																		marginTop: "0.5rem",
																		fontSize: "0.8rem",
																		color: "#d32f2f",
																		background: "none",
																		border: "none",
																		cursor: "pointer",
																		textDecoration: "underline",
																	}}
																>
																	Remove Image (Use Default)
																</button>
															</div>
														) : (
															<div style={{ color: "#666" }}>
																<div>Click to upload a custom Gift Box image</div>
																<div style={{ fontSize: "0.8rem", marginTop: "4px" }}>Using default gift box image</div>
															</div>
														)}
													</label>
												</div>
											</div>
										</div>
									)}
								</div>

								{/* Partial COD Setup */}
								<div className="input-group" style={{ gridColumn: "1 / -1", display: "flex", gap: "1rem", flexDirection: "column", padding: "1rem", background: "#f9f9f7", borderRadius: "8px", border: "1px solid #e2e2d8" }}>
									<div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
										<label style={{ position: "relative", display: "inline-block", width: "40px", height: "22px" }}>
											<input
												type="checkbox"
												checked={form.partialCODEnabled}
												onChange={(e) => setForm({ ...form, partialCODEnabled: e.target.checked })}
												style={{ opacity: 0, width: 0, height: 0 }}
											/>
											<span style={{
												position: "absolute", cursor: "pointer", inset: 0, backgroundColor: form.partialCODEnabled ? "#4a5c22" : "#d4d4c8", transition: ".4s", borderRadius: "22px"
											}}>
												<span style={{
													position: "absolute", content: '""', height: "16px", width: "16px", left: "3px", bottom: "3px", backgroundColor: "white", transition: ".4s", borderRadius: "50%",
													transform: form.partialCODEnabled ? "translateX(18px)" : "translateX(0)"
												}}></span>
											</span>
										</label>
										<span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#3d4a20" }}>Compulsory Partial COD</span>
									</div>
									{form.partialCODEnabled && (
										<div style={{ display: "grid", gap: "0.4rem" }}>
											<label style={{ fontSize: "0.85rem", fontWeight: 500, color: "#6b6b60" }}>Percentage to pay upfront (%)</label>
											<input
												type="number"
												min="0"
												max="100"
												value={form.partialCODPercentage}
												onChange={(e) => setForm({ ...form, partialCODPercentage: e.target.value })}
												style={{ padding: "0.6rem", border: "1px solid #d4d4c8", borderRadius: "6px", width: "120px" }}
											/>
										</div>
									)}
								</div>

							</div>
						)}
					</form>
				</div>

				{/* Footer with actions */}
				<div
					style={{
						padding: "1.2rem 1.5rem",
						borderTop: "1px solid rgba(74, 92, 34, 0.1)",
						background: "#fff",
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
					}}
				>
					<button
						type="button"
						onClick={() => (step === 1 ? onClose() : setStep(step - 1))}
						disabled={loading}
						style={{
							padding: "0.6rem 1.2rem",
							background: "transparent",
							border: "1px solid #6b7c3a",
							color: "#4a5c22",
							borderRadius: "6px",
							fontWeight: 500,
							cursor: "pointer",
							transition: "0.2s",
							opacity: loading ? 0.5 : 1,
						}}
					>
						{step === 1 ? "Cancel" : "Back"}
					</button>

					<button
						type="submit"
						form="product-form"
						disabled={loading}
						style={{
							padding: "0.6rem 1.5rem",
							background: "#4a5c22",
							color: "#f5e6b8",
							border: "none",
							borderRadius: "6px",
							fontWeight: 600,
							letterSpacing: "0.05em",
							cursor: "pointer",
							display: "flex",
							alignItems: "center",
							gap: "0.5rem",
							opacity: loading ? 0.7 : 1,
						}}
					>
						{step === steps.length
							? loading
								? "Saving..."
								: mode === "edit"
								? "Save Changes"
								: "Publish Product"
							: "Continue"}
					</button>
				</div>
			</div>
		</div>
	);
}
