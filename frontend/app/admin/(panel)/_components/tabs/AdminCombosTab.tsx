"use client";
import React, { useRef, useState } from "react";

export type AdminComboProduct = {
	_id?: string;
	title: string;
	description?: string;
	image?: string;
	variants?: { name: string; options: string }[];
};

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
	products?: AdminComboProduct[];
	itemsCount?: number;
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
	image?: string;
	imageFile?: File | null;
	imagePreview?: string | null;
	variants: { name: string; options: string }[];
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
	itemsCount: string;
	products: ComboProductState[];
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
	itemsCount: "",
	products: [],
	imageFile: null,
};

type TabKey = "curated" | "custom";

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
			products: (combo.products || []).map((p) => ({
				_id: p._id,
				title: p.title || "",
				description: p.description || "",
				image: p.image,
				imageFile: null,
				imagePreview: p.image || null,
				variants: p.variants || [],
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
		fd.append("price", modal.price);

		const productsData = modal.products.map((p) => ({
			_id: p._id,
			title: p.title,
			description: p.description,
			image: p.image,
			variants: p.variants,
		}));
		fd.append("products", JSON.stringify(productsData));

		modal.products.forEach((p, index) => {
			if (p.imageFile) {
				fd.append(`productImage_${index}`, p.imageFile);
			}
		});

		if (modal.kind === "curated") {
			if (modal.originalPrice) fd.append("originalPrice", modal.originalPrice);
		} else {
			fd.append("itemsCount", modal.itemsCount);
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

	const [searchQuery, setSearchQuery] = useState("");

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

	// Embedded Products Management functions
	const addProduct = () => {
		if (!modal) return;
		setModal({
			...modal,
			products: [
				...modal.products,
				{ title: "", description: "", variants: [] },
			],
		});
	};

	const removeProduct = (index: number) => {
		if (!modal) return;
		const newProducts = [...modal.products];
		newProducts.splice(index, 1);
		setModal({ ...modal, products: newProducts });
	};

	const updateProduct = (index: number, key: keyof ComboProductState, value: any) => {
		if (!modal) return;
		const newProducts = [...modal.products];
		newProducts[index] = { ...newProducts[index], [key]: value };
		setModal({ ...modal, products: newProducts });
	};

	const handleProductImageChange = (index: number, file: File | null) => {
		if (!modal) return;
		const newProducts = [...modal.products];
		newProducts[index].imageFile = file;
		if (file) {
			const reader = new FileReader();
			reader.onload = () => {
				newProducts[index].imagePreview = reader.result as string;
				setModal({ ...modal, products: newProducts });
			};
			reader.readAsDataURL(file);
		} else {
			newProducts[index].imagePreview = newProducts[index].image || null;
			setModal({ ...modal, products: newProducts });
		}
	};

	const addVariant = (productIndex: number) => {
		if (!modal) return;
		const newProducts = [...modal.products];
		newProducts[productIndex].variants.push({ name: "", options: "" });
		setModal({ ...modal, products: newProducts });
	};

	const removeVariant = (productIndex: number, variantIndex: number) => {
		if (!modal) return;
		const newProducts = [...modal.products];
		newProducts[productIndex].variants.splice(variantIndex, 1);
		setModal({ ...modal, products: newProducts });
	};

	const updateVariant = (productIndex: number, variantIndex: number, key: "name" | "options", value: string) => {
		if (!modal) return;
		const newProducts = [...modal.products];
		newProducts[productIndex].variants[variantIndex][key] = value;
		setModal({ ...modal, products: newProducts });
	};

	const renderTable = () => {
		return (
			<div>
				<div className="admin-controls">
					<input
						type="text"
						className="admin-search"
						placeholder="Search combos by name..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
				<div className="admin-table-wrap">
					<table className="admin-table">
						<thead>
							<tr>
								<th style={{ width: 64 }}>Image</th>
								<th>Name</th>
								<th>Status</th>
								<th>Price</th>
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
									<td style={{ color: "#666" }}>₹{c.price || 0}</td>
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
				<div className="admin-modal-backdrop" onClick={closeModal} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem", zIndex: 9999 }}>
					<div
						className="admin-modal"
						onClick={(e) => e.stopPropagation()}
						style={{ maxWidth: 900, width: "100%", maxHeight: "90vh", display: "flex", flexDirection: "column", padding: 0, overflow: "hidden", borderRadius: 12 }}
					>
						<div style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid #e8ead0", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff" }}>
							<h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "#1a1f0f" }}>{modalTitle}</h3>
							<button type="button" onClick={closeModal} style={{ background: "none", border: "1px solid #d4d4c8", borderRadius: 6, cursor: "pointer", padding: "0.3rem 0.8rem", color: "#666", fontSize: "0.9rem" }}>
								Close
							</button>
						</div>

						<div style={{ padding: "1.5rem", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "1.5rem" }}>
							<form id="combo-form" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
								
								{/* Combo Details Section */}
								<div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
									<h4 style={{ margin: 0, fontSize: "1rem", color: "#4a5c22", borderBottom: "1px solid #e8ead0", paddingBottom: "0.5rem" }}>Combo Details</h4>
									<div style={{ display: "grid", gap: "0.35rem" }}>
										<label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>Name *</label>
										<input
											required
											placeholder="Enter combo name..."
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
										{modal.kind === "curated" && (
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
										)}
										{modal.kind === "custom" && (
											<div style={{ display: "grid", gap: "0.35rem" }}>
												<label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>Number of Items *</label>
												<input
													required
													type="number"
													placeholder="e.g. 3"
													value={modal.itemsCount}
													onChange={(e) => setModal((prev) => (prev ? { ...prev, itemsCount: e.target.value } : prev))}
													style={{ padding: "0.65rem 0.8rem", border: "1px solid #d4d4c8", borderRadius: 6, fontSize: "0.95rem" }}
												/>
											</div>
										)}
									</div>

									<div style={{ display: "grid", gap: "0.35rem" }}>
										<label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>Main Combo Image</label>
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
								</div>

								{/* Embedded Products Section */}
								<div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
									<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e8ead0", paddingBottom: "0.5rem" }}>
										<h4 style={{ margin: 0, fontSize: "1rem", color: "#4a5c22" }}>Products in Combo</h4>
										<button type="button" onClick={addProduct} className="admin-btn" style={{ padding: "0.3rem 0.8rem", fontSize: "0.8rem" }}>
											+ Add Product
										</button>
									</div>

									{modal.products.length === 0 ? (
										<div style={{ padding: "2rem", textAlign: "center", color: "#888", border: "1px dashed #d4d4c8", borderRadius: 8 }}>
											No products added to this combo yet.
										</div>
									) : (
										<div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
											{modal.products.map((p, pIndex) => (
												<div key={pIndex} style={{ border: "1px solid #d4d4c8", borderRadius: 8, padding: "1rem", background: "#fbfbfc", display: "flex", flexDirection: "column", gap: "1rem" }}>
													<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
														<h5 style={{ margin: 0, fontSize: "0.95rem" }}>Product #{pIndex + 1}</h5>
														<button type="button" onClick={() => removeProduct(pIndex)} style={{ background: "none", border: "none", color: "#d9534f", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600 }}>
															Remove
														</button>
													</div>

													<div style={{ display: "grid", gap: "0.35rem" }}>
														<label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#666" }}>Product Title *</label>
														<input
															required
															placeholder="e.g. Elegant Perfume"
															value={p.title}
															onChange={(e) => updateProduct(pIndex, "title", e.target.value)}
															style={{ padding: "0.5rem 0.8rem", border: "1px solid #d4d4c8", borderRadius: 6, fontSize: "0.9rem" }}
														/>
													</div>

													<div style={{ display: "grid", gap: "0.35rem" }}>
														<label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#666" }}>Description</label>
														<input
															placeholder="Optional description"
															value={p.description}
															onChange={(e) => updateProduct(pIndex, "description", e.target.value)}
															style={{ padding: "0.5rem 0.8rem", border: "1px solid #d4d4c8", borderRadius: 6, fontSize: "0.9rem" }}
														/>
													</div>

													<div style={{ display: "grid", gap: "0.35rem" }}>
														<label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#666" }}>Product Image</label>
														<div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
															{p.imagePreview && (
																<img src={p.imagePreview} alt="" style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 6, border: "1px solid #d4d4c8" }} />
															)}
															<input
																type="file"
																accept="image/*"
																onChange={(e) => handleProductImageChange(pIndex, e.target.files?.[0] || null)}
																style={{ fontSize: "0.85rem" }}
															/>
														</div>
													</div>

													{/* Variants Section */}
													<div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
														<label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#666", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
															<span>Variants (Optional)</span>
															<button type="button" onClick={() => addVariant(pIndex)} style={{ background: "none", border: "none", color: "#4a5c22", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>
																+ Add Variant
															</button>
														</label>
														{p.variants.length > 0 && (
															<div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
																{p.variants.map((v, vIndex) => (
																	<div key={vIndex} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
																		<input
																			required
																			placeholder="e.g. Color"
																			value={v.name}
																			onChange={(e) => updateVariant(pIndex, vIndex, "name", e.target.value)}
																			style={{ flex: 1, padding: "0.4rem 0.6rem", border: "1px solid #d4d4c8", borderRadius: 4, fontSize: "0.85rem" }}
																		/>
																		<input
																			required
																			placeholder="e.g. Red, Blue (comma separated)"
																			value={v.options}
																			onChange={(e) => updateVariant(pIndex, vIndex, "options", e.target.value)}
																			style={{ flex: 2, padding: "0.4rem 0.6rem", border: "1px solid #d4d4c8", borderRadius: 4, fontSize: "0.85rem" }}
																		/>
																		<button type="button" onClick={() => removeVariant(pIndex, vIndex)} style={{ background: "none", border: "none", color: "#d9534f", cursor: "pointer", fontSize: "1rem", fontWeight: 600, padding: "0.2rem 0.4rem" }}>
																			&times;
																		</button>
																	</div>
																))}
															</div>
														)}
													</div>
												</div>
											))}
										</div>
									)}
								</div>

							</form>
						</div>
						
						<div style={{ padding: "1.2rem 1.5rem", borderTop: "1px solid #e8ead0", display: "flex", justifyContent: "flex-end", gap: "0.6rem", background: "#fff" }}>
							<button type="button" onClick={closeModal} style={{ padding: "0.6rem 1.2rem", border: "1px solid #d4d4c8", borderRadius: 6, cursor: "pointer", background: "#fff", color: "#444", fontSize: "0.9rem" }}>
								Cancel
							</button>
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
