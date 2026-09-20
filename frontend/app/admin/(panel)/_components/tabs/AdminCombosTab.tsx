"use client";
import React, { useRef, useState } from "react";

export type AdminComboProduct = {
	_id?: string;
	title: string;
	description?: string;
	image?: string;
	tags?: string[];
	seoTags?: string[];
	stock?: number | null;
	variants?: { name: string; options: { name: string; image?: string; stock?: number }[] | string | any }[];
	allowTextCustomization?: boolean;
	textCustomizationTitle?: string;
	allowImageCustomization?: boolean;
	imageCustomizationTitle?: string;
	maxImageUploads?: number;
	totalCharms?: number;
	perCharmPrice?: number;
	charmPieceOptions?: number[];
	charmPiecePricing?: { count: number; price: number }[];
	chainOptions?: { value: string; label: string; sub: string; price: number; image?: string }[];
};

export type AdminCombo = {
	_id: string;
	name: string;
	description?: string;
	type: "curated" | "custom";
	status: "active" | "inactive";
	displayOrder: number;
	image?: string;
	images?: string[];
	price?: number;
	originalPrice?: number;
	products?: AdminComboProduct[];
	itemsCount?: number;
	seoTags?: string[];
	allowComboTextCustomization?: boolean;
	comboTextCustomizationTitle?: string;
	allowComboImageCustomization?: boolean;
	comboImageCustomizationTitle?: string;
	comboMaxImageUploads?: number;
	pricingVariants?: { label: string; price: number }[];
};

export type ComboGalleryItem = {
	id: string;
	type: "existing" | "new";
	url?: string;
	file?: File;
	previewUrl: string;
};

type Props = {
	combos: AdminCombo[];
	onCreateCuratedCombo: (payload: FormData) => void;
	onCreateCustomCombo: (payload: FormData) => void;
	onEditCombo: (id: string, payload: FormData) => void;
	onDeleteCombo: (id: string) => void;
};

type ComboProductState = {
	_id?: string;
	title: string;
	description: string;
	imageFile?: File | null;
	imagePreview?: string | null;
	tags: string;           // comma-separated input
	seoTags: string;        // comma-separated input
	stock: string;
	variants: { name: string; options: { name: string; image?: string; imageFile?: File | null; imagePreview?: string | null; stock?: number }[] }[];
	allowTextCustomization: boolean;
	textCustomizationTitle: string;
	allowImageCustomization: boolean;
	imageCustomizationTitle: string;
	maxImageUploads: string;
	totalCharms: string;
	perCharmPrice: string;
	charmPiecePricing: { count: number; price: number }[];
	chainOptions: { value: string; label: string; sub: string; price: number; image?: string; imagePreview?: string | null; imageFile?: File | null }[];
};

type PricingVariant = { label: string; price: string };

type ModalState = {
	mode: "create" | "edit";
	kind: "curated" | "custom";
	id?: string;
	name: string;
	description: string;
	status: "active" | "inactive";
	displayOrder: string;
	price: string;
	originalPrice: string;
	itemsCount: string;
	seoTags: string;         // comma-separated
	allowComboTextCustomization: boolean;
	comboTextCustomizationTitle: string;
	allowComboImageCustomization: boolean;
	comboImageCustomizationTitle: string;
	comboMaxImageUploads: string;
	pricingVariants: PricingVariant[];
	products: ComboProductState[];
	imageFile: File | null;
	existingImage?: string;
	galleryItems?: ComboGalleryItem[];
};

const defaultModal: ModalState = {
	mode: "create",
	kind: "curated",
	name: "",
	description: "",
	status: "active",
	displayOrder: "0",
	price: "",
	originalPrice: "",
	itemsCount: "",
	seoTags: "",
	allowComboTextCustomization: false,
	comboTextCustomizationTitle: "",
	allowComboImageCustomization: false,
	comboImageCustomizationTitle: "",
	comboMaxImageUploads: "1",
	pricingVariants: [],
	products: [],
	imageFile: null,
	galleryItems: [],
};

const defaultProduct: ComboProductState = {
	title: "",
	description: "",
	imageFile: null,
	imagePreview: null,
	tags: "",
	seoTags: "",
	stock: "",
	variants: [],
	allowTextCustomization: false,
	textCustomizationTitle: "",
	allowImageCustomization: false,
	imageCustomizationTitle: "",
	maxImageUploads: "1",
	totalCharms: "0",
	perCharmPrice: "0",
	charmPiecePricing: [],
	chainOptions: [],
};

type TabKey = "curated" | "custom";

const INP = { padding: "0.5rem 0.8rem", border: "1px solid #d4d4c8", borderRadius: 6, fontSize: "0.9rem", width: "100%", boxSizing: "border-box" as const };
const LABEL = { fontSize: "0.82rem", fontWeight: 600, color: "#3d4a20", display: "block", marginBottom: "0.3rem" };
const FIELD: React.CSSProperties = { display: "flex", flexDirection: "column", gap: "0.25rem" };

export default function AdminCombosTab({
	combos,
	onCreateCuratedCombo,
	onCreateCustomCombo,
	onEditCombo,
	onDeleteCombo,
}: Props) {
	const safeCombos = Array.isArray(combos) ? combos : [];
	const [activeTab, setActiveTab] = useState<TabKey>("curated");
	const [modal, setModal] = useState<ModalState | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [searchQuery, setSearchQuery] = useState("");

	// ─── Open modals ────────────────────────────────────────────────────────────
	const openCreate = () => {
		setImagePreview(null);
		setModal({ ...defaultModal, kind: activeTab, mode: "create" });
	};

	const openEdit = (combo: AdminCombo) => {
		setImagePreview(combo.image || null);
		setModal({
			mode: "edit",
			kind: combo.type,
			id: combo._id,
			name: combo.name || "",
			description: combo.description || "",
			status: combo.status || "active",
			displayOrder: String(combo.displayOrder || 0),
			price: combo.price ? String(combo.price) : "",
			originalPrice: combo.originalPrice ? String(combo.originalPrice) : "",
			itemsCount: combo.itemsCount ? String(combo.itemsCount) : "",
			seoTags: (combo.seoTags || []).join(", "),
			allowComboTextCustomization: combo.allowComboTextCustomization || false,
			comboTextCustomizationTitle: combo.comboTextCustomizationTitle || "",
			allowComboImageCustomization: combo.allowComboImageCustomization || false,
			comboImageCustomizationTitle: combo.comboImageCustomizationTitle || "",
			comboMaxImageUploads: String(combo.comboMaxImageUploads || 1),
			pricingVariants: (combo.pricingVariants || []).map(pv => ({ label: pv.label, price: String(pv.price) })),
			products: (combo.products || []).map((p) => ({
				_id: p._id,
				title: p.title || "",
				description: p.description || "",
				imageFile: null,
				imagePreview: p.image || null,
				tags: (p.tags || []).join(", "),
				seoTags: (p.seoTags || []).join(", "),
				stock: p.stock != null ? String(p.stock) : "",
				allowTextCustomization: p.allowTextCustomization || false,
				textCustomizationTitle: p.textCustomizationTitle || "",
				allowImageCustomization: p.allowImageCustomization || false,
				imageCustomizationTitle: p.imageCustomizationTitle || "",
				maxImageUploads: String(p.maxImageUploads || 1),
				totalCharms: String(p.totalCharms || 0),
				perCharmPrice: String(p.perCharmPrice || 0),
				charmPiecePricing: (p.charmPiecePricing || []).map((cp: any) => ({ count: cp.count, price: cp.price })),
				chainOptions: (p.chainOptions || []).map((co: any) => ({
					value: co.value || "",
					label: co.label || "",
					sub: co.sub || "",
					price: co.price || 0,
					image: co.image || "",
					imagePreview: co.image || null,
					imageFile: null
				})),
				variants: (p.variants || []).map(v => {
					if (typeof v.options === "string") {
						return {
							name: v.name,
							options: v.options.split(",").map((opt: string) => ({
								name: opt.trim(), image: undefined, imagePreview: null, imageFile: null
							})).filter((opt: any) => opt.name)
						};
					} else if (Array.isArray(v.options)) {
						return {
							name: v.name,
							options: v.options.map((opt: any) => ({
								name: opt.name, image: opt.image, stock: opt.stock, imagePreview: opt.image || null, imageFile: null
							}))
						};
					}
					return { name: v.name, options: [] };
				}),
			})),
			imageFile: null,
			existingImage: combo.image,
			galleryItems: (combo.images || []).map((img, i) => ({
				id: `existing_${i}_${img}`,
				type: "existing" as const,
				url: img,
				previewUrl: img,
			})),
		});
	};

	const closeModal = () => {
		setModal(null);
		setImagePreview(null);
		if (fileInputRef.current) fileInputRef.current.value = "";
	};

	// ─── Helpers ────────────────────────────────────────────────────────────────
	const upModal = (patch: Partial<ModalState>) => setModal(prev => prev ? { ...prev, ...patch } : prev);
	const upProduct = (i: number, patch: Partial<ComboProductState>) =>
		setModal(prev => {
			if (!prev) return prev;
			const ps = [...prev.products];
			ps[i] = { ...ps[i], ...patch };
			return { ...prev, products: ps };
		});

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] || null;
		if (!modal) return;
		upModal({ imageFile: file });
		if (file) {
			const r = new FileReader();
			r.onload = () => setImagePreview(r.result as string);
			r.readAsDataURL(file);
		}
	};

	const handleGalleryFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		if (!files.length || !modal) return;
		const newItems = files.map((file, i) => ({
			id: `new_${Date.now()}_${i}_${Math.random()}`,
			type: "new" as const,
			file,
			previewUrl: URL.createObjectURL(file),
		}));
		upModal({ galleryItems: [...(modal.galleryItems || []), ...newItems] });
		e.target.value = "";
	};

	const removeGalleryItem = (idToRemove: string) => {
		if (!modal) return;
		upModal({
			galleryItems: (modal.galleryItems || []).filter(it => it.id !== idToRemove),
		});
	};

	const [dragIdx, setDragIdx] = useState<number | null>(null);
	const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

	const handleDragStart = (idx: number) => {
		setDragIdx(idx);
	};

	const handleDragOver = (e: React.DragEvent, idx: number) => {
		e.preventDefault();
		if (dragOverIdx !== idx) setDragOverIdx(idx);
	};

	const handleDrop = (idx: number) => {
		if (dragIdx === null || dragIdx === idx || !modal) {
			setDragIdx(null);
			setDragOverIdx(null);
			return;
		}
		const items = [...(modal.galleryItems || [])];
		const [dragged] = items.splice(dragIdx, 1);
		items.splice(idx, 0, dragged);
		upModal({ galleryItems: items });
		setDragIdx(null);
		setDragOverIdx(null);
	};

	const handleProductImageChange = (i: number, file: File | null) => {
		if (file) {
			const r = new FileReader();
			r.onload = () => upProduct(i, { imageFile: file, imagePreview: r.result as string });
			r.readAsDataURL(file);
		} else {
			upProduct(i, { imageFile: null, imagePreview: modal?.products[i]?.imagePreview || null });
		}
	};

	const handleOptionImageChange = (pIdx: number, vIdx: number, oIdx: number, file: File | null) => {
		setModal(prev => {
			if (!prev) return prev;
			const ps = [...prev.products];
			const vs = [...ps[pIdx].variants];
			const opts = [...vs[vIdx].options];
			if (file) {
				const r = new FileReader();
				r.onload = () => {
					opts[oIdx] = { ...opts[oIdx], imageFile: file, imagePreview: r.result as string };
					vs[vIdx] = { ...vs[vIdx], options: opts };
					ps[pIdx] = { ...ps[pIdx], variants: vs };
					setModal(p2 => p2 ? { ...p2, products: ps } : p2);
				};
				r.readAsDataURL(file);
			} else {
				opts[oIdx] = { ...opts[oIdx], imageFile: null, imagePreview: opts[oIdx].image || null };
				vs[vIdx] = { ...vs[vIdx], options: opts };
				ps[pIdx] = { ...ps[pIdx], variants: vs };
				return { ...prev, products: ps };
			}
			return prev;
		});
	};

	// ─── Build FormData ──────────────────────────────────────────────────────────
	const buildFormData = (): FormData => {
		if (!modal) return new FormData();
		const fd = new FormData();
		fd.append("name", modal.name.trim());
		if (modal.description) fd.append("description", modal.description.trim());
		fd.append("status", modal.status);
		fd.append("displayOrder", modal.displayOrder);
		fd.append("price", modal.price);
		fd.append("allowComboTextCustomization", String(modal.allowComboTextCustomization));
		fd.append("allowComboImageCustomization", String(modal.allowComboImageCustomization));
		if (modal.comboTextCustomizationTitle) fd.append("comboTextCustomizationTitle", modal.comboTextCustomizationTitle);
		if (modal.comboImageCustomizationTitle) fd.append("comboImageCustomizationTitle", modal.comboImageCustomizationTitle);
		fd.append("comboMaxImageUploads", modal.comboMaxImageUploads || "1");

		// SEO tags array
		const seoTagsArr = modal.seoTags.split(",").map(t => t.trim()).filter(Boolean);
		fd.append("seoTags", JSON.stringify(seoTagsArr));

		// Pricing variants
		const pricingVarsForApi = modal.pricingVariants
			.filter(pv => pv.label.trim() && pv.price)
			.map(pv => ({ label: pv.label.trim(), price: Number(pv.price) }));
		fd.append("pricingVariants", JSON.stringify(pricingVarsForApi));

		// Products JSON (strip File objects, keep existing image URLs)
		const productsData = modal.products.map((p) => ({
			_id: p._id,
			title: p.title,
			description: p.description,
			image: p.imagePreview && !p.imageFile ? p.imagePreview : undefined,
			tags: p.tags.split(",").map(t => t.trim()).filter(Boolean),
			seoTags: p.seoTags.split(",").map(t => t.trim()).filter(Boolean),
			stock: p.stock !== "" ? Number(p.stock) : null,
			allowTextCustomization: p.allowTextCustomization,
			textCustomizationTitle: p.textCustomizationTitle,
			allowImageCustomization: p.allowImageCustomization,
			imageCustomizationTitle: p.imageCustomizationTitle,
			maxImageUploads: Number(p.maxImageUploads) || 1,
			totalCharms: Number(p.totalCharms) || 0,
			perCharmPrice: Number(p.perCharmPrice) || 0,
			charmPiecePricing: p.charmPiecePricing,
			chainOptions: p.chainOptions.map(co => ({
				value: co.value,
				label: co.label,
				sub: co.sub,
				price: co.price,
				image: !co.imageFile ? co.image : undefined,
			})),
			variants: p.variants.map(v => ({
				name: v.name,
				options: v.options.map(opt => ({
					name: opt.name,
					stock: opt.stock,
					image: !opt.imageFile ? opt.image : undefined,
				})),
			})),
		}));
		fd.append("products", JSON.stringify(productsData));

		// Binary files
		modal.products.forEach((p, pIdx) => {
			if (p.imageFile) fd.append(`productImage_${pIdx}`, p.imageFile);
			p.variants.forEach((v, vIdx) => {
				v.options.forEach((opt, oIdx) => {
					if (opt.imageFile) fd.append(`variantImage_${pIdx}_${vIdx}_${oIdx}`, opt.imageFile);
				});
			});
			p.chainOptions.forEach((co, cIdx) => {
				if (co.imageFile) fd.append(`chainImage_${pIdx}_${cIdx}`, co.imageFile);
			});
		});

		if (modal.kind === "curated") {
			if (modal.originalPrice) fd.append("originalPrice", modal.originalPrice);
		} else {
			fd.append("itemsCount", modal.itemsCount);
		}

		if (modal.imageFile) fd.append("image", modal.imageFile);

		// Gallery images and drag-and-drop order
		let newFileIdx = 0;
		const orderSpec: Array<{ type: "existing" | "new"; url?: string; index?: number }> = [];
		(modal.galleryItems || []).forEach(item => {
			if (item.type === "existing" && item.url) {
				orderSpec.push({ type: "existing", url: item.url });
				fd.append("existingImages", item.url);
			} else if (item.type === "new" && item.file) {
				const idx = newFileIdx++;
				orderSpec.push({ type: "new", index: idx });
				fd.append("images", item.file);
			}
		});
		fd.append("galleryOrder", JSON.stringify(orderSpec));

		return fd;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!modal || !modal.name.trim()) return;
		const fd = buildFormData();
		if (modal.mode === "create") {
			modal.kind === "curated" ? onCreateCuratedCombo(fd) : onCreateCustomCombo(fd);
		} else {
			onEditCombo(modal.id!, fd);
		}
		closeModal();
	};

	const confirmDelete = (id: string) => {
		if (!window.confirm(`Delete this combo?`)) return;
		onDeleteCombo(id);
	};

	const visibleCombos = React.useMemo(() => {
		return safeCombos.filter((c) => {
			if (c.type !== activeTab) return false;
			const q = searchQuery.toLowerCase();
			return !q || c.name.toLowerCase().includes(q);
		});
	}, [safeCombos, activeTab, searchQuery]);

	// ─── Product management ──────────────────────────────────────────────────────
	const addProduct = () => upModal({ products: [...(modal?.products || []), { ...defaultProduct }] });
	const removeProduct = (i: number) => {
		const ps = [...(modal?.products || [])];
		ps.splice(i, 1);
		upModal({ products: ps });
	};
	const addVariant = (pIdx: number) => {
		setModal(prev => {
			if (!prev) return prev;
			const ps = [...prev.products];
			ps[pIdx] = { ...ps[pIdx], variants: [...ps[pIdx].variants, { name: "", options: [] }] };
			return { ...prev, products: ps };
		});
	};
	const removeVariant = (pIdx: number, vIdx: number) => {
		setModal(prev => {
			if (!prev) return prev;
			const ps = [...prev.products];
			const vs = [...ps[pIdx].variants];
			vs.splice(vIdx, 1);
			ps[pIdx] = { ...ps[pIdx], variants: vs };
			return { ...prev, products: ps };
		});
	};
	const updateVariantName = (pIdx: number, vIdx: number, val: string) => {
		setModal(prev => {
			if (!prev) return prev;
			const ps = [...prev.products];
			const vs = [...ps[pIdx].variants];
			vs[vIdx] = { ...vs[vIdx], name: val };
			ps[pIdx] = { ...ps[pIdx], variants: vs };
			return { ...prev, products: ps };
		});
	};
	const addOption = (pIdx: number, vIdx: number) => {
		setModal(prev => {
			if (!prev) return prev;
			const ps = [...prev.products];
			const vs = [...ps[pIdx].variants];
			vs[vIdx] = { ...vs[vIdx], options: [...vs[vIdx].options, { name: "", stock: undefined }] };
			ps[pIdx] = { ...ps[pIdx], variants: vs };
			return { ...prev, products: ps };
		});
	};
	const removeOption = (pIdx: number, vIdx: number, oIdx: number) => {
		setModal(prev => {
			if (!prev) return prev;
			const ps = [...prev.products];
			const vs = [...ps[pIdx].variants];
			const opts = [...vs[vIdx].options];
			opts.splice(oIdx, 1);
			vs[vIdx] = { ...vs[vIdx], options: opts };
			ps[pIdx] = { ...ps[pIdx], variants: vs };
			return { ...prev, products: ps };
		});
	};
	const updateOption = (pIdx: number, vIdx: number, oIdx: number, key: "name" | "stock", val: string | number) => {
		setModal(prev => {
			if (!prev) return prev;
			const ps = [...prev.products];
			const vs = [...ps[pIdx].variants];
			const opts = [...vs[vIdx].options];
			opts[oIdx] = { ...opts[oIdx], [key]: val };
			vs[vIdx] = { ...vs[vIdx], options: opts };
			ps[pIdx] = { ...ps[pIdx], variants: vs };
			return { ...prev, products: ps };
		});
	};

	// ─── Pricing Variants ────────────────────────────────────────────────────────
	const addPricingVariant = () => upModal({ pricingVariants: [...(modal?.pricingVariants || []), { label: "", price: "" }] });
	const removePricingVariant = (i: number) => {
		const pvs = [...(modal?.pricingVariants || [])];
		pvs.splice(i, 1);
		upModal({ pricingVariants: pvs });
	};
	const updatePricingVariant = (i: number, key: "label" | "price", val: string) => {
		setModal(prev => {
			if (!prev) return prev;
			const pvs = [...prev.pricingVariants];
			pvs[i] = { ...pvs[i], [key]: val };
			return { ...prev, pricingVariants: pvs };
		});
	};

	// ─── Render ──────────────────────────────────────────────────────────────────
	const modalTitle = modal ? `${modal.mode === "create" ? "Add" : "Edit"} ${modal.kind === "curated" ? "Curated" : "Custom"} Combo` : "";

	const S = {
		section: { background: "#f9f9f5", border: "1px solid #e0e2cc", borderRadius: 8, padding: "1rem", display: "flex", flexDirection: "column" as const, gap: "0.75rem" },
		sectionHead: { fontSize: "0.88rem", fontWeight: 700, color: "#4a5c22", margin: 0, paddingBottom: "0.5rem", borderBottom: "1px solid #e8ead0" },
		grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" },
		chip: (active: boolean): React.CSSProperties => ({ display: "inline-flex", padding: "0.18rem 0.55rem", borderRadius: 100, fontSize: "0.75rem", fontWeight: 600, background: active ? "#d4f5dc" : "#fde8e8", color: active ? "#1a7a35" : "#943b2a" }),
	};

	return (
		<section className="admin-content">
			{/* Tab bar */}
			<div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", borderBottom: "2px solid #e8ead0", paddingBottom: "0.5rem", flexWrap: "wrap" }}>
				{(["curated", "custom"] as TabKey[]).map(t => (
					<button key={t} onClick={() => setActiveTab(t)} style={{ padding: "0.5rem 1.2rem", borderRadius: "6px 6px 0 0", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem", transition: "all 0.18s", background: activeTab === t ? "#4a5c22" : "transparent", color: activeTab === t ? "#fff" : "#6b6b60" }}>
						{t === "curated" ? "Curated Combos" : "Custom Combos"}
					</button>
				))}
				<div style={{ flex: 1 }} />
				<button className="admin-btn" style={{ alignSelf: "flex-start" }} onClick={openCreate}>
					+ Add {activeTab === "curated" ? "Curated" : "Custom"} Combo
				</button>
			</div>

			<div className="admin-panel" style={{ padding: 0, overflow: "hidden" }}>
				{/* Table */}
				<div>
					<div className="admin-controls">
						<input type="text" className="admin-search" placeholder="Search combos by name..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
					</div>
					<div className="admin-table-wrap">
						<table className="admin-table">
							<thead>
								<tr>
									<th style={{ width: 64 }}>Image</th>
									<th>Name</th>
									<th>Description</th>
									<th>Status</th>
									<th>Price</th>
									<th style={{ width: 120 }}>Actions</th>
								</tr>
							</thead>
							<tbody>
								{visibleCombos.length === 0 && (
									<tr><td colSpan={6} style={{ textAlign: "center", color: "#888", padding: "2rem" }}>No combos yet</td></tr>
								)}
								{visibleCombos.map(c => (
									<tr key={c._id}>
										<td>
											{c.image
												? <img src={c.image} alt={c.name} style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 6, border: "1px solid #e5e5e0" }} />
												: <span style={{ width: 48, height: 48, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#f5f4ef", borderRadius: 6, color: "#aaa", fontSize: 20 }}>🎁</span>
											}
										</td>
										<td style={{ fontWeight: 600 }}>{c.name}</td>
										<td style={{ color: "#666", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.description || "—"}</td>
										<td><span style={S.chip(c.status === "active")}>{c.status === "active" ? "Active" : "Inactive"}</span></td>
										<td style={{ color: "#666" }}>₹{c.price || 0}</td>
										<td>
											<div className="admin-inline-actions">
												<button className="admin-btn" style={{ padding: "0.3rem 0.7rem", fontSize: "0.8rem" }} onClick={() => openEdit(c)}>Edit</button>
												<button className="admin-btn admin-btn-danger" style={{ padding: "0.3rem 0.7rem", fontSize: "0.8rem" }} onClick={() => confirmDelete(c._id)}>Delete</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>

			{/* ─── Modal ─────────────────────────────────────────────────────────── */}
			{modal && (
				<div className="admin-modal-backdrop" onClick={closeModal} style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "2rem 1rem", zIndex: 9999 }}>
					<div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 960, width: "100%", maxHeight: "92vh", display: "flex", flexDirection: "column", padding: 0, overflow: "hidden", borderRadius: 12 }}>
						
						{/* Header */}
						<div style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid #e8ead0", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", flexShrink: 0 }}>
							<h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#1a1f0f" }}>{modalTitle}</h3>
							<button type="button" onClick={closeModal} style={{ background: "none", border: "1px solid #d4d4c8", borderRadius: 6, cursor: "pointer", padding: "0.3rem 0.8rem", color: "#666" }}>Close</button>
						</div>

						{/* Body */}
						<div style={{ padding: "1.25rem 1.5rem", overflowY: "auto", flex: 1 }}>
							<form id="combo-form" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

								{/* ── Section 1: Combo Details ── */}
								<div style={S.section}>
									<p style={S.sectionHead}>Combo Details</p>

									<div style={FIELD}>
										<label style={LABEL}>Name *</label>
										<input required placeholder="Enter combo name..." value={modal.name} onChange={e => upModal({ name: e.target.value })} style={INP} />
									</div>

									<div style={FIELD}>
										<label style={LABEL}>Description</label>
										<textarea placeholder="Describe this combo..." value={modal.description} onChange={e => upModal({ description: e.target.value })} rows={4} style={{ ...INP, resize: "vertical" }} autoComplete="off" autoCorrect="off" spellCheck="false" />
									</div>

									<div style={S.grid2}>
										<div style={FIELD}>
											<label style={LABEL}>Status</label>
											<select value={modal.status} onChange={e => upModal({ status: e.target.value as any })} style={INP}>
												<option value="active">Active</option>
												<option value="inactive">Inactive</option>
											</select>
										</div>
										<div style={FIELD}>
											<label style={LABEL}>Display Order</label>
											<input type="number" value={modal.displayOrder} onChange={e => upModal({ displayOrder: e.target.value })} style={INP} />
										</div>
									</div>

									<div style={S.grid2}>
										<div style={FIELD}>
											<label style={LABEL}>Fixed Price (₹) *</label>
											<input required type="number" placeholder="Combo price..." value={modal.price} onChange={e => upModal({ price: e.target.value })} style={INP} />
										</div>
										{modal.kind === "curated" && (
											<div style={FIELD}>
												<label style={LABEL}>Original Price (₹)</label>
												<input type="number" placeholder="Before discount..." value={modal.originalPrice} onChange={e => upModal({ originalPrice: e.target.value })} style={INP} />
											</div>
										)}
										{modal.kind === "custom" && (
											<div style={FIELD}>
												<label style={LABEL}>Number of Items *</label>
												<input required type="number" placeholder="e.g. 3" value={modal.itemsCount} onChange={e => upModal({ itemsCount: e.target.value })} style={INP} />
											</div>
										)}
									</div>

									<div style={FIELD}>
										<label style={LABEL}>SEO Tags <span style={{ fontWeight: 400, color: "#999" }}>(comma-separated)</span></label>
										<input placeholder="e.g. gift hamper, birthday combo, luxury set" value={modal.seoTags} onChange={e => upModal({ seoTags: e.target.value })} style={INP} />
									</div>

									<div style={FIELD}>
										<label style={LABEL}>Main Combo Image</label>
										{imagePreview && (
											<div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "0.4rem" }}>
												<img src={imagePreview} alt="Preview" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: "1px solid #d4d4c8" }} />
												<span style={{ fontSize: "0.8rem", color: "#666" }}>{modal.imageFile ? modal.imageFile.name : "Current image"}</span>
											</div>
										)}
										<input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={handleFileChange} style={{ padding: "0.4rem", border: "1px solid #d4d4c8", borderRadius: 6, fontSize: "0.85rem" }} />
									</div>

									<div style={FIELD}>
										<label style={LABEL}>
											Gallery Images <span style={{ fontWeight: 400, color: "#666" }}>(Drag & Drop items to arrange display order)</span>
										</label>
										{(modal.galleryItems || []).length > 0 && (
											<div
												style={{
													display: "flex",
													flexWrap: "wrap",
													gap: "0.6rem",
													marginBottom: "0.6rem",
													padding: "0.6rem",
													background: "#f5f4ef",
													borderRadius: 8,
													border: "1px solid #d4d4c8",
												}}
											>
												{(modal.galleryItems || []).map((item, idx) => (
													<div
														key={item.id}
														draggable
														onDragStart={() => handleDragStart(idx)}
														onDragOver={(e) => handleDragOver(e, idx)}
														onDrop={() => handleDrop(idx)}
														style={{
															display: "flex",
															flexDirection: "column",
															alignItems: "center",
															background: "#fff",
															border: dragOverIdx === idx ? "2px dashed #943b2a" : "1px solid #d4d4c8",
															borderRadius: 8,
															padding: "0.4rem",
															position: "relative",
															cursor: "grab",
															width: 90,
															boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
															transition: "all 0.15s ease",
														}}
													>
														<span
															style={{
																position: "absolute",
																top: 4,
																left: 4,
																background: "#3d4a20",
																color: "#fff",
																fontSize: "0.65rem",
																fontWeight: 700,
																padding: "1px 5px",
																borderRadius: 4,
																zIndex: 2,
															}}
														>
															#{idx + 1}
														</span>
														<button
															type="button"
															onClick={() => removeGalleryItem(item.id)}
															style={{
																position: "absolute",
																top: 4,
																right: 4,
																background: "#d9534f",
																color: "#fff",
																border: "none",
																borderRadius: "50%",
																width: 18,
																height: 18,
																fontSize: "0.75rem",
																fontWeight: 700,
																cursor: "pointer",
																display: "flex",
																alignItems: "center",
																justifyContent: "center",
																zIndex: 2,
																padding: 0,
															}}
														>
															×
														</button>
														<img
															src={item.previewUrl}
															alt={`Gallery ${idx + 1}`}
															style={{
																width: 80,
																height: 64,
																objectFit: "cover",
																borderRadius: 6,
																marginBottom: "0.3rem",
															}}
														/>
														<span
															style={{
																fontSize: "0.68rem",
																color: "#555",
																width: "100%",
																overflow: "hidden",
																textOverflow: "ellipsis",
																whiteSpace: "nowrap",
																textAlign: "center",
															}}
														>
															{item.type === "new" && item.file ? item.file.name : "Saved image"}
														</span>
													</div>
												))}
											</div>
										)}
										<input
											type="file"
											multiple
											accept="image/jpeg,image/png,image/webp,image/avif"
											onChange={handleGalleryFilesChange}
											style={{ padding: "0.4rem", border: "1px solid #d4d4c8", borderRadius: 6, fontSize: "0.85rem" }}
										/>
									</div>
								</div>

								{/* ── Section 2: Combo-level Customisation ── */}
								<div style={S.section}>
									<p style={S.sectionHead}>Box Customisation (Combo-level)</p>
									<div style={S.grid2}>
										<div>
											<label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20", cursor: "pointer" }}>
												<input type="checkbox" checked={modal.allowComboTextCustomization} onChange={e => upModal({ allowComboTextCustomization: e.target.checked })} />
												Allow Text Message on Box
											</label>
											{modal.allowComboTextCustomization && (
												<div style={{ marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
													<label style={LABEL}>Prompt / Title <span style={{ fontWeight: 400, color: "#999" }}>(shown to customer)</span></label>
													<input placeholder="e.g. Write a message for the box" value={modal.comboTextCustomizationTitle} onChange={e => upModal({ comboTextCustomizationTitle: e.target.value })} style={INP} />
												</div>
											)}
										</div>
										<div>
											<label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20", cursor: "pointer" }}>
												<input type="checkbox" checked={modal.allowComboImageCustomization} onChange={e => upModal({ allowComboImageCustomization: e.target.checked })} />
												Allow Photo Upload on Box
											</label>
											{modal.allowComboImageCustomization && (
												<div style={{ marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
													<label style={LABEL}>Prompt / Title</label>
													<input placeholder="e.g. Upload a photo for the box" value={modal.comboImageCustomizationTitle} onChange={e => upModal({ comboImageCustomizationTitle: e.target.value })} style={INP} />
													<label style={LABEL}>Max Photos Allowed</label>
													<input type="number" min="1" max="10" value={modal.comboMaxImageUploads} onChange={e => upModal({ comboMaxImageUploads: e.target.value })} style={INP} />
												</div>
											)}
										</div>
									</div>
								</div>

								{/* ── Section 3: Pricing Variants ── */}
								<div style={S.section}>
									<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
										<p style={S.sectionHead}>Pricing Variants <span style={{ fontWeight: 400, color: "#999", fontSize: "0.78rem" }}>(optional — e.g. With Box, Without Box)</span></p>
										<button type="button" className="admin-btn" onClick={addPricingVariant} style={{ padding: "0.25rem 0.7rem", fontSize: "0.78rem" }}>+ Add Tier</button>
									</div>
									{modal.pricingVariants.length === 0
										? <p style={{ color: "#aaa", fontSize: "0.82rem", margin: 0 }}>No pricing tiers added. Customers will see the main price only.</p>
										: (
											<div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
												{modal.pricingVariants.map((pv, i) => (
													<div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 120px auto", gap: "0.5rem", alignItems: "center" }}>
														<input placeholder="Label (e.g. With Chocolate Box)" value={pv.label} onChange={e => updatePricingVariant(i, "label", e.target.value)} style={INP} />
														<input type="number" placeholder="Price (₹)" value={pv.price} onChange={e => updatePricingVariant(i, "price", e.target.value)} style={INP} />
														<button type="button" onClick={() => removePricingVariant(i)} style={{ background: "none", border: "none", color: "#d9534f", cursor: "pointer", fontWeight: 700, fontSize: "1.1rem", padding: "0 0.4rem" }}>×</button>
													</div>
												))}
											</div>
										)
									}
								</div>

								{/* ── Section 4: Products ── */}
								<div style={S.section}>
									<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
										<p style={S.sectionHead}>Products in Combo</p>
										<button type="button" onClick={addProduct} className="admin-btn" style={{ padding: "0.25rem 0.7rem", fontSize: "0.78rem" }}>+ Add Product</button>
									</div>

									{modal.products.length === 0
										? <div style={{ padding: "1.5rem", textAlign: "center", color: "#888", border: "1px dashed #d4d4c8", borderRadius: 8 }}>No products added yet.</div>
										: (
											<div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
												{modal.products.map((p, pIdx) => (
													<div key={pIdx} style={{ border: "1px solid #d4d4c8", borderRadius: 8, padding: "1rem", background: "#fff", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
														{/* Product header */}
														<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
															<h5 style={{ margin: 0, fontSize: "0.92rem", fontWeight: 700, color: "#1a1f0f" }}>Product #{pIdx + 1}</h5>
															<button type="button" onClick={() => removeProduct(pIdx)} style={{ background: "none", border: "none", color: "#d9534f", cursor: "pointer", fontSize: "0.82rem", fontWeight: 600 }}>Remove</button>
														</div>

														<div style={S.grid2}>
															<div style={FIELD}>
																<label style={LABEL}>Product Title *</label>
																<input required placeholder="e.g. Elegant Perfume" value={p.title} onChange={e => upProduct(pIdx, { title: e.target.value })} style={INP} />
															</div>
															<div style={FIELD}>
																<label style={LABEL}>Stock <span style={{ fontWeight: 400, color: "#999" }}>(optional)</span></label>
																<input type="number" min="0" placeholder="e.g. 50" value={p.stock} onChange={e => upProduct(pIdx, { stock: e.target.value })} style={INP} />
															</div>
														</div>

														<div style={FIELD}>
															<label style={LABEL}>Description</label>
															<textarea placeholder="Short description..." value={p.description} onChange={e => upProduct(pIdx, { description: e.target.value })} style={{ ...INP, resize: "vertical" }} autoComplete="off" autoCorrect="off" spellCheck="false" rows={2} />
														</div>

														<div style={S.grid2}>
															<div style={FIELD}>
																<label style={LABEL}>Tags <span style={{ fontWeight: 400, color: "#999" }}>(comma-separated)</span></label>
																<input placeholder="e.g. Best Seller, New, Featured" value={p.tags} onChange={e => upProduct(pIdx, { tags: e.target.value })} style={INP} />
																{p.tags && (
																	<div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", marginTop: "0.2rem" }}>
																		{p.tags.split(",").map(t => t.trim()).filter(Boolean).map(tag => (
																			<span key={tag} style={{ background: "#e8ead0", color: "#4a5c22", borderRadius: 100, padding: "0.1rem 0.5rem", fontSize: "0.72rem", fontWeight: 600 }}>{tag}</span>
																		))}
																	</div>
																)}
															</div>
															<div style={FIELD}>
																<label style={LABEL}>SEO Tags <span style={{ fontWeight: 400, color: "#999" }}>(comma-separated)</span></label>
																<input placeholder="e.g. perfume gift, luxury fragrance" value={p.seoTags} onChange={e => upProduct(pIdx, { seoTags: e.target.value })} style={INP} />
															</div>
														</div>

														<div style={{ background: "#f5f4ef", border: "1px solid #e5e5e0", borderRadius: 6, padding: "1rem" }}>
															<p style={{ margin: "0 0 1rem 0", fontSize: "0.85rem", fontWeight: 700, color: "#3d4a20" }}>Product Charms (Optional)</p>
															<div style={S.grid2}>
																<div style={FIELD}>
																	<label style={LABEL}>Total Charms Allowed</label>
																	<input type="number" min="0" value={p.totalCharms} onChange={e => upProduct(pIdx, { totalCharms: e.target.value })} style={INP} />
																</div>
																<div style={FIELD}>
																	<label style={LABEL}>Base Per Charm Price (₹)</label>
																	<input type="number" min="0" value={p.perCharmPrice} onChange={e => upProduct(pIdx, { perCharmPrice: e.target.value })} style={INP} />
																</div>
															</div>

															<div style={{ marginTop: "1rem" }}>
																<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
																	<label style={LABEL}>Tiered Charm Pricing</label>
																	<button type="button" onClick={() => {
																		const cp = [...p.charmPiecePricing, { count: 0, price: 0 }];
																		upProduct(pIdx, { charmPiecePricing: cp });
																	}} style={{ background: "none", border: "none", color: "#1a7a35", fontWeight: 600, fontSize: "0.75rem", cursor: "pointer" }}>+ Add Tier</button>
																</div>
																{p.charmPiecePricing.length === 0 ? <p style={{ margin: 0, fontSize: "0.8rem", color: "#aaa" }}>No tiered pricing added.</p> : (
																	<div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
																		{p.charmPiecePricing.map((cp, cpIdx) => (
																			<div key={cpIdx} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "0.5rem", alignItems: "center" }}>
																				<input type="number" placeholder="Count (e.g. 3)" value={cp.count || ""} onChange={e => {
																					const ncp = [...p.charmPiecePricing];
																					ncp[cpIdx] = { ...ncp[cpIdx], count: Number(e.target.value) };
																					upProduct(pIdx, { charmPiecePricing: ncp });
																				}} style={INP} />
																				<input type="number" placeholder="Total Price (e.g. 150)" value={cp.price || ""} onChange={e => {
																					const ncp = [...p.charmPiecePricing];
																					ncp[cpIdx] = { ...ncp[cpIdx], price: Number(e.target.value) };
																					upProduct(pIdx, { charmPiecePricing: ncp });
																				}} style={INP} />
																				<button type="button" onClick={() => {
																					const ncp = [...p.charmPiecePricing];
																					ncp.splice(cpIdx, 1);
																					upProduct(pIdx, { charmPiecePricing: ncp });
																				}} style={{ background: "none", border: "none", color: "#d9534f", cursor: "pointer", fontWeight: 700, padding: "0 0.2rem" }}>×</button>
																			</div>
																		))}
																	</div>
																)}
															</div>

															<div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px dashed #d4d4c8" }}>
																<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
																	<label style={LABEL}>Chain Options</label>
																	<button type="button" onClick={() => {
																		const co = [...p.chainOptions, { value: `chain_${Date.now()}`, label: "", sub: "", price: 0, image: "", imagePreview: null, imageFile: null }];
																		upProduct(pIdx, { chainOptions: co });
																	}} style={{ background: "none", border: "none", color: "#1a7a35", fontWeight: 600, fontSize: "0.75rem", cursor: "pointer" }}>+ Add Chain Option</button>
																</div>
																{p.chainOptions.length === 0 ? <p style={{ margin: 0, fontSize: "0.8rem", color: "#aaa" }}>No chain options added.</p> : (
																	<div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
																		{p.chainOptions.map((co, coIdx) => (
																			<div key={coIdx} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: "0.8rem", alignItems: "center", background: "#fdfdf9", padding: "0.6rem", border: "1px solid #e8ead0", borderRadius: 6 }}>
																				<div style={{ width: 44, height: 44, borderRadius: 6, border: "1px solid #d4d4c8", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "#eee", cursor: "pointer", position: "relative" }}>
																					{co.imagePreview ? <img src={co.imagePreview} alt="Chain" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: "0.7rem", color: "#888" }}>IMG</span>}
																					<input type="file" accept="image/*" onChange={e => {
																						const file = e.target.files?.[0];
																						if (!file) return;
																						const nco = [...p.chainOptions];
																						nco[coIdx] = { ...nco[coIdx], imageFile: file, imagePreview: URL.createObjectURL(file) };
																						upProduct(pIdx, { chainOptions: nco });
																					}} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
																				</div>
																				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
																					<input type="text" placeholder="Name (e.g. Box Chain)" value={co.label} onChange={e => {
																						const nco = [...p.chainOptions];
																						nco[coIdx] = { ...nco[coIdx], label: e.target.value, value: e.target.value.toLowerCase().replace(/\s+/g, "_") };
																						upProduct(pIdx, { chainOptions: nco });
																					}} style={INP} />
																					<input type="number" placeholder="Price (e.g. 199)" value={co.price || ""} onChange={e => {
																						const nco = [...p.chainOptions];
																						nco[coIdx] = { ...nco[coIdx], price: Number(e.target.value) };
																						upProduct(pIdx, { chainOptions: nco });
																					}} style={INP} />
																					<input type="text" placeholder="Description (e.g. Classic square-link)" value={co.sub} onChange={e => {
																						const nco = [...p.chainOptions];
																						nco[coIdx] = { ...nco[coIdx], sub: e.target.value };
																						upProduct(pIdx, { chainOptions: nco });
																					}} style={{ ...INP, gridColumn: "1 / -1" }} />
																				</div>
																				<button type="button" onClick={() => {
																					const nco = [...p.chainOptions];
																					nco.splice(coIdx, 1);
																					upProduct(pIdx, { chainOptions: nco });
																				}} style={{ background: "none", border: "none", color: "#d9534f", cursor: "pointer", fontWeight: 700, padding: "0 0.4rem" }}>✕</button>
																			</div>
																		))}
																	</div>
																)}
															</div>
														</div>

														{/* Customisation toggles */}
														<div style={{ background: "#f9f9f5", border: "1px solid #e8ead0", borderRadius: 6, padding: "0.8rem", display: "flex", flexDirection: "column", gap: "0.7rem" }}>
															<p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 700, color: "#666" }}>Product Customisation</p>
															<div style={S.grid2}>
																<div>
																	<label style={{ display: "flex", alignItems: "center", gap: "0.45rem", fontSize: "0.82rem", fontWeight: 600, color: "#3d4a20", cursor: "pointer" }}>
																		<input type="checkbox" checked={p.allowTextCustomization} onChange={e => upProduct(pIdx, { allowTextCustomization: e.target.checked })} />
																		Allow Text Message
																	</label>
																	{p.allowTextCustomization && (
																		<div style={{ marginTop: "0.4rem", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
																			<label style={LABEL}>Prompt Title</label>
																			<input placeholder="e.g. Write your message" value={p.textCustomizationTitle} onChange={e => upProduct(pIdx, { textCustomizationTitle: e.target.value })} style={INP} />
																		</div>
																	)}
																</div>
																<div>
																	<label style={{ display: "flex", alignItems: "center", gap: "0.45rem", fontSize: "0.82rem", fontWeight: 600, color: "#3d4a20", cursor: "pointer" }}>
																		<input type="checkbox" checked={p.allowImageCustomization} onChange={e => upProduct(pIdx, { allowImageCustomization: e.target.checked })} />
																		Allow Photo Upload
																	</label>
																	{p.allowImageCustomization && (
																		<div style={{ marginTop: "0.4rem", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
																			<label style={LABEL}>Prompt Title</label>
																			<input placeholder="e.g. Upload a photo" value={p.imageCustomizationTitle} onChange={e => upProduct(pIdx, { imageCustomizationTitle: e.target.value })} style={INP} />
																			<label style={LABEL}>Max Photos Allowed</label>
																			<input type="number" min="1" max="10" value={p.maxImageUploads} onChange={e => upProduct(pIdx, { maxImageUploads: e.target.value })} style={INP} />
																		</div>
																	)}
																</div>
															</div>
														</div>

														{/* Variants */}
														<div>
															<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
																<label style={{ ...LABEL, margin: 0 }}>Variants <span style={{ fontWeight: 400, color: "#999" }}>(optional)</span></label>
																<button type="button" onClick={() => addVariant(pIdx)} style={{ background: "none", border: "none", color: "#4a5c22", cursor: "pointer", fontSize: "0.78rem", fontWeight: 700 }}>+ Add Variant</button>
															</div>
															{p.variants.map((v, vIdx) => (
																<div key={vIdx} style={{ border: "1px solid #e8ead0", borderRadius: 6, padding: "0.7rem", marginBottom: "0.5rem", background: "#fafaf7" }}>
																	<div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.5rem" }}>
																		<input required placeholder="Variant Name (e.g. Color, Size)" value={v.name} onChange={e => updateVariantName(pIdx, vIdx, e.target.value)} style={{ ...INP, flex: 1 }} />
																		<button type="button" onClick={() => removeVariant(pIdx, vIdx)} style={{ background: "none", border: "none", color: "#d9534f", cursor: "pointer", fontSize: "0.8rem", fontWeight: 700, whiteSpace: "nowrap" }}>Remove</button>
																	</div>
																	<div style={{ paddingLeft: "0.75rem", borderLeft: "2px solid #e8ead0" }}>
																		{v.options.map((opt, oIdx) => (
																			<div key={oIdx} style={{ display: "flex", gap: "0.4rem", alignItems: "center", marginBottom: "0.4rem", flexWrap: "wrap" }}>
																				<input required placeholder="Option (e.g. Red)" value={opt.name} onChange={e => updateOption(pIdx, vIdx, oIdx, "name", e.target.value)} style={{ ...INP, width: "auto", flex: 1, minWidth: 80 }} />
																<input type="number" placeholder="Stock (e.g. 10)" value={opt.stock !== undefined ? opt.stock : ""} onChange={e => updateOption(pIdx, vIdx, oIdx, "stock", parseInt(e.target.value))} style={{ ...INP, width: "auto", flex: 1, minWidth: 80 }} />
																				{opt.imagePreview && <img src={opt.imagePreview} alt="" style={{ width: 28, height: 28, objectFit: "cover", borderRadius: 4, border: "1px solid #d4d4c8", flexShrink: 0 }} />}
																				<input type="file" accept="image/*" onChange={e => handleOptionImageChange(pIdx, vIdx, oIdx, e.target.files?.[0] || null)} style={{ fontSize: "0.72rem", width: 140, flexShrink: 0 }} />
																				<button type="button" onClick={() => removeOption(pIdx, vIdx, oIdx)} style={{ background: "none", border: "none", color: "#d9534f", cursor: "pointer", fontSize: "1rem", fontWeight: 700, padding: "0 0.3rem" }}>×</button>
																			</div>
																		))}
																		<button type="button" onClick={() => addOption(pIdx, vIdx)} style={{ background: "none", border: "none", color: "#4a5c22", cursor: "pointer", fontSize: "0.75rem", fontWeight: 700, marginTop: "0.2rem" }}>+ Add Option</button>
																	</div>
																</div>
															))}
														</div>
													</div>
												))}
											</div>
										)
									}
								</div>

							</form>
						</div>

						{/* Footer */}
						<div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #e8ead0", display: "flex", justifyContent: "flex-end", gap: "0.6rem", background: "#fff", flexShrink: 0 }}>
							<button type="button" onClick={closeModal} style={{ padding: "0.6rem 1.2rem", border: "1px solid #d4d4c8", borderRadius: 6, cursor: "pointer", background: "#fff", color: "#444", fontSize: "0.9rem" }}>Cancel</button>
							<button type="submit" form="combo-form" className="admin-btn" style={{ padding: "0.6rem 1.4rem" }}>
								{modal.mode === "create" ? "Create Combo" : "Save Changes"}
							</button>
						</div>
					</div>
				</div>
			)}
		</section>
	);
}
