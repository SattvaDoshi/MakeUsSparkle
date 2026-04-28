import { FormEvent, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

type TaxonomyItem = { _id: string; title: string; category?: { _id: string } | string; };

type AdminProductModalProps = {
	mode: "create" | "edit";
	initialData?: any;
	onClose: () => void;
	onSuccess: (message: string) => void;
};

export default function AdminProductModal({ mode, initialData, onClose, onSuccess }: AdminProductModalProps) {
	const [step, setStep] = useState(1);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [categories, setCategories] = useState<TaxonomyItem[]>([]);
	const [subCategories, setSubCategories] = useState<TaxonomyItem[]>([]);
	const [styles, setStyles] = useState<TaxonomyItem[]>([]);
	const [allTags, setAllTags] = useState<string[]>([]);
	const [newTagInput, setNewTagInput] = useState("");
	
	const [imageFiles, setImageFiles] = useState<File[]>([]);

	const [form, setForm] = useState({
		title: initialData?.title || "",
		category: initialData?.category?._id || initialData?.category || "",
		subCategory: initialData?.subCategory?._id || initialData?.subCategory || "",
		style: initialData?.style?._id || initialData?.style || "",
		gender: initialData?.gender || "unisex",
		price: initialData?.price?.toString() || "",
		discountedPrice: initialData?.discountedPrice?.toString() || "",
		discountTag: initialData?.discountTag || "",
		stock: initialData?.stock?.toString() || "",
		description: initialData?.description || "",
		about: initialData?.about || "",
		tags: initialData?.tags || [],
		images: initialData?.images || [],
	});

	useEffect(() => {
		const fetchTaxonomy = async () => {
			try {
				const [cats, subs, stys, tRes] = await Promise.all([
					apiRequest<{ success: boolean; categories: TaxonomyItem[] }>("/categories"),
					apiRequest<{ success: boolean; subcategories: TaxonomyItem[] }>("/subcategories"),
					apiRequest<{ success: boolean; styles: TaxonomyItem[] }>("/styles"),
					apiRequest<{ success: boolean; tags: string[] }>("/products/tags"),
				]);
				setCategories(cats.categories || []);
				setSubCategories(subs.subcategories || []);
				setStyles(stys.styles || []);
				setAllTags(tRes.tags || []);
			} catch (err) {
				console.error("Failed to load taxonomy", err);
			}
		};
		void fetchTaxonomy();
	}, []);

	// Filter subcategories by the selected category to provide relevant options only
	const filteredSubCategories = subCategories.filter(sc => {
		if (!form.category) return true;
		const catId = typeof sc.category === 'object' ? sc.category?._id : sc.category;
		return catId === form.category;
	});

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

	const removeImageFile = (index: number) => {
		setImageFiles((prev) => prev.filter((_, i) => i !== index));
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setError(null);
		setLoading(true);
		
		const formData = new FormData();
		formData.append("title", form.title);
		formData.append("description", form.description);
		formData.append("about", form.about);
		formData.append("price", String(form.price));
		if (form.discountedPrice) formData.append("discountedPrice", String(form.discountedPrice));
		if (form.discountTag) formData.append("discountTag", form.discountTag);
		formData.append("stock", String(form.stock));
		formData.append("gender", form.gender);
		
		if (form.category) formData.append("category", form.category);
		if (form.subCategory) formData.append("subCategory", form.subCategory);
		if (form.style) formData.append("style", form.style);
		
		form.tags.forEach((t: string | Blob) => formData.append("tags", t));
		form.images.forEach((img: string | Blob) => formData.append("existingImages", img));
		imageFiles.forEach(file => formData.append("images", file));

		try {
			if (mode === "edit" && initialData?.id) {
				await apiRequest(`/admin/products/${initialData.id}`, {
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
		} catch (err) {
			setError(err instanceof Error ? err.message : "Request failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="admin-modal-backdrop" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', background: 'rgba(26, 31, 15, 0.6)', backdropFilter: 'blur(4px)' }}>
			<div className="admin-modal" style={{ maxWidth: '680px', width: '100%', maxHeight: '85vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', backgroundColor: '#fafaf7', borderRadius: '12px', boxShadow: '0 24px 48px rgba(0,0,0,0.15)' }} onClick={(event) => event.stopPropagation()}>
				{/* Header */}
				<div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(74, 92, 34, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff' }}>
					<div>
						<h3 style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: '1.4rem', color: '#1a1f0f' }}>
							{mode === "edit" ? "Edit Product" : "Add New Product"}
						</h3>
						<p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#6b6b60' }}>Step {step} of 2 &bull; {step === 1 ? "Basic Details" : "Pricing & Descriptions"}</p>
					</div>
					<button className="admin-btn admin-btn-muted" type="button" onClick={onClose} style={{ background: 'transparent', color: '#6b6b60', border: '1px solid currentColor', padding: '0.4rem 1rem' }}>Close</button>
				</div>
				
				{/* Content area: Scrollable */}
				<div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
					{error && <div style={{ padding: '0.8rem', background: '#ffebee', color: '#c62828', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{error}</div>}
					
					<form id="product-form" onSubmit={(e) => { e.preventDefault(); if(step === 2) handleSubmit(e); else setStep(2); }}>
						{step === 1 && (
							<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
								<div className="input-group" style={{ gridColumn: '1 / -1', display: 'grid', gap: '0.4rem' }}>
									<label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3d4a20' }}>Product Title *</label>
									<input placeholder="Enter product title..." value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required style={{ padding: '0.7rem', border: '1px solid #d4d4c8', borderRadius: '6px', fontSize: '0.95rem' }} />
								</div>
								
								<div className="input-group" style={{ display: 'grid', gap: '0.4rem' }}>
									<label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3d4a20' }}>Gender Focus</label>
									<select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} style={{ padding: '0.7rem', border: '1px solid #d4d4c8', borderRadius: '6px', fontSize: '0.95rem', background: '#fff' }}>
										<option value="unisex">Unisex</option>
										<option value="female">Female</option>
										<option value="male">Male</option>
									</select>
								</div>

								<div className="input-group" style={{ display: 'grid', gap: '0.4rem' }}>
									<label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3d4a20' }}>Category</label>
									<select value={form.category} onChange={(e) => { setForm({ ...form, category: e.target.value, subCategory: "" }); }} style={{ padding: '0.7rem', border: '1px solid #d4d4c8', borderRadius: '6px', fontSize: '0.95rem', background: '#fff' }}>
										<option value="">Select Category...</option>
										{categories.map((c: any) => <option key={c._id} value={c._id}>{c.name || c.title}</option>)}
									</select>
								</div>

								<div className="input-group" style={{ display: 'grid', gap: '0.4rem' }}>
									<label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3d4a20' }}>Sub Category</label>
									<select value={form.subCategory} onChange={(e) => setForm({ ...form, subCategory: e.target.value })} disabled={!form.category && filteredSubCategories.length === 0} style={{ padding: '0.7rem', border: '1px solid #d4d4c8', borderRadius: '6px', fontSize: '0.95rem', background: '#fff', opacity: (!form.category && filteredSubCategories.length === 0) ? 0.6 : 1 }}>
										<option value="">Select Sub Category...</option>
										{filteredSubCategories.map((c: any) => <option key={c._id} value={c._id}>{c.name || c.title}</option>)}
									</select>
								</div>

								<div className="input-group" style={{ display: 'grid', gap: '0.4rem' }}>
									<label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3d4a20' }}>Style</label>
									<select value={form.style} onChange={(e) => setForm({ ...form, style: e.target.value })} style={{ padding: '0.7rem', border: '1px solid #d4d4c8', borderRadius: '6px', fontSize: '0.95rem', background: '#fff' }}>
										<option value="">Select Style...</option>
										{styles.map((c: any) => <option key={c._id} value={c._id}>{c.name || c.title}</option>)}
									</select>
								</div>
							</div>
						)}

						{step === 2 && (
							<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
								<div className="input-group" style={{ display: 'grid', gap: '0.4rem', gridColumn: '1 / -1' }}>
									<label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3d4a20' }}>Price (INR) *</label>
									<input placeholder="0" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required style={{ padding: '0.7rem', border: '1px solid #d4d4c8', borderRadius: '6px', fontSize: '0.95rem' }} />
								</div>
								
								<div className="input-group" style={{ display: 'grid', gap: '0.4rem' }}>
									<label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3d4a20' }}>Discounted Price (INR)</label>
									<input placeholder="0 (Optional)" type="number" value={form.discountedPrice} onChange={(e) => setForm({ ...form, discountedPrice: e.target.value })} style={{ padding: '0.7rem', border: '1px solid #d4d4c8', borderRadius: '6px', fontSize: '0.95rem' }} />
								</div>
								
								<div className="input-group" style={{ display: 'grid', gap: '0.4rem' }}>
									<label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3d4a20' }}>Discount Tag</label>
									<input placeholder="e.g. 20% OFF or Limited Time Deal" value={form.discountTag} onChange={(e) => setForm({ ...form, discountTag: e.target.value })} style={{ padding: '0.7rem', border: '1px solid #d4d4c8', borderRadius: '6px', fontSize: '0.95rem' }} />
								</div>

								<div className="input-group" style={{ display: 'grid', gap: '0.4rem', gridColumn: '1 / -1' }}>
									<label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3d4a20' }}>Stock Count *</label>
									<input placeholder="0" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required style={{ padding: '0.7rem', border: '1px solid #d4d4c8', borderRadius: '6px', fontSize: '0.95rem' }} />
								</div>
								
								<div className="input-group" style={{ gridColumn: '1 / -1', display: 'grid', gap: '0.4rem' }}>
									<label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3d4a20' }}>Images</label>
									<div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
										{form.images.map((img: string) => (
											<span key={img} style={{ background: '#f5f4ef', border: '1px solid #d4d4c8', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1c1c1a' }}>
												<span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{img}</span>
												<button type="button" onClick={() => setForm((prev) => ({ ...prev, images: prev.images.filter((i: string) => i !== img) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#943b2a', padding: 0 }}>&times;</button>
											</span>
										))}
										{imageFiles.map((file, i) => (
											<span key={i} style={{ background: '#e8ead0', border: '1px solid #b5c27a', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1c1c1a' }}>
												<span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
												<button type="button" onClick={() => removeImageFile(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#943b2a', padding: 0 }}>&times;</button>
											</span>
										))}
									</div>
									<div style={{ display: 'flex', gap: '0.5rem' }}>
										<input 
											type="file"
											multiple
											accept="image/*"
											onChange={(e) => {
												if (e.target.files) {
													setImageFiles(prev => [...prev, ...Array.from(e.target.files!)]);
												}
											}}
											style={{ flex: 1, padding: '0.4rem', border: '1px solid #d4d4c8', borderRadius: '6px', fontSize: '0.95rem' }}
										/>
									</div>
								</div>

								<div className="input-group" style={{ gridColumn: '1 / -1', display: 'grid', gap: '0.4rem' }}>
									<label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3d4a20' }}>Tags</label>
									<div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
										{form.tags.map((t: string) => (
											<span key={t} style={{ background: '#e8ead0', color: '#2d3318', padding: '0.3rem 0.6rem', borderRadius: '100px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}>
												{t} <button type="button" onClick={() => removeTag(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#943b2a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&times;</button>
											</span>
										))}
									</div>
									<div style={{ display: 'flex', gap: '0.5rem' }}>
										<input 
											placeholder="Type tag and press enter..." 
											value={newTagInput} 
											onChange={(e) => setNewTagInput(e.target.value)}
											onKeyDown={(e) => {
												if (e.key === 'Enter') {
													e.preventDefault();
													addTag(newTagInput);
												}
											}}
											list="available-tags"
											style={{ flex: 1, padding: '0.7rem', border: '1px solid #d4d4c8', borderRadius: '6px', fontSize: '0.95rem' }}
										/>
										<datalist id="available-tags">
											{allTags.map(t => <option key={t} value={t} />)}
										</datalist>
										<button type="button" onClick={() => addTag(newTagInput)} style={{ padding: '0.7rem', background: '#4a5c22', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 500, cursor: 'pointer' }}>Add Tag</button>
									</div>
								</div>

								<div className="input-group" style={{ gridColumn: '1 / -1', display: 'grid', gap: '0.4rem' }}>
									<label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3d4a20' }}>Short Description</label>
									<textarea placeholder="Write a short summary..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} style={{ padding: '0.7rem', border: '1px solid #d4d4c8', borderRadius: '6px', fontSize: '0.95rem', resize: 'vertical' }} />
								</div>

								<div className="input-group" style={{ gridColumn: '1 / -1', display: 'grid', gap: '0.4rem' }}>
									<label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3d4a20' }}>Detailed About (HTML)</label>
									<textarea placeholder="Write full details..." value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} rows={4} style={{ padding: '0.7rem', border: '1px solid #d4d4c8', borderRadius: '6px', fontSize: '0.95rem', resize: 'vertical' }} />
								</div>
							</div>
						)}
					</form>
				</div>
				
				{/* Footer with actions */}
				<div style={{ padding: '1.2rem 1.5rem', borderTop: '1px solid rgba(74, 92, 34, 0.1)', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<button type="button" onClick={() => step === 2 ? setStep(1) : onClose()} disabled={loading} style={{ padding: '0.6rem 1.2rem', background: 'transparent', border: '1px solid #6b7c3a', color: '#4a5c22', borderRadius: '6px', fontWeight: 500, cursor: 'pointer', transition: '0.2s', opacity: loading ? 0.5 : 1 }}>
						{step === 2 ? "Back to Step 1" : "Cancel"}
					</button>
					
					<button type="submit" form="product-form" disabled={loading} style={{ padding: '0.6rem 1.5rem', background: '#4a5c22', color: '#f5e6b8', border: 'none', borderRadius: '6px', fontWeight: 600, letterSpacing: '0.05em', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: loading ? 0.7 : 1 }}>
						{step === 1 ? "Continue" : loading ? "Saving..." : mode === "edit" ? "Save Changes" : "Publish Product"}
					</button>
				</div>
			</div>
		</div>
	);
}
