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
	products?: Array<ProductRef>;
	itemsCount?: number;
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
	itemsCount: string;
	tagline: string;
	badge: string;
	tint: string;
	products: string[];
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
	tagline: "",
	badge: "",
	tint: "#c8a84b",
	products: [],
	imageFile: null,
};

type TabKey = "curated" | "custom";

export default function AdminCombosTab({
	combos,
	products,
	categories, // Kept in props in case needed later, though not used in new combo logic
	styles,     // Kept in props
	onCreateCuratedCombo,
	onCreateCustomCombo,
	onEditCombo,
	onDeleteCombo,
}: Props) {
	const safeCombos = Array.isArray(combos) ? combos : [];
	const safeProducts = Array.isArray(products) ? products : [];
	const [activeTab, setActiveTab] = useState<TabKey>("curated");
	const [modal, setModal] = useState<ModalState | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [productSearch, setProductSearch] = useState("");
	const fileInputRef = useRef<HTMLInputElement>(null);

	const openCreate = () => {
		setImagePreview(null);
		setProductSearch("");
		setModal({ ...defaultModal, kind: activeTab, mode: "create" });
	};

	const openEdit = (combo: AdminCombo) => {
		setImagePreview(combo.image || null);
		setProductSearch("");
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
			tagline: combo.tagline || "",
			badge: combo.badge || "",
			tint: combo.tint || "#c8a84b",
			products: (combo.products || []).map((p) => (typeof p === "string" ? p : p._id)),
			imageFile: null,
			existingImage: combo.image,
		});
	};

	const closeModal = () => {
		setModal(null);
		setImagePreview(null);
		setProductSearch("");
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
		if (modal.tagline) fd.append("tagline", modal.tagline.trim());
		if (modal.badge) fd.append("badge", modal.badge.trim());
		if (modal.tint) fd.append("tint", modal.tint);
		fd.append("products", JSON.stringify(modal.products));

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
								<td style={{ color: "#666" }}>
									₹{c.price || 0}
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

								<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
									<div style={{ display: "grid", gap: "0.35rem" }}>
										<label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>Tagline</label>
										<input
											placeholder="e.g. Bridal Glow Set"
											value={modal.tagline}
											onChange={(e) => setModal((prev) => (prev ? { ...prev, tagline: e.target.value } : prev))}
											style={{ padding: "0.65rem 0.8rem", border: "1px solid #d4d4c8", borderRadius: 6, fontSize: "0.95rem" }}
										/>
									</div>
									<div style={{ display: "grid", gap: "0.35rem" }}>
										<label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>Badge</label>
										<input
											placeholder="e.g. Best Seller"
											value={modal.badge}
											onChange={(e) => setModal((prev) => (prev ? { ...prev, badge: e.target.value } : prev))}
											style={{ padding: "0.65rem 0.8rem", border: "1px solid #d4d4c8", borderRadius: 6, fontSize: "0.95rem" }}
										/>
									</div>
									<div style={{ display: "grid", gap: "0.35rem" }}>
										<label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>Tint Color</label>
										<input
											type="color"
											value={modal.tint}
											onChange={(e) => setModal((prev) => (prev ? { ...prev, tint: e.target.value } : prev))}
											style={{ padding: "0.2rem", border: "1px solid #d4d4c8", borderRadius: 6, width: "100%", height: "42px", cursor: "pointer" }}
										/>
									</div>
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
									<label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>
										{modal.kind === "curated" ? "Included Products" : "Eligible Products"}
									</label>
									<input
										type="text"
										placeholder="Search products..."
										value={productSearch}
										onChange={(e) => setProductSearch(e.target.value)}
										style={{ padding: "0.5rem 0.8rem", border: "1px solid #d4d4c8", borderRadius: 6, fontSize: "0.9rem", marginBottom: "0.2rem" }}
									/>
									<div style={{ border: "1px solid #d4d4c8", borderRadius: 6, padding: "0.8rem", background: "#fff", height: 200, overflowY: "auto", display: "grid", gap: "0.5rem" }}>
										{safeProducts
											.filter((p) => p.title.toLowerCase().includes(productSearch.toLowerCase()))
											.map((p) => {
												const isSelected = modal.products.includes(p._id);
												return (
													<label key={p._id} style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.9rem", cursor: "pointer", background: isSelected ? "#f5f7ed" : "transparent", padding: "0.4rem", borderRadius: 4, transition: "background 0.2s" }}>
														<input
															type="checkbox"
															checked={isSelected}
															onChange={(e) => {
																if (e.target.checked) {
																	setModal((prev) => (prev ? { ...prev, products: [...prev.products, p._id] } : prev));
																} else {
																	setModal((prev) => (prev ? { ...prev, products: prev.products.filter((id) => id !== p._id) } : prev));
																}
															}}
															style={{ cursor: "pointer", width: 16, height: 16, accentColor: "#4a5c22" }}
														/>
														<span>{p.title} <span style={{ color: "#666" }}>{p.price ? `(₹${p.price})` : ""}</span></span>
													</label>
												);
											})}
										{safeProducts.filter((p) => p.title.toLowerCase().includes(productSearch.toLowerCase())).length === 0 && (
											<div style={{ color: "#888", fontSize: "0.85rem", textAlign: "center", padding: "1rem" }}>No products found</div>
										)}
									</div>
									<span style={{ fontSize: "0.75rem", color: "#888" }}>
										{modal.kind === "curated"
											? "These products will be bundled together at the fixed price."
											: "Users will be able to choose their required number of items from this list."}
									</span>
								</div>

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
