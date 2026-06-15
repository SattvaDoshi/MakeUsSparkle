import React, { useState, type FormEvent } from "react";

type AdminProduct = {
	_id: string;
	title: string;
	price?: number;
	mainImage?: string;
	images?: string[];
};

type NewArrivalsForm = {
	eyebrow: string;
	title: string;
	products: string[];
	isActive: boolean;
};

type AdminNewArrivalsTabProps = {
	form: NewArrivalsForm;
	products: AdminProduct[];
	onChange: (form: NewArrivalsForm) => void;
	onSubmit: (event: FormEvent) => void;
};

export default function AdminNewArrivalsTab({
	form,
	products,
	onChange,
	onSubmit,
}: AdminNewArrivalsTabProps) {
	const selected = new Set(form.products);

	const toggleProduct = (productId: string) => {
		onChange({
			...form,
			products: selected.has(productId)
				? form.products.filter((id) => id !== productId)
				: [...form.products, productId],
		});
	};

	const moveProduct = (productId: string, direction: -1 | 1) => {
		const currentIndex = form.products.indexOf(productId);
		const nextIndex = currentIndex + direction;
		if (currentIndex < 0 || nextIndex < 0 || nextIndex >= form.products.length) return;

		const nextProducts = [...form.products];
		[nextProducts[currentIndex], nextProducts[nextIndex]] = [nextProducts[nextIndex], nextProducts[currentIndex]];
		onChange({ ...form, products: nextProducts });
	};

	const getProductImage = (product: AdminProduct) => product.mainImage || product.images?.[0] || "";

	const [searchQuery, setSearchQuery] = useState("");

	const filteredProducts = React.useMemo(() => {
		return products.filter((product) => {
			if (!searchQuery) return true;
			return product.title?.toLowerCase().includes(searchQuery.toLowerCase());
		});
	}, [products, searchQuery]);

	return (
		<section className="admin-content">
			<form onSubmit={onSubmit} className="admin-panel" style={{ marginBottom: "2rem" }}>
				<h2>Section Settings</h2>
				<div className="admin-form-grid" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: "1.5rem" }}>
					<div className="admin-form-group">
						<label>Eyebrow Text</label>
						<input type="text" value={form.eyebrow} onChange={(e) => onChange({ ...form, eyebrow: e.target.value })} placeholder="e.g. WHAT'S NEW" />
					</div>
					<div className="admin-form-group">
						<label>Main Title</label>
						<input type="text" value={form.title} onChange={(e) => onChange({ ...form, title: e.target.value })} placeholder="e.g. New Arrivals" />
					</div>
				</div>
				<div className="admin-form-group" style={{ marginBottom: "1.5rem" }}>
					<label className="admin-checkbox">
						<input type="checkbox" checked={form.isActive} onChange={(e) => onChange({ ...form, isActive: e.target.checked })} />
						Show section on homepage
					</label>
				</div>
				<button type="submit" className="admin-btn">Save Changes</button>
			</form>

			<div className="admin-panel">
				<h2>Select Products ({selected.size} selected)</h2>
				
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
							{filteredProducts.map((product) => {
								const isSelected = selected.has(product._id);
								const selectedIndex = form.products.indexOf(product._id);
								const image = getProductImage(product);

								return (
									<tr key={product._id}>
										<td>
											<input
												type="checkbox"
												checked={isSelected}
												onChange={() => toggleProduct(product._id)}
												aria-label={`Select ${product.title || "product"}`}
											/>
										</td>
										<td>
											<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
												{image ? (
													// eslint-disable-next-line @next/next/no-img-element
													<img
														src={image}
														alt={product.title || "Product"}
														style={{ width: 44, height: 56, objectFit: "cover", borderRadius: 4 }}
													/>
												) : null}
												<span>{product.title || "-"}</span>
											</div>
										</td>
										<td>INR {Math.round(product.price || 0).toLocaleString()}</td>
										<td>
											{isSelected ? (
												<div className="admin-inline-actions">
													<span>#{selectedIndex + 1}</span>
													<button className="admin-btn admin-btn-muted" type="button" onClick={() => moveProduct(product._id, -1)}>Up</button>
													<button className="admin-btn admin-btn-muted" type="button" onClick={() => moveProduct(product._id, 1)}>Down</button>
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
		</section>
	);
}
