"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/api";
import AdminOpenSectionTab, { type OpenSectionForm } from "./AdminOpenSectionTab";

type Gender = "women" | "men" | "kids";
type SectionKey = "open-section" | "popular" | "gifts" | "new-arrivals" | "deals";
type CollectionType = "auto" | "manual" | "category" | "subcategory" | "style";

type AdminProduct = { _id: string; title: string; price?: number; mainImage?: string; images?: string[] };
type NamedItem = { _id: string; name?: string };

type ShelfFormState = {
	eyebrow: string;
	title: string;
	isActive: boolean;
	collectionType: CollectionType;
	collectionId: string;
	products: string[];
};

const SECTIONS: Array<{ key: SectionKey; label: string; supportsAuto: boolean }> = [
	{ key: "open-section", label: "Trending", supportsAuto: false },
	{ key: "popular", label: "Customer Favourites", supportsAuto: true },
	{ key: "gifts", label: "Gifts & Charm Picks", supportsAuto: true },
	{ key: "new-arrivals", label: "New Arrivals", supportsAuto: false },
	{ key: "deals", label: "Top Deals", supportsAuto: true },
];

type Props = {
	products: AdminProduct[];
	categories: NamedItem[];
	subcategories: NamedItem[];
	styles: NamedItem[];
	openSectionForm: OpenSectionForm;
	openSectionSaving: boolean;
	selectedGender: Gender;
	onGenderChange: (g: Gender) => void;
	onOpenSectionChange: (f: OpenSectionForm) => void;
	onOpenSectionSubmit: () => void;
	onNotice: (msg: string) => void;
	onError: (msg: string) => void;
};

export default function AdminHomepageSectionsTab({
	products,
	categories,
	subcategories,
	styles,
	openSectionForm,
	openSectionSaving,
	selectedGender,
	onGenderChange,
	onOpenSectionChange,
	onOpenSectionSubmit,
	onNotice,
	onError,
}: Props) {
	const [activeSection, setActiveSection] = useState<SectionKey>("open-section");
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [form, setForm] = useState<ShelfFormState>({
		eyebrow: "",
		title: "",
		isActive: true,
		collectionType: "auto",
		collectionId: "",
		products: [],
	});

	const loadSection = useCallback(async (sectionKey: SectionKey, gender: Gender) => {
		if (sectionKey === "open-section") return;
		setLoading(true);
		try {
			const endpoint = sectionKey === "new-arrivals"
				? `/admin/home-sections/new-arrivals?gender=${gender}`
				: `/admin/home-sections/shelf/${sectionKey}?gender=${gender}`;
			const res = await apiRequest<{ success: boolean; section?: any }>(endpoint);
			const s = res.section;
			const fallbackType: CollectionType = sectionKey === "new-arrivals" ? "manual" : "auto";
			setForm({
				eyebrow: s?.eyebrow || "",
				title: s?.title || "",
				isActive: s?.isActive !== false,
				collectionType: (s?.collectionType as CollectionType) || fallbackType,
				collectionId: s?.collectionId || "",
				products: (s?.products || []).map((p: any) => (typeof p === "string" ? p : p._id)).filter(Boolean),
			});
		} catch (err) {
			onError(err instanceof Error ? err.message : "Failed to load section");
		} finally {
			setLoading(false);
		}
	}, [onError]);

	useEffect(() => {
		if (activeSection !== "open-section") {
			void loadSection(activeSection, selectedGender);
		}
	}, [activeSection, selectedGender, loadSection]);

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		try {
			const endpoint = activeSection === "new-arrivals"
				? "/admin/home-sections/new-arrivals"
				: `/admin/home-sections/shelf/${activeSection}`;
			await apiRequest(endpoint, {
				method: "PUT",
				body: JSON.stringify({
					gender: selectedGender,
					eyebrow: form.eyebrow,
					title: form.title,
					isActive: form.isActive,
					collectionType: form.collectionType,
					collectionId: form.collectionId,
					products: form.products,
				}),
			});
			onNotice(`${SECTIONS.find((s) => s.key === activeSection)?.label || "Section"} (${selectedGender}) updated`);
		} catch (err) {
			onError(err instanceof Error ? err.message : "Failed to save section");
		} finally {
			setSaving(false);
		}
	};

	const selectedSet = useMemo(() => new Set(form.products), [form.products]);
	const filteredProducts = useMemo(() => {
		const q = searchQuery.trim().toLowerCase();
		return q ? products.filter((p) => p.title?.toLowerCase().includes(q)) : products;
	}, [products, searchQuery]);

	const toggleProduct = (id: string) => {
		setForm((prev) => ({
			...prev,
			products: selectedSet.has(id) ? prev.products.filter((pid) => pid !== id) : [...prev.products, id],
		}));
	};

	const moveProduct = (id: string, dir: -1 | 1) => {
		const idx = form.products.indexOf(id);
		const next = idx + dir;
		if (idx < 0 || next < 0 || next >= form.products.length) return;
		const arr = [...form.products];
		[arr[idx], arr[next]] = [arr[next], arr[idx]];
		setForm((prev) => ({ ...prev, products: arr }));
	};

	const collectionOptions =
		form.collectionType === "category" ? categories :
		form.collectionType === "subcategory" ? subcategories :
		form.collectionType === "style" ? styles : [];

	const currentMeta = SECTIONS.find((s) => s.key === activeSection)!;

	return (
		<section className="admin-content">
			{/* Gender Switcher */}
			<div style={{ display: "flex", gap: "10px", marginBottom: "1rem", flexWrap: "wrap" }}>
				{(["women", "men", "kids"] as const).map((g) => (
					<button
						key={g}
						type="button"
						className={`admin-btn ${selectedGender === g ? "" : "admin-btn-muted"}`}
						style={{ textTransform: "capitalize", padding: "8px 20px", fontWeight: 600 }}
						onClick={() => onGenderChange(g)}
					>
						{g === "women" ? "Women" : g === "men" ? "Men" : "Kids"}
					</button>
				))}
			</div>

			{/* Section Switcher */}
			<div style={{ display: "flex", gap: "8px", marginBottom: "1.5rem", flexWrap: "wrap", borderBottom: "1px solid #e4e4da", paddingBottom: "1rem" }}>
				{SECTIONS.map((sec) => (
					<button
						key={sec.key}
						type="button"
						className={`admin-btn ${activeSection === sec.key ? "" : "admin-btn-muted"}`}
						style={{ padding: "8px 16px", fontWeight: 600 }}
						onClick={() => setActiveSection(sec.key)}
					>
						{sec.label}
					</button>
				))}
			</div>

			{activeSection === "open-section" ? (
				<AdminOpenSectionTab
					form={openSectionForm}
					products={products}
					selectedGender={selectedGender}
					onGenderChange={onGenderChange}
					onChange={onOpenSectionChange}
					onSubmit={onOpenSectionSubmit}
					saving={openSectionSaving}
					hideGenderSwitcher
				/>
			) : (
				<>
					<form onSubmit={handleSave} className="admin-panel" style={{ marginBottom: "1.5rem" }}>
						<h2>{currentMeta.label} ({selectedGender.toUpperCase()})</h2>
						{loading ? <p style={{ color: "#666" }}>Loading section...</p> : (
							<>
								<div className="admin-form-grid" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: "1rem" }}>
									<div className="admin-form-group">
										<label>Sub-heading (Eyebrow)</label>
										<input type="text" value={form.eyebrow} onChange={(e) => setForm({ ...form, eyebrow: e.target.value })} placeholder="e.g. Made to gift" />
									</div>
									<div className="admin-form-group">
										<label>Main Heading (Title)</label>
										<input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Gifts & charm picks" />
									</div>
								</div>

								<div className="admin-form-group" style={{ marginBottom: "1rem" }}>
									<label className="admin-checkbox">
										<input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
										Show section on homepage
									</label>
								</div>

								<div className="admin-form-group" style={{ marginBottom: "1rem" }}>
									<label>Products Source</label>
									<div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "6px" }}>
										{currentMeta.supportsAuto && (
											<button type="button" className={`admin-btn ${form.collectionType === "auto" ? "" : "admin-btn-muted"}`} onClick={() => setForm({ ...form, collectionType: "auto", collectionId: "" })}>
												Automatic
											</button>
										)}
										<button type="button" className={`admin-btn ${form.collectionType === "manual" ? "" : "admin-btn-muted"}`} onClick={() => setForm({ ...form, collectionType: "manual", collectionId: "" })}>
											Handpick Products
										</button>
										<button type="button" className={`admin-btn ${form.collectionType === "category" ? "" : "admin-btn-muted"}`} onClick={() => setForm({ ...form, collectionType: "category", collectionId: "" })}>
											Category
										</button>
										<button type="button" className={`admin-btn ${form.collectionType === "subcategory" ? "" : "admin-btn-muted"}`} onClick={() => setForm({ ...form, collectionType: "subcategory", collectionId: "" })}>
											Sub-Category
										</button>
										<button type="button" className={`admin-btn ${form.collectionType === "style" ? "" : "admin-btn-muted"}`} onClick={() => setForm({ ...form, collectionType: "style", collectionId: "" })}>
											Style
										</button>
									</div>
								</div>

								{(form.collectionType === "category" || form.collectionType === "subcategory" || form.collectionType === "style") && (
									<div className="admin-form-group" style={{ marginBottom: "1rem", maxWidth: "420px" }}>
										<label>Select {form.collectionType === "category" ? "Category" : form.collectionType === "subcategory" ? "Sub-Category" : "Style"}</label>
										<select value={form.collectionId} onChange={(e) => setForm({ ...form, collectionId: e.target.value })} required>
											<option value="">Choose...</option>
											{collectionOptions.map((c) => (
												<option key={c._id} value={c._id}>{c.name || c._id}</option>
											))}
										</select>
									</div>
								)}

								<button type="submit" className="admin-btn" disabled={saving}>
									{saving ? "Saving..." : "Save Changes"}
								</button>
							</>
						)}
					</form>

					{form.collectionType === "manual" && (
						<div className="admin-panel">
							<h2>Handpick Products ({selectedSet.size} selected)</h2>
							<div className="admin-controls">
								<input
									type="text"
									className="admin-search"
									placeholder="Search products by title..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
								/>
							</div>
							<div className="admin-table-wrap">
								<table className="admin-table">
									<thead>
										<tr>
											<th style={{ width: 60 }}>Select</th>
											<th>Product</th>
											<th>Price</th>
											<th>Order</th>
										</tr>
									</thead>
									<tbody>
										{filteredProducts.map((p) => {
											const isSel = selectedSet.has(p._id);
											const idx = form.products.indexOf(p._id);
											const img = p.mainImage || p.images?.[0] || "";
											return (
												<tr key={p._id}>
													<td><input type="checkbox" checked={isSel} onChange={() => toggleProduct(p._id)} aria-label={`Select ${p.title || "product"}`} /></td>
													<td>
														<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
															{img ? <img src={img} alt={p.title || "Product"} style={{ width: 44, height: 56, objectFit: "cover", borderRadius: 4, flexShrink: 0 }} /> : null}
															<span>{p.title || "-"}</span>
														</div>
													</td>
													<td>INR {Math.round(p.price ?? 0).toLocaleString()}</td>
													<td>
														{isSel ? (
															<div className="admin-inline-actions">
																<span>#{idx + 1}</span>
																<button type="button" className="admin-btn admin-btn-muted" onClick={() => moveProduct(p._id, -1)} disabled={idx === 0}>Up</button>
																<button type="button" className="admin-btn admin-btn-muted" onClick={() => moveProduct(p._id, 1)} disabled={idx === form.products.length - 1}>Down</button>
															</div>
														) : "-"}
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						</div>
					)}
				</>
			)}
		</section>
	);
}
