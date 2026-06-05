"use client";
import React, { useRef, useState } from "react";

type ProductRef = { _id: string; title?: string } | string;
type CategoryRef = { _id: string; name?: string } | string;
type StyleRef = { _id: string; name?: string } | string;

export type AdminCombo = {
	_id: string;
	name: string;
	description?: string;
	type: "curated" | "custom";
	status: "active" | "inactive";
	displayOrder: number;
	image?: string;
	price?: number;
	originalPrice?: number;
	slots?: Array<{
		category: CategoryRef;
		allowedProducts: Array<ProductRef>;
		defaultProduct: ProductRef;
	}>;
	categories?: Array<CategoryRef>;
	styles?: Array<StyleRef>;
	discountType?: "percentage" | "fixed";
	discountRules?: Array<{ minPrice?: number; minItems?: number; discountValue?: number }>;
};

type AdminProduct = { _id: string; title: string; price?: number; image?: string };
type AdminCategory = { _id: string; name?: string };
type AdminStyle = { _id: string; name?: string };

type Props = {
	combos: AdminCombo[];
	products: AdminProduct[];
	categories: AdminCategory[];
	styles: AdminStyle[];
	onCreateCuratedCombo: (payload: FormData) => void;
	onCreateCustomCombo: (payload: FormData) => void;
	onEditCombo: (id: string, payload: FormData) => void;
	onDeleteCombo: (id: string) => void;
};

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
	slots: Array<{
		category: string;
		allowedProducts: string[];
		defaultProduct: string;
	}>;
	selectedCategories: string[];
	selectedStyles: string[];
	discountType: "percentage" | "fixed";
	discountRules: Array<{ minPrice: string; minItems: string; discountValue: string }>;
	imageFile: File | null;
	existingImage?: string;
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
	slots: [],
	selectedCategories: [],
	selectedStyles: [],
	discountType: "percentage",
	discountRules: [],
	imageFile: null,
};

type TabKey = "curated" | "custom";

export default function AdminCombosTab({
	combos,
	products,
	categories,
	styles,
	onCreateCuratedCombo,
	onCreateCustomCombo,
	onEditCombo,
	onDeleteCombo,
}: Props) {
	const safeCombos = Array.isArray(combos) ? combos : [];
	const safeProducts = Array.isArray(products) ? products : [];
	const safeCategories = Array.isArray(categories) ? categories : [];
	const safeStyles = Array.isArray(styles) ? styles : [];
	const [activeTab, setActiveTab] = useState<TabKey>("curated");
	const [modal, setModal] = useState<ModalState | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

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
			slots: (combo.slots || []).map((s) => ({
				category: typeof s.category === "string" ? s.category : s.category._id,
				allowedProducts: (s.allowedProducts || []).map((p) => (typeof p === "string" ? p : p._id)),
				defaultProduct: typeof s.defaultProduct === "string" ? s.defaultProduct : s.defaultProduct._id,
			})),
			selectedCategories: (combo.categories || []).map((c) => (typeof c === "string" ? c : c._id)),
			selectedStyles: (combo.styles || []).map((s) => (typeof s === "string" ? s : s._id)),
			discountType: combo.discountType || "percentage",
			discountRules: (combo.discountRules || []).map((r) => ({
				minPrice: String(r.minPrice || ""),
				minItems: String(r.minItems || ""),
				discountValue: String(r.discountValue || ""),
			})),
			imageFile: null,
			existingImage: combo.image,
		});
	};

	const closeModal = () => {
		setModal(null);
		setImagePreview(null);
		if (fileInputRef.current) fileInputRef.current.value = "";
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] || null;
		if (!modal) return;
		setModal((prev) => (prev ? { ...prev, imageFile: file } : prev));
		if (file) {
			const reader = new FileReader();
			reader.onload = () => setImagePreview(reader.result as string);
			reader.readAsDataURL(file);
		}
	};

	const buildFormData = (): FormData => {
		if (!modal) return new FormData();
		const fd = new FormData();
		fd.append("name", modal.name.trim());
		if (modal.description) fd.append("description", modal.description.trim());
		fd.append("status", modal.status);
		fd.append("displayOrder", modal.displayOrder);

		if (modal.kind === "curated") {
			fd.append("price", modal.price);
			if (modal.originalPrice) fd.append("originalPrice", modal.originalPrice);
			fd.append("slots", JSON.stringify(modal.slots));
		} else {
			fd.append("categories", JSON.stringify(modal.selectedCategories));
			fd.append("styles", JSON.stringify(modal.selectedStyles));
			fd.append("discountType", modal.discountType);
			fd.append(
				"discountRules",
				JSON.stringify(
					modal.discountRules.map((r) => ({
						minPrice: r.minPrice ? Number(r.minPrice) : undefined,
						minItems: r.minItems ? Number(r.minItems) : undefined,
						discountValue: r.discountValue ? Number(r.discountValue) : undefined,
					}))
				)
			);
		}

		if (modal.imageFile) fd.append("image", modal.imageFile);
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

		const visibleCombos = safeCombos.filter((c) => c.type === activeTab);

	const renderTable = () => {
		return (
			<div className="admin-table-wrap">
				<table className="admin-table">
					<thead>
						<tr>
							<th style={{ width: 64 }}>Image</th>
							<th>Name</th>
							<th>Status</th>
							<th>{activeTab === "curated" ? "Price" : "Discount"}</th>
							<th style={{ width: 120 }}>Actions</th>
						</tr>
					</thead>
					<tbody>
						{visibleCombos.length === 0 && (
							<tr>
								<td colSpan={5} style={{ textAlign: "center", color: "#888", padding: "2rem" }}>
									No combos yet
								</td>
							</tr>
						)}
						{visibleCombos.map((c) => (
							<tr key={c._id}>
								<td>
									{c.image ? (
										<img src={c.image} alt={c.name} style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 6, border: "1px solid #e5e5e0" }} />
									) : (
										<span style={{ width: 48, height: 48, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#f5f4ef", borderRadius: 6, color: "#aaa", fontSize: 20 }}>
											🎁
										</span>
									)}
								</td>
								<td style={{ fontWeight: 600 }}>{c.name}</td>
								<td>
									<span
										style={{
											display: "inline-block",
											padding: "0.2rem 0.6rem",
											borderRadius: 100,
											fontSize: "0.78rem",
											fontWeight: 600,
											background: c.status === "active" ? "#d4f5dc" : "#fde8e8",
											color: c.status === "active" ? "#1a7a35" : "#943b2a",
										}}
									>
										{c.status === "active" ? "Active" : "Inactive"}
									</span>
								</td>
								<td style={{ color: "#666" }}>
									{activeTab === "curated" ? `₹${c.price || 0}` : `${c.discountType === "percentage" ? "Percentage" : "Fixed"} Based`}
								</td>
								<td>
									<div className="admin-inline-actions">
										<button className="admin-btn" style={{ padding: "0.3rem 0.7rem", fontSize: "0.8rem" }} onClick={() => openEdit(c)}>
											Edit
										</button>
										<button className="admin-btn admin-btn-danger" style={{ padding: "0.3rem 0.7rem", fontSize: "0.8rem" }} onClick={() => confirmDelete(c._id)}>
											Delete
										</button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		);
	};

	const modalTitle = modal ? `${modal.mode === "create" ? "Add" : "Edit"} ${modal.kind === "curated" ? "Curated" : "Custom"} Combo` : "";

	return (
		<section className="admin-content">
			<div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", borderBottom: "2px solid #e8ead0", paddingBottom: "0.5rem", flexWrap: "wrap" }}>
				<button
					onClick={() => setActiveTab("curated")}
					style={{
						padding: "0.5rem 1.2rem",
						borderRadius: "6px 6px 0 0",
						border: "none",
						cursor: "pointer",
						fontWeight: 600,
						fontSize: "0.9rem",
						transition: "all 0.18s",
						background: activeTab === "curated" ? "#4a5c22" : "transparent",
						color: activeTab === "curated" ? "#fff" : "#6b6b60",
					}}
				>
					Curated Combos
				</button>
				<button
					onClick={() => setActiveTab("custom")}
					style={{
						padding: "0.5rem 1.2rem",
						borderRadius: "6px 6px 0 0",
						border: "none",
						cursor: "pointer",
						fontWeight: 600,
						fontSize: "0.9rem",
						transition: "all 0.18s",
						background: activeTab === "custom" ? "#4a5c22" : "transparent",
						color: activeTab === "custom" ? "#fff" : "#6b6b60",
					}}
				>
					Custom Combos
				</button>

				<div style={{ flex: 1 }} />
				<button className="admin-btn" style={{ alignSelf: "flex-start" }} onClick={() => openCreate()}>
					+ Add {activeTab === "curated" ? "Curated" : "Custom"} Combo
				</button>
			</div>

			<div className="admin-panel" style={{ padding: 0, overflow: "hidden" }}>
				{renderTable()}
			</div>

			{modal && (
				<div className="admin-modal-backdrop" onClick={closeModal} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}>
					<div
						className="admin-modal"
						onClick={(e) => e.stopPropagation()}
						style={{ maxWidth: 840, width: "100%", maxHeight: "90vh", display: "flex", flexDirection: "column", padding: 0, overflow: "hidden", borderRadius: 12 }}
					>
						<div style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid #e8ead0", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff" }}>
							<h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "#1a1f0f" }}>{modalTitle}</h3>
							<button type="button" onClick={closeModal} style={{ background: "none", border: "1px solid #d4d4c8", borderRadius: 6, cursor: "pointer", padding: "0.3rem 0.8rem", color: "#666", fontSize: "0.9rem" }}>
								Close
							</button>
						</div>

						<div style={{ padding: "1.5rem", overflowY: "auto", flex: 1 }}>
							<form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
								<div style={{ display: "grid", gap: "0.35rem" }}>
									<label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>Name *</label>
									<input
										required
										placeholder="Enter name..."
										value={modal.name}
										onChange={(e) => setModal((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
										style={{ padding: "0.65rem 0.8rem", border: "1px solid #d4d4c8", borderRadius: 6, fontSize: "0.95rem" }}
									/>
								</div>

								<div style={{ display: "grid", gap: "0.35rem" }}>
									<label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>Description</label>
									<textarea
										placeholder="Optional description..."
										value={modal.description}
										onChange={(e) => setModal((prev) => (prev ? { ...prev, description: e.target.value } : prev))}
										rows={2}
										style={{ padding: "0.65rem 0.8rem", border: "1px solid #d4d4c8", borderRadius: 6, fontSize: "0.95rem", resize: "vertical" }}
									/>
								</div>

								<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
									<div style={{ display: "grid", gap: "0.35rem" }}>
										<label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>Status</label>
										<select
											value={modal.status}
											onChange={(e) => setModal((prev) => (prev ? { ...prev, status: e.target.value as "active" | "inactive" } : prev))}
											style={{ padding: "0.65rem 0.8rem", border: "1px solid #d4d4c8", borderRadius: 6, fontSize: "0.95rem", background: "#fff" }}
										>
											<option value="active">Active</option>
											<option value="inactive">Inactive</option>
										</select>
									</div>
									<div style={{ display: "grid", gap: "0.35rem" }}>
										<label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>Display Order</label>
										<input
											type="number"
											value={modal.displayOrder}
											onChange={(e) => setModal((prev) => (prev ? { ...prev, displayOrder: e.target.value } : prev))}
											style={{ padding: "0.65rem 0.8rem", border: "1px solid #d4d4c8", borderRadius: 6, fontSize: "0.95rem" }}
										/>
									</div>
								</div>

								{modal.kind === "curated" && (
									<>
										<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
											<div style={{ display: "grid", gap: "0.35rem" }}>
												<label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>Fixed Price *</label>
												<input
													required
													type="number"
													placeholder="Combo Price..."
													value={modal.price}
													onChange={(e) => setModal((prev) => (prev ? { ...prev, price: e.target.value } : prev))}
													style={{ padding: "0.65rem 0.8rem", border: "1px solid #d4d4c8", borderRadius: 6, fontSize: "0.95rem" }}
												/>
											</div>
											<div style={{ display: "grid", gap: "0.35rem" }}>
												<label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>Original Price</label>
												<input
													type="number"
													placeholder="Original Price..."
													value={modal.originalPrice}
													onChange={(e) => setModal((prev) => (prev ? { ...prev, originalPrice: e.target.value } : prev))}
													style={{ padding: "0.65rem 0.8rem", border: "1px solid #d4d4c8", borderRadius: 6, fontSize: "0.95rem" }}
												/>
											</div>
										</div>

										<div style={{ display: "grid", gap: "0.35rem" }}>
											<label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>Box Slots</label>
											<div style={{ border: "1px solid #d4d4c8", borderRadius: 6, padding: "0.8rem", background: "#fdfdfa", maxHeight: 400, overflowY: "auto", display: "grid", gap: "0.8rem" }}>
												{modal.slots.map((s, idx) => {
													return (
														<div key={idx} style={{ background: "#fff", border: "1px solid #e8ead0", padding: "0.8rem", borderRadius: 8, display: "grid", gap: "0.6rem" }}>
															<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
																<strong style={{ fontSize: "0.9rem", color: "#4a5c22" }}>Slot {idx + 1}</strong>
																<button
																	type="button"
																	onClick={() => {
																		const newS = [...modal.slots];
																		newS.splice(idx, 1);
																		setModal({ ...modal, slots: newS });
																	}}
																	style={{ background: "#fde8e8", color: "#943b2a", border: "none", borderRadius: 4, padding: "0.2rem 0.5rem", cursor: "pointer", fontSize: "0.75rem" }}
																>
																	Remove Slot
																</button>
															</div>
															
															<div style={{ display: "grid", gap: "0.3rem" }}>
																<label style={{ fontSize: "0.8rem", color: "#666" }}>Category</label>
																<select
																	value={s.category}
																	onChange={(e) => {
																		const newS = [...modal.slots];
																		newS[idx].category = e.target.value;
																		newS[idx].allowedProducts = [];
																		newS[idx].defaultProduct = "";
																		setModal({ ...modal, slots: newS });
																	}}
																	style={{ padding: "0.4rem", borderRadius: 4, border: "1px solid #d4d4c8" }}
																>
																	<option value="">Select a category...</option>
																	{safeCategories.map((cat) => (
																		<option key={cat._id} value={cat._id}>{cat.name}</option>
																	))}
																</select>
															</div>

															{s.category && (
																<>
																	<div style={{ display: "grid", gap: "0.3rem" }}>
																		<label style={{ fontSize: "0.8rem", color: "#666" }}>Allowed Products (Hold Ctrl/Cmd to select multiple)</label>
																		<select
																			multiple
																			value={s.allowedProducts}
																			onChange={(e) => {
																				const opts = Array.from(e.target.selectedOptions, (opt) => opt.value);
																				const newS = [...modal.slots];
																				newS[idx].allowedProducts = opts;
																				// Reset default if it's no longer allowed
																				if (!opts.includes(newS[idx].defaultProduct)) {
																					newS[idx].defaultProduct = opts[0] || "";
																				}
																				setModal({ ...modal, slots: newS });
																			}}
																			style={{ padding: "0.4rem", borderRadius: 4, border: "1px solid #d4d4c8", height: 100 }}
																		>
																			{safeProducts.map((prod) => (
																				<option key={prod._id} value={prod._id}>{prod.title}</option>
																			))}
																		</select>
																	</div>

																	<div style={{ display: "grid", gap: "0.3rem" }}>
																		<label style={{ fontSize: "0.8rem", color: "#666" }}>Default Product</label>
																		<select
																			value={s.defaultProduct}
																			onChange={(e) => {
																				const newS = [...modal.slots];
																				newS[idx].defaultProduct = e.target.value;
																				setModal({ ...modal, slots: newS });
																			}}
																			style={{ padding: "0.4rem", borderRadius: 4, border: "1px solid #d4d4c8" }}
																		>
																			<option value="">Select default...</option>
																			{s.allowedProducts.map((pId) => {
																				const p = safeProducts.find(prod => prod._id === pId);
																				return p ? <option key={p._id} value={p._id}>{p.title}</option> : null;
																			})}
																		</select>
																	</div>
																</>
															)}
														</div>
													);
												})}
												<button
													type="button"
													onClick={() => setModal({ ...modal, slots: [...modal.slots, { category: "", allowedProducts: [], defaultProduct: "" }] })}
													style={{ background: "#e8ead0", color: "#4a5c22", border: "none", borderRadius: 4, padding: "0.6rem", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, justifySelf: "start" }}
												>
													+ Add Slot
												</button>
											</div>
										</div>
									</>
								)}

								{modal.kind === "custom" && (
									<>
										<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
											<div style={{ display: "grid", gap: "0.35rem" }}>
												<label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>Eligible Categories</label>
												<select
													multiple
													value={modal.selectedCategories}
													onChange={(e) => {
														const opts = Array.from(e.target.selectedOptions, (opt) => opt.value);
														setModal((prev) => (prev ? { ...prev, selectedCategories: opts } : prev));
													}}
													style={{ padding: "0.65rem 0.8rem", border: "1px solid #d4d4c8", borderRadius: 6, fontSize: "0.95rem", background: "#fff", height: 120 }}
												>
													{safeCategories.map((c) => (
														<option key={c._id} value={c._id}>
															{c.name}
														</option>
													))}
												</select>
												<span style={{ fontSize: "0.75rem", color: "#888" }}>Hold Ctrl/Cmd to select multiple. Leave empty for all.</span>
											</div>
											<div style={{ display: "grid", gap: "0.35rem" }}>
												<label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>Eligible Styles</label>
												<select
													multiple
													value={modal.selectedStyles}
													onChange={(e) => {
														const opts = Array.from(e.target.selectedOptions, (opt) => opt.value);
														setModal((prev) => (prev ? { ...prev, selectedStyles: opts } : prev));
													}}
													style={{ padding: "0.65rem 0.8rem", border: "1px solid #d4d4c8", borderRadius: 6, fontSize: "0.95rem", background: "#fff", height: 120 }}
												>
													{safeStyles.map((s) => (
														<option key={s._id} value={s._id}>
															{s.name}
														</option>
													))}
												</select>
												<span style={{ fontSize: "0.75rem", color: "#888" }}>Hold Ctrl/Cmd to select multiple. Leave empty for all.</span>
											</div>
										</div>

										<div style={{ display: "grid", gap: "0.35rem" }}>
											<label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>Discount Type</label>
											<select
												value={modal.discountType}
												onChange={(e) => setModal((prev) => (prev ? { ...prev, discountType: e.target.value as "percentage" | "fixed" } : prev))}
												style={{ padding: "0.65rem 0.8rem", border: "1px solid #d4d4c8", borderRadius: 6, fontSize: "0.95rem", background: "#fff" }}
											>
												<option value="percentage">Percentage Off (%)</option>
												<option value="fixed">Fixed Amount Off (₹)</option>
											</select>
										</div>

										<div style={{ display: "grid", gap: "0.35rem" }}>
											<label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>Discount Rules</label>
											<div style={{ border: "1px solid #d4d4c8", borderRadius: 6, padding: "0.8rem", background: "#fdfdfa" }}>
												{modal.discountRules.map((r, idx) => (
													<div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "0.5rem", marginBottom: "0.5rem" }}>
														<input
															type="number"
															placeholder="Min Price (₹)"
															value={r.minPrice}
															onChange={(e) => {
																const newR = [...modal.discountRules];
																newR[idx].minPrice = e.target.value;
																setModal({ ...modal, discountRules: newR });
															}}
															style={{ padding: "0.4rem", borderRadius: 4, border: "1px solid #d4d4c8" }}
														/>
														<input
															type="number"
															placeholder="Min Items"
															value={r.minItems}
															onChange={(e) => {
																const newR = [...modal.discountRules];
																newR[idx].minItems = e.target.value;
																setModal({ ...modal, discountRules: newR });
															}}
															style={{ padding: "0.4rem", borderRadius: 4, border: "1px solid #d4d4c8" }}
														/>
														<input
															type="number"
															placeholder={modal.discountType === "percentage" ? "Discount %" : "Discount ₹"}
															value={r.discountValue}
															onChange={(e) => {
																const newR = [...modal.discountRules];
																newR[idx].discountValue = e.target.value;
																setModal({ ...modal, discountRules: newR });
															}}
															style={{ padding: "0.4rem", borderRadius: 4, border: "1px solid #d4d4c8" }}
															required
														/>
														<button
															type="button"
															onClick={() => {
																const newR = [...modal.discountRules];
																newR.splice(idx, 1);
																setModal({ ...modal, discountRules: newR });
															}}
															style={{ background: "#fde8e8", color: "#943b2a", border: "none", borderRadius: 4, padding: "0.4rem 0.6rem", cursor: "pointer" }}
														>
															X
														</button>
													</div>
												))}
												<button
													type="button"
													onClick={() => setModal({ ...modal, discountRules: [...modal.discountRules, { minPrice: "", minItems: "", discountValue: "" }] })}
													style={{ background: "#e8ead0", color: "#4a5c22", border: "none", borderRadius: 4, padding: "0.4rem 0.6rem", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600 }}
												>
													+ Add Rule
												</button>
											</div>
										</div>
									</>
								)}

								<div style={{ display: "grid", gap: "0.35rem" }}>
									<label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>Image</label>
									{imagePreview && (
										<div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "0.4rem" }}>
											<img src={imagePreview} alt="Preview" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: "1px solid #d4d4c8" }} />
											<div style={{ fontSize: "0.82rem", color: "#666" }}>
												{modal.imageFile ? (
													<>
														<strong style={{ color: "#4a5c22" }}>New file selected:</strong>
														<br />
														{modal.imageFile.name}
													</>
												) : (
													"Current image"
												)}
											</div>
										</div>
									)}
									<input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} style={{ padding: "0.4rem", border: "1px solid #d4d4c8", borderRadius: 6, fontSize: "0.9rem" }} />
								</div>

								<div style={{ display: "flex", justifyContent: "flex-end", gap: "0.6rem", paddingTop: "0.5rem" }}>
									<button type="button" onClick={closeModal} style={{ padding: "0.6rem 1.2rem", border: "1px solid #d4d4c8", borderRadius: 6, cursor: "pointer", background: "#fff", color: "#444", fontSize: "0.9rem" }}>
										Cancel
									</button>
									<button type="submit" className="admin-btn" style={{ padding: "0.6rem 1.4rem" }}>
										{modal.mode === "create" ? "Create Combo" : "Save Changes"}
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}
		</section>
	);
}
