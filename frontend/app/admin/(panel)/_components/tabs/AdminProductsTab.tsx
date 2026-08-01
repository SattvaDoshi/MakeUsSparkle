"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import type { AdminProduct } from "../../_lib/admin.types";
import { apiRequest } from "@/lib/api";

// ─── helpers ────────────────────────────────────────────────────────────────

const getCategoryName = (cat: AdminProduct["category"]) => {
	if (!cat) return "Uncategorised";
	if (typeof cat === "string") return cat;
	return cat.name || cat.title || cat._id || "Unknown";
};

const getSubCategoryName = (sub: AdminProduct["subCategory"]) => {
	if (!sub) return "No Sub-category";
	if (typeof sub === "string") return sub;
	return sub.name || sub.title || sub._id || "Unknown";
};

const getCategoryId = (cat: AdminProduct["category"]) => {
	if (!cat) return "__none__";
	if (typeof cat === "string") return cat;
	return cat._id;
};

const getSubCategoryId = (sub: AdminProduct["subCategory"]) => {
	if (!sub) return "__none__";
	if (typeof sub === "string") return sub;
	return sub._id;
};

// ─── types ───────────────────────────────────────────────────────────────────

type AdminProductsTabProps = {
	products: AdminProduct[];
	onEdit: (product: AdminProduct) => void;
	onDelete: (id: string) => void;
};

type DraggableProduct = AdminProduct & { _localOrder: number };

// ─── sub-components ──────────────────────────────────────────────────────────

function ProductCard({
	product,
	globalRank,
	isDragging,
	onEdit,
	onDelete,
	onDragStart,
	onDragEnter,
	onDragEnd,
	dragOver,
}: {
	product: DraggableProduct;
	globalRank: number;
	isDragging: boolean;
	onEdit: () => void;
	onDelete: () => void;
	onDragStart: () => void;
	onDragEnter: () => void;
	onDragEnd: () => void;
	dragOver: boolean;
}) {
	return (
		<div
			draggable
			onDragStart={onDragStart}
			onDragEnter={onDragEnter}
			onDragEnd={onDragEnd}
			onDragOver={(e) => e.preventDefault()}
			style={{
				display: "flex",
				alignItems: "center",
				gap: 12,
				padding: "10px 14px",
				background: isDragging ? "rgba(99,102,241,0.07)" : dragOver ? "rgba(99,102,241,0.12)" : "var(--admin-bg, #fff)",
				border: dragOver
					? "2px dashed #6366f1"
					: isDragging
					? "2px dashed rgba(99,102,241,0.4)"
					: "1px solid rgba(0,0,0,0.07)",
				borderRadius: 12,
				cursor: "grab",
				transition: "background 0.15s, border-color 0.15s, transform 0.1s, box-shadow 0.15s",
				opacity: isDragging ? 0.5 : 1,
				transform: dragOver && !isDragging ? "translateY(-2px)" : undefined,
				boxShadow: dragOver && !isDragging ? "0 4px 16px rgba(99,102,241,0.15)" : "0 1px 4px rgba(0,0,0,0.05)",
				userSelect: "none",
				marginBottom: 6,
			}}
		>
			{/* Drag handle */}
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					gap: 3,
					padding: "2px 4px",
					flexShrink: 0,
					cursor: "grab",
					opacity: 0.4,
				}}
				title="Drag to reorder"
			>
				{[0, 1, 2].map((i) => (
					<div key={i} style={{ display: "flex", gap: 3 }}>
						<span style={{ width: 3, height: 3, borderRadius: "50%", background: "#555", display: "block" }} />
						<span style={{ width: 3, height: 3, borderRadius: "50%", background: "#555", display: "block" }} />
					</div>
				))}
			</div>

			{/* Global rank badge */}
			<div
				title="Display rank (lower = shows last, higher = shows first)"
				style={{
					width: 32,
					height: 32,
					borderRadius: "50%",
					background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
					color: "#fff",
					fontSize: 11,
					fontWeight: 800,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					flexShrink: 0,
					boxShadow: "0 2px 6px rgba(99,102,241,0.4)",
					letterSpacing: "-0.5px",
				}}
			>
				#{globalRank}
			</div>

			{/* Thumbnail */}
			{product.mainImage ? (
				<div style={{ width: 44, height: 44, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: "#f5f5f5" }}>
					<Image
						src={product.mainImage}
						alt={product.title}
						width={44}
						height={44}
						style={{ objectFit: "cover", width: "100%", height: "100%" }}
					/>
				</div>
			) : (
				<div
					style={{
						width: 44,
						height: 44,
						borderRadius: 8,
						background: "linear-gradient(135deg, #e5e7eb, #d1d5db)",
						flexShrink: 0,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						fontSize: 18,
					}}
				>
					📦
				</div>
			)}

			{/* Info */}
			<div style={{ flex: 1, minWidth: 0 }}>
				<div style={{ fontWeight: 700, fontSize: 13.5, color: "#1a1a2e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
					{product.title || "—"}
				</div>
				<div style={{ display: "flex", gap: 8, marginTop: 3, flexWrap: "wrap" }}>
					{product.price != null && (
						<span style={{ fontSize: 11.5, color: "#374151", fontWeight: 600, background: "#f0fdf4", borderRadius: 4, padding: "1px 6px" }}>
							₹{Math.round(product.price).toLocaleString()}
						</span>
					)}
					{product.stock != null && (
						<span style={{ fontSize: 11.5, color: "#374151", fontWeight: 600, background: "#fef9c3", borderRadius: 4, padding: "1px 6px" }}>
							Stock: {product.stock}
						</span>
					)}
					{product.gender && (
						<span style={{ fontSize: 11.5, color: "#374151", fontWeight: 600, background: "#f0f4ff", borderRadius: 4, padding: "1px 6px", textTransform: "capitalize" }}>
							{product.gender}
						</span>
					)}
				</div>
			</div>

			{/* Actions */}
			<div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
				<button
					className="admin-btn"
					onClick={(e) => { e.stopPropagation(); onEdit(); }}
					title="Edit product"
				>
					Edit
				</button>
				<button
					className="admin-btn admin-btn-danger"
					onClick={(e) => { e.stopPropagation(); onDelete(); }}
					title="Delete product"
				>
					Delete
				</button>
			</div>
		</div>
	);
}

// ─── main component ───────────────────────────────────────────────────────────

export default function AdminProductsTab({ products, onEdit, onDelete }: AdminProductsTabProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [genderFilter, setGenderFilter] = useState("all");
	const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
	const [collapsedSubcategories, setCollapsedSubcategories] = useState<Set<string>>(new Set());

	// Drag state
	const [draggingId, setDraggingId] = useState<string | null>(null);
	const [dragOverId, setDragOverId] = useState<string | null>(null);

	// Local ordered copy of products (used for drag reorder preview)
	const [localProducts, setLocalProducts] = useState<DraggableProduct[]>([]);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const [saving, setSaving] = useState(false);
	const [saveMsg, setSaveMsg] = useState<string | null>(null);

	// Sync whenever parent products array changes (fresh load)
	useEffect(() => {
		const sorted = [...products]
			.sort((a, b) => (b.displayOrder ?? 0) - (a.displayOrder ?? 0))
			.map((p, i) => ({ ...p, _localOrder: products.length - i }));
		setLocalProducts(sorted);
		setHasUnsavedChanges(false);
	}, [products]);

	// ── filtering ────────────────────────────────────────────────────────────
	const filteredProducts = useMemo(() => {
		return localProducts.filter((p) => {
			const matchesSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesGender = genderFilter === "all" || p.gender === genderFilter;
			return matchesSearch && matchesGender;
		});
	}, [localProducts, searchQuery, genderFilter]);

	// ── group by category → subcategory ──────────────────────────────────────
	const grouped = useMemo(() => {
		// Map: catId → { name, subs: Map<subId → { name, items }> }
		const catMap = new Map<string, { name: string; subs: Map<string, { name: string; items: DraggableProduct[] }> }>();

		for (const p of filteredProducts) {
			const catId = getCategoryId(p.category);
			const catName = getCategoryName(p.category);
			const subId = getSubCategoryId(p.subCategory);
			const subName = getSubCategoryName(p.subCategory);

			if (!catMap.has(catId)) {
				catMap.set(catId, { name: catName, subs: new Map() });
			}
			const catEntry = catMap.get(catId)!;
			if (!catEntry.subs.has(subId)) {
				catEntry.subs.set(subId, { name: subName, items: [] });
			}
			catEntry.subs.get(subId)!.items.push(p);
		}

		return catMap;
	}, [filteredProducts]);

	// ── compute global rank across ALL local products (not just filtered) ─────
	// Rank = position in overall localProducts array (1 = highest rank = shown first)
	const globalRankMap = useMemo(() => {
		const map = new Map<string, number>();
		localProducts.forEach((p, i) => map.set(p._id, i + 1));
		return map;
	}, [localProducts]);

	// ── drag handlers ─────────────────────────────────────────────────────────
	const handleDragStart = useCallback((id: string) => {
		setDraggingId(id);
	}, []);

	const handleDragEnter = useCallback((id: string) => {
		setDragOverId(id);
	}, []);

	const handleDragEnd = useCallback(() => {
		if (draggingId && dragOverId && draggingId !== dragOverId) {
			setLocalProducts((prev) => {
				const next = [...prev];
				const fromIdx = next.findIndex((p) => p._id === draggingId);
				const toIdx = next.findIndex((p) => p._id === dragOverId);
				if (fromIdx === -1 || toIdx === -1) return prev;
				const [moved] = next.splice(fromIdx, 1);
				next.splice(toIdx, 0, moved);
				return next;
			});
			setHasUnsavedChanges(true);
		}
		setDraggingId(null);
		setDragOverId(null);
	}, [draggingId, dragOverId]);

	// ── save ranking to backend ───────────────────────────────────────────────
	const handleSaveRanking = async () => {
		setSaving(true);
		setSaveMsg(null);
		try {
			// Highest index in array = rank 1 displayed first (displayOrder: higher = first)
			const total = localProducts.length;
			const items = localProducts.map((p, i) => ({
				id: p._id,
				displayOrder: total - i, // first in array gets highest displayOrder
			}));
			await apiRequest("/admin/products/reorder", {
				method: "PUT",
				body: JSON.stringify({ items }),
			});
			setSaveMsg("✓ Ranking saved successfully!");
			setHasUnsavedChanges(false);
			setTimeout(() => setSaveMsg(null), 3000);
		} catch (err) {
			console.error(err);
			setSaveMsg("✗ Failed to save ranking. Please try again.");
		} finally {
			setSaving(false);
		}
	};

	// ── discard changes ───────────────────────────────────────────────────────
	const handleDiscard = () => {
		const sorted = [...products]
			.sort((a, b) => (b.displayOrder ?? 0) - (a.displayOrder ?? 0))
			.map((p, i) => ({ ...p, _localOrder: products.length - i }));
		setLocalProducts(sorted);
		setHasUnsavedChanges(false);
	};

	// ── toggle collapse ───────────────────────────────────────────────────────
	const toggleCategory = (catId: string) => {
		setCollapsedCategories((prev) => {
			const next = new Set(prev);
			next.has(catId) ? next.delete(catId) : next.add(catId);
			return next;
		});
	};
	const toggleSubcategory = (key: string) => {
		setCollapsedSubcategories((prev) => {
			const next = new Set(prev);
			next.has(key) ? next.delete(key) : next.add(key);
			return next;
		});
	};

	const totalFiltered = filteredProducts.length;

	return (
		<section className="admin-content">
			<div className="admin-panel" style={{ padding: "0 0 24px 0" }}>
				{/* ── Header ─────────────────────────────────────────── */}
				<div style={{ padding: "24px 24px 0 24px" }}>
					<div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
						<div>
							<h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#1a1a2e" }}>
								Products
								<span style={{ marginLeft: 10, fontSize: 13, fontWeight: 600, color: "#6366f1", background: "#ede9fe", borderRadius: 20, padding: "2px 10px" }}>
									{totalFiltered} shown
								</span>
							</h2>
							<p style={{ margin: "5px 0 0", fontSize: 13, color: "#6b7280" }}>
								Drag &amp; drop products within a category to reorder how they appear in the store.
								Higher position in the list = displayed first.
							</p>
						</div>

						{/* Save / Discard */}
						<div style={{ display: "flex", gap: 10, alignItems: "center" }}>
							{hasUnsavedChanges && (
								<button
									onClick={handleDiscard}
									style={{
										padding: "8px 18px",
										borderRadius: 8,
										border: "1.5px solid #d1d5db",
										background: "#fff",
										color: "#374151",
										fontWeight: 700,
										fontSize: 13,
										cursor: "pointer",
										fontFamily: "inherit",
									}}
								>
									Discard
								</button>
							)}
							<button
								onClick={handleSaveRanking}
								disabled={saving || !hasUnsavedChanges}
								style={{
									padding: "8px 22px",
									borderRadius: 8,
									border: "none",
									background: hasUnsavedChanges
										? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
										: "#e5e7eb",
									color: hasUnsavedChanges ? "#fff" : "#9ca3af",
									fontWeight: 800,
									fontSize: 13,
									cursor: hasUnsavedChanges ? "pointer" : "not-allowed",
									fontFamily: "inherit",
									display: "flex",
									alignItems: "center",
									gap: 7,
									boxShadow: hasUnsavedChanges ? "0 4px 12px rgba(99,102,241,0.35)" : "none",
									transition: "all 0.2s",
								}}
							>
								{saving ? (
									<>
										<span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
										Saving…
									</>
								) : (
									<>💾 Save Ranking</>
								)}
							</button>
						</div>
					</div>

					{/* Save message */}
					{saveMsg && (
						<div
							style={{
								marginBottom: 14,
								padding: "10px 16px",
								borderRadius: 8,
								background: saveMsg.startsWith("✓") ? "#f0fdf4" : "#fef2f2",
								border: `1px solid ${saveMsg.startsWith("✓") ? "#86efac" : "#fca5a5"}`,
								color: saveMsg.startsWith("✓") ? "#166534" : "#991b1b",
								fontWeight: 600,
								fontSize: 13,
							}}
						>
							{saveMsg}
						</div>
					)}

					{/* Unsaved warning */}
					{hasUnsavedChanges && !saving && (
						<div
							style={{
								marginBottom: 14,
								padding: "8px 14px",
								borderRadius: 8,
								background: "#fffbeb",
								border: "1px solid #fcd34d",
								color: "#92400e",
								fontWeight: 600,
								fontSize: 12.5,
								display: "flex",
								alignItems: "center",
								gap: 8,
							}}
						>
							⚠️ You have unsaved ranking changes. Click &quot;Save Ranking&quot; to persist them.
						</div>
					)}

					{/* Filters */}
					<div className="admin-controls" style={{ marginBottom: 0 }}>
						<input
							type="text"
							className="admin-search"
							placeholder="Search products by title…"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
						<select className="admin-filter" value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
							<option value="all">All Genders</option>
							<option value="men">Men</option>
							<option value="women">Women</option>
							<option value="kids">Kids</option>
							<option value="unisex">Unisex</option>
						</select>
					</div>
				</div>

				{/* ── Category Groups ─────────────────────────────────── */}
				<div style={{ padding: "18px 24px 0 24px" }}>
					{grouped.size === 0 ? (
						<div
							style={{
								textAlign: "center",
								padding: "48px 24px",
								color: "#9ca3af",
								fontSize: 14,
								fontWeight: 600,
							}}
						>
							No products found.
						</div>
					) : (
						Array.from(grouped.entries()).map(([catId, { name: catName, subs }]) => {
							const isCatCollapsed = collapsedCategories.has(catId);
							const catProductCount = Array.from(subs.values()).reduce((s, sub) => s + sub.items.length, 0);

							return (
								<div
									key={catId}
									style={{
										marginBottom: 24,
										border: "1.5px solid #e5e7eb",
										borderRadius: 16,
										overflow: "hidden",
										boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
									}}
								>
									{/* Category header */}
									<button
										onClick={() => toggleCategory(catId)}
										style={{
											width: "100%",
											display: "flex",
											alignItems: "center",
											justifyContent: "space-between",
											padding: "14px 20px",
											background: "linear-gradient(135deg, #f8f9ff 0%, #f0f0ff 100%)",
											border: "none",
											borderBottom: isCatCollapsed ? "none" : "1.5px solid #e5e7eb",
											cursor: "pointer",
											fontFamily: "inherit",
										}}
									>
										<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
											<span style={{ fontSize: 20 }}>📁</span>
											<span style={{ fontSize: 16, fontWeight: 800, color: "#1a1a2e" }}>{catName}</span>
											<span
												style={{
													fontSize: 12,
													fontWeight: 700,
													color: "#6366f1",
													background: "#ede9fe",
													borderRadius: 20,
													padding: "2px 10px",
												}}
											>
												{catProductCount} products
											</span>
										</div>
										<span
											style={{
												fontSize: 18,
												color: "#6b7280",
												transform: isCatCollapsed ? "rotate(-90deg)" : "rotate(0deg)",
												transition: "transform 0.2s",
											}}
										>
											▾
										</span>
									</button>

									{/* Subcategories */}
									{!isCatCollapsed && (
										<div style={{ padding: "12px 16px 4px 16px" }}>
											{Array.from(subs.entries()).map(([subId, { name: subName, items }]) => {
												const subKey = `${catId}::${subId}`;
												const isSubCollapsed = collapsedSubcategories.has(subKey);

												return (
													<div key={subId} style={{ marginBottom: 14 }}>
														{/* Sub-category header */}
														<button
															onClick={() => toggleSubcategory(subKey)}
															style={{
																width: "100%",
																display: "flex",
																alignItems: "center",
																justifyContent: "space-between",
																padding: "8px 14px",
																background: isSubCollapsed ? "#f9fafb" : "#fff",
																border: "1px solid #e5e7eb",
																borderRadius: 10,
																cursor: "pointer",
																marginBottom: isSubCollapsed ? 0 : 8,
																fontFamily: "inherit",
															}}
														>
															<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
																<span style={{ fontSize: 15 }}>📂</span>
																<span style={{ fontSize: 13.5, fontWeight: 700, color: "#374151" }}>{subName}</span>
																<span
																	style={{
																		fontSize: 11,
																		fontWeight: 700,
																		color: "#059669",
																		background: "#d1fae5",
																		borderRadius: 20,
																		padding: "1px 8px",
																	}}
																>
																	{items.length}
																</span>
															</div>
															<span
																style={{
																	fontSize: 14,
																	color: "#9ca3af",
																	transform: isSubCollapsed ? "rotate(-90deg)" : "rotate(0deg)",
																	transition: "transform 0.2s",
																}}
															>
																▾
															</span>
														</button>

														{/* Product cards (drag target) */}
														{!isSubCollapsed && (
															<div
																onDragOver={(e) => e.preventDefault()}
																style={{
																	minHeight: 56,
																	padding: "4px 4px 2px 4px",
																	borderRadius: 10,
																	background: draggingId ? "rgba(99,102,241,0.03)" : "transparent",
																	border: draggingId ? "1.5px dashed #c4b5fd" : "1.5px solid transparent",
																	transition: "all 0.2s",
																}}
															>
																{items.map((product) => (
																	<ProductCard
																		key={product._id}
																		product={product}
																		globalRank={globalRankMap.get(product._id) ?? 0}
																		isDragging={draggingId === product._id}
																		dragOver={dragOverId === product._id && draggingId !== product._id}
																		onDragStart={() => handleDragStart(product._id)}
																		onDragEnter={() => handleDragEnter(product._id)}
																		onDragEnd={handleDragEnd}
																		onEdit={() => onEdit(product)}
																		onDelete={() => onDelete(product._id)}
																	/>
																))}
																{items.length === 0 && (
																	<div style={{ padding: "14px 10px", color: "#9ca3af", fontSize: 13, fontStyle: "italic" }}>
																		No products in this sub-category.
																	</div>
																)}
															</div>
														)}
													</div>
												);
											})}
										</div>
									)}
								</div>
							);
						})
					)}
				</div>

				{/* Sticky bottom save bar (when changes pending) */}
				{hasUnsavedChanges && (
					<div
						style={{
							position: "sticky",
							bottom: 0,
							zIndex: 20,
							background: "rgba(255,255,255,0.97)",
							backdropFilter: "blur(8px)",
							borderTop: "1.5px solid #e5e7eb",
							padding: "12px 24px",
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							gap: 12,
							boxShadow: "0 -4px 24px rgba(0,0,0,0.08)",
						}}
					>
						<span style={{ fontSize: 13, fontWeight: 600, color: "#92400e" }}>
							⚠️ Unsaved ranking changes
						</span>
						<div style={{ display: "flex", gap: 10 }}>
							<button
								onClick={handleDiscard}
								style={{
									padding: "8px 18px",
									borderRadius: 8,
									border: "1.5px solid #d1d5db",
									background: "#fff",
									color: "#374151",
									fontWeight: 700,
									fontSize: 13,
									cursor: "pointer",
									fontFamily: "inherit",
								}}
							>
								Discard
							</button>
							<button
								onClick={handleSaveRanking}
								disabled={saving}
								style={{
									padding: "8px 22px",
									borderRadius: 8,
									border: "none",
									background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
									color: "#fff",
									fontWeight: 800,
									fontSize: 13,
									cursor: "pointer",
									fontFamily: "inherit",
									display: "flex",
									alignItems: "center",
									gap: 7,
									boxShadow: "0 4px 12px rgba(99,102,241,0.35)",
								}}
							>
								{saving ? "Saving…" : "💾 Save Ranking"}
							</button>
						</div>
					</div>
				)}
			</div>

			{/* Spin keyframe */}
			<style>{`
				@keyframes spin { to { transform: rotate(360deg); } }
			`}</style>
		</section>
	);
}