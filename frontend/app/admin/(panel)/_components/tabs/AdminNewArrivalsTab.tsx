import type { FormEvent } from "react";

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

	return (
		<section className="admin-content">
			<div className="admin-panel">
				<h2>New Arrivals</h2>
				<form className="admin-form-grid" onSubmit={onSubmit} style={{ marginBottom: "1.5rem" }}>
					<input
						placeholder="Eyebrow text"
						value={form.eyebrow}
						onChange={(event) => onChange({ ...form, eyebrow: event.target.value })}
					/>
					<input
						placeholder="Section title"
						value={form.title}
						onChange={(event) => onChange({ ...form, title: event.target.value })}
						required
					/>
					<label className="admin-checkbox">
						<input
							type="checkbox"
							checked={form.isActive}
							onChange={(event) => onChange({ ...form, isActive: event.target.checked })}
						/>
						Active
					</label>
					<div className="admin-inline-actions">
						<button className="admin-btn" type="submit">Save New Arrivals</button>
					</div>
				</form>

				<div className="admin-table-wrap">
					<table className="admin-table">
						<thead>
							<tr>
								<th>Select</th>
								<th>Product</th>
								<th>Price</th>
								<th>Order</th>
							</tr>
						</thead>
						<tbody>
							{products.map((product) => {
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
