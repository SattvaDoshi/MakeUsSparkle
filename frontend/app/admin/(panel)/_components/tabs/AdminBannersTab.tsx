import { useState, useMemo, useEffect } from "react";
import type { AdminBanner, MainBanner } from "../../_lib/admin.types";

type AdminHomeContent = {
	marqueeItems: string[];
	secondMarqueeItems?: string[];
	heroContent: {
		women?: { image?: string };
		men?: { image?: string };
		kids?: { image?: string };
	};
	promoBanners?: {
		_id?: string;
		tag?: string;
		headline?: string;
		cta?: string;
		link?: string;
		image?: string;
		textSide?: "left" | "right";
	}[];
	genderContent?: {
		women?: {
			styleHeading?: string;
			promoBanners?: {
				tag?: string;
				headline?: string;
				cta?: string;
				link?: string;
				image?: string;
				textSide?: "left" | "right";
			}[];
		};
		men?: {
			styleHeading?: string;
			promoBanners?: {
				tag?: string;
				headline?: string;
				cta?: string;
				link?: string;
				image?: string;
				textSide?: "left" | "right";
			}[];
		};
		kids?: {
			styleHeading?: string;
			promoBanners?: {
				tag?: string;
				headline?: string;
				cta?: string;
				link?: string;
				image?: string;
				textSide?: "left" | "right";
			}[];
		};
	};
};

type AdminBannersTabProps = {
	banners: AdminBanner[];
	mainBanners: MainBanner[];
	homeContent: AdminHomeContent | null;
	onEdit: (banner: AdminBanner) => void;
	onDelete: (id: string) => void;
	onCreateMainBanner: (payload: FormData) => Promise<void>;
	onUpdateMainBanner: (id: string, payload: FormData) => Promise<void>;
	onDeleteMainBanner: (id: string) => void;
	onUpdateHomeContent: (payload: FormData) => Promise<void>;
	onAddPromoBanner: () => void;
};

export default function AdminBannersTab({
	banners,
	mainBanners,
	homeContent,
	onEdit,
	onDelete,
	onCreateMainBanner,
	onUpdateMainBanner,
	onDeleteMainBanner,
	onUpdateHomeContent,
	onAddPromoBanner,
}: AdminBannersTabProps) {
	const [mainLink, setMainLink] = useState("");
	const [mainIsActive, setMainIsActive] = useState(true);
	const [mainImageFile, setMainImageFile] = useState<File | null>(null);
	const [editingMainId, setEditingMainId] = useState<string | null>(null);

	const [bannerSearch, setBannerSearch] = useState("");
	const [bannerFilter, setBannerFilter] = useState("all");

	// Hero Content & Moving Lines States
	const [marqueeItems, setMarqueeItems] = useState<string>("");
	const [secondMarqueeItems, setSecondMarqueeItems] = useState<string>("");
	const [womenImageFile, setWomenImageFile] = useState<File | null>(null);
	const [menImageFile, setMenImageFile] = useState<File | null>(null);
	const [kidsImageFile, setKidsImageFile] = useState<File | null>(null);

	// Promo Banners States
	const defaultPromo = { tag: "", headline: "", cta: "", link: "", textSide: "right" as const };
	const [promoBanners, setPromoBanners] = useState<any[]>([defaultPromo, defaultPromo]);
	const [promoImageFiles, setPromoImageFiles] = useState<(File | null)[]>([null, null]);

	const [styleHeading, setStyleHeading] = useState<string>("");

	const [activeGender, setActiveGender] = useState<"women" | "men" | "kids">("women");

	useEffect(() => {
		if (homeContent) {
			setMarqueeItems(homeContent.marqueeItems?.join(", ") || "");
			setSecondMarqueeItems(
				homeContent.secondMarqueeItems && homeContent.secondMarqueeItems.length > 0
					? homeContent.secondMarqueeItems.join(", ")
					: homeContent.marqueeItems?.join(", ") || ""
			);
			setStyleHeading(homeContent.genderContent?.[activeGender]?.styleHeading || "");
			const genderPromoBanners = homeContent.genderContent?.[activeGender]?.promoBanners || homeContent.promoBanners;
			if (genderPromoBanners && genderPromoBanners.length > 0) {
				setPromoBanners([
					genderPromoBanners[0] || defaultPromo,
					genderPromoBanners[1] || defaultPromo,
				]);
			} else {
				setPromoBanners([
					{ tag: "Gift Combos", headline: "FLAT 50%\nOFF", cta: "Shop Now", link: "/categories/women/gift-boxes", textSide: "right" },
					{ tag: "Custom Charm", headline: "DESIGN\nYOUR STORY", cta: "Customise", link: "/categories/women/custom-charm", textSide: "right" }
				]);
			}
		}
	}, [homeContent, activeGender]);

	const filteredBanners = useMemo(() => {
		return banners.filter((b) => {
			const q = bannerSearch.toLowerCase();
			const matchesSearch = !q || b.title?.toLowerCase().includes(q) || b.text?.toLowerCase().includes(q);
			const activeStatus = b.isActive === false ? "inactive" : "active";
			const matchesActive = bannerFilter === "all" || activeStatus === bannerFilter;
			return matchesSearch && matchesActive;
		});
	}, [banners, bannerSearch, bannerFilter]);

	const resetMainForm = () => {
		setMainLink("");
		setMainIsActive(true);
		setMainImageFile(null);
		setEditingMainId(null);
	};

	const handleMainSubmit = async () => {
		const formData = new FormData();
		formData.append("link", mainLink);
		formData.append("isActive", String(mainIsActive));
		if (mainImageFile) {
			formData.append("image", mainImageFile);
		}

		if (editingMainId) {
			await onUpdateMainBanner(editingMainId, formData);
		} else {
			if (!mainImageFile) {
				window.alert("Please select an image");
				return;
			}
			await onCreateMainBanner(formData);
		}

		resetMainForm();
	};

	const startEditMain = (banner: MainBanner) => {
		setEditingMainId(banner._id);
		setMainLink(banner.link || "");
		setMainIsActive(banner.isActive !== false);
		setMainImageFile(null);
	};

	const handleToggleMain = async (banner: MainBanner) => {
		const formData = new FormData();
		formData.append("link", banner.link || "");
		formData.append("isActive", String(!(banner.isActive !== false)));
		await onUpdateMainBanner(banner._id, formData);
	};

	const handleHomeContentSubmit = async () => {
		const formData = new FormData();
		
		const parsedMarquee = marqueeItems
			.split(",")
			.map((item) => item.trim())
			.filter(Boolean);
		formData.append("marqueeItems", JSON.stringify(parsedMarquee));

		const parsedSecondMarquee = secondMarqueeItems
			.split(",")
			.map((item) => item.trim())
			.filter(Boolean);
		formData.append("secondMarqueeItems", JSON.stringify(parsedSecondMarquee));

		formData.append("promoBanners", JSON.stringify(promoBanners));
		formData.append("gender", activeGender);
		formData.append("styleHeading", styleHeading);

		if (womenImageFile) formData.append("women", womenImageFile);
		if (menImageFile) formData.append("men", menImageFile);
		if (kidsImageFile) formData.append("kids", kidsImageFile);
		
		const promo0Key = `${activeGender}_promoImage_0`;
		const promo1Key = `${activeGender}_promoImage_1`;
		if (promoImageFiles[0]) formData.append(promo0Key, promoImageFiles[0]);
		if (promoImageFiles[1]) formData.append(promo1Key, promoImageFiles[1]);

		await onUpdateHomeContent(formData);
		setWomenImageFile(null);
		setMenImageFile(null);
		setKidsImageFile(null);
		setPromoImageFiles([null, null]);
	};

	const updatePromoBanner = (index: number, field: string, value: string) => {
		setPromoBanners(prev => {
			const newBanners = [...prev];
			newBanners[index] = { ...newBanners[index], [field]: value };
			return newBanners;
		});
	};

	return (
		<section className="admin-content">
			<div className="admin-panel">
				<h2>Moving Lines (Marquees)</h2>
				<div className="admin-form-grid" style={{ marginBottom: "1.5rem" }}>
					<div className="admin-form-group" style={{ gridColumn: "1 / -1" }}>
						<label>Line 1: Top Moving Line (Under Header / Above Hero)</label>
						<textarea
							placeholder="Top line items (comma separated, e.g. ✦ Free Shipping above ₹999, ✦ Custom Jewellery, ✦ Free Gifts on all Orders)"
							value={marqueeItems}
							onChange={(e) => setMarqueeItems(e.target.value)}
							rows={2}
						/>
					</div>
					<div className="admin-form-group" style={{ gridColumn: "1 / -1" }}>
						<label>Line 2: Second Moving Line (Above Promo Banners / Combos)</label>
						<textarea
							placeholder="Second line items (comma separated, e.g. ✦ Free Shipping above ₹999, ✦ Custom Jewellery, ✦ Free Gifts on all Orders)"
							value={secondMarqueeItems}
							onChange={(e) => setSecondMarqueeItems(e.target.value)}
							rows={2}
						/>
					</div>
				</div>

				<h2>Hero Content</h2>
				<div className="admin-form-grid" style={{ marginBottom: "1rem" }}>
					<div>
						<label>Women Image</label>
						<input type="file" accept="image/*" onChange={(e) => setWomenImageFile(e.target.files?.[0] || null)} />
						{homeContent?.heroContent?.women?.image && <p style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>Current: {homeContent.heroContent.women.image}</p>}
					</div>
					<div>
						<label>Men Image</label>
						<input type="file" accept="image/*" onChange={(e) => setMenImageFile(e.target.files?.[0] || null)} />
						{homeContent?.heroContent?.men?.image && <p style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>Current: {homeContent.heroContent.men.image}</p>}
					</div>
					<div>
						<label>Kids Image</label>
						<input type="file" accept="image/*" onChange={(e) => setKidsImageFile(e.target.files?.[0] || null)} />
						{homeContent?.heroContent?.kids?.image && <p style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>Current: {homeContent.heroContent.kids.image}</p>}
					</div>
				</div>

				<div className="admin-inline-actions" style={{ marginBottom: "2rem" }}>
					<button className="admin-btn" type="button" onClick={() => void handleHomeContentSubmit()}>
						Save Moving Lines & Hero
					</button>
				</div>

				<h2 style={{ marginTop: "2rem", marginBottom: "1rem" }}>Gender Specific Content</h2>
				
				<div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
					{(["women", "men", "kids"] as const).map((g) => (
						<button
							key={g}
							type="button"
							onClick={() => setActiveGender(g)}
							style={{
								padding: "0.5rem 1rem",
								borderRadius: "6px",
								border: "1px solid #d4d4c8",
								background: activeGender === g ? "#4a5c22" : "#f9f9f7",
								color: activeGender === g ? "#fff" : "#3d4a20",
								cursor: "pointer",
								fontWeight: activeGender === g ? 600 : 400,
							}}
						>
							{g.charAt(0).toUpperCase() + g.slice(1)}
						</button>
					))}
				</div>

				<div className="admin-form-grid" style={{ marginBottom: "2rem", background: "#f9f9f7", padding: "1.5rem", borderRadius: "8px", border: "1px solid #e8e8e8" }}>
					<div className="admin-form-group">
						<label>Style Section Heading ({activeGender})</label>
						<input 
							placeholder="E.g. Shop by Your Style" 
							value={styleHeading} 
							onChange={(e) => setStyleHeading(e.target.value)} 
						/>
					</div>
				</div>

				<h3 style={{ marginBottom: "1rem" }}>Promo Banners (Under Hero) - {activeGender.charAt(0).toUpperCase() + activeGender.slice(1)}</h3>
				<div style={{ display: "flex", flexDirection: "column", gap: "2rem", marginBottom: "2rem" }}>
					{[0, 1].map((index) => (
						<div key={index} style={{ border: "1px solid #e8e8e8", padding: "1.5rem", borderRadius: "8px" }}>
							<h3 style={{ marginBottom: "1rem" }}>Banner {index + 1}</h3>
							<div className="admin-form-grid">
								<input 
									placeholder="Tag (e.g. Gift Combos)" 
									value={promoBanners[index].tag || ""} 
									onChange={(e) => updatePromoBanner(index, "tag", e.target.value)} 
								/>
								<input 
									placeholder="Headline (e.g. FLAT 50% OFF)" 
									value={promoBanners[index].headline || ""} 
									onChange={(e) => updatePromoBanner(index, "headline", e.target.value)} 
								/>
								<input 
									placeholder="CTA Text (e.g. Shop Now)" 
									value={promoBanners[index].cta || ""} 
									onChange={(e) => updatePromoBanner(index, "cta", e.target.value)} 
								/>
								<input 
									placeholder="Link URL" 
									value={promoBanners[index].link || ""} 
									onChange={(e) => updatePromoBanner(index, "link", e.target.value)} 
								/>
								<select 
									value={promoBanners[index].textSide || "right"} 
									onChange={(e) => updatePromoBanner(index, "textSide", e.target.value)}
								>
									<option value="right">Text on Right</option>
									<option value="left">Text on Left</option>
								</select>
								<div>
									<label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Image</label>
									<input 
										type="file" 
										accept="image/*" 
										onChange={(e) => {
											const file = e.target.files?.[0] || null;
											setPromoImageFiles(prev => {
												const newFiles = [...prev];
												newFiles[index] = file;
												return newFiles;
											});
										}} 
									/>
									{homeContent?.genderContent?.[activeGender]?.promoBanners?.[index]?.image || homeContent?.promoBanners?.[index]?.image ? (
										<p style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>Current image uploaded.</p>
									) : null}
								</div>
							</div>
						</div>
					))}
					<div className="admin-inline-actions">
						<button className="admin-btn" type="button" onClick={() => void handleHomeContentSubmit()}>
							Save Home & Promo Content
						</button>
					</div>
				</div>

				<div style={{ marginTop: "2rem" }}>
					<h2>Main Banner</h2>
				</div>
				<div className="admin-form-grid" style={{ marginBottom: "1rem" }}>
					<input
						type="file"
						accept="image/*"
						onChange={(event) => setMainImageFile(event.target.files?.[0] || null)}
					/>
					<input
						placeholder="Redirect Link"
						value={mainLink}
						onChange={(event) => setMainLink(event.target.value)}
					/>
					<label className="admin-checkbox">
						<input
							type="checkbox"
							checked={mainIsActive}
							onChange={(event) => setMainIsActive(event.target.checked)}
						/>
						Active
					</label>
					<div className="admin-inline-actions">
						<button className="admin-btn" type="button" onClick={() => void handleMainSubmit()}>
							{editingMainId ? "Update Main Banner" : "Add Main Banner"}
						</button>
						{editingMainId ? (
							<button className="admin-btn admin-btn-muted" type="button" onClick={resetMainForm}>
								Cancel
							</button>
						) : null}
					</div>
				</div>

				<div className="admin-table-wrap" style={{ marginBottom: "1.5rem" }}>
					<table className="admin-table">
						<thead><tr><th>Image</th><th>Link</th><th>Active</th><th>Actions</th></tr></thead>
						<tbody>
							{mainBanners.map((entry) => (
								<tr key={entry._id}>
									<td>{entry.image ? "Uploaded" : "-"}</td>
									<td>{entry.link || "-"}</td>
									<td>{entry.isActive === false ? "No" : "Yes"}</td>
									<td>
										<div className="admin-inline-actions">
											<button className="admin-btn" onClick={() => startEditMain(entry)}>Edit</button>
											<button className="admin-btn" onClick={() => void handleToggleMain(entry)}>
												{entry.isActive === false ? "Turn On" : "Turn Off"}
											</button>
											<button className="admin-btn admin-btn-danger" onClick={() => onDeleteMainBanner(entry._id)}>Delete</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				<div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
					<h2>General Banners List</h2>
					<button className="admin-btn" onClick={onAddPromoBanner}>Add Banner</button>
				</div>
				<div className="admin-controls">
					<input
						type="text"
						className="admin-search"
						placeholder="Search banners by title or text..."
						value={bannerSearch}
						onChange={(e) => setBannerSearch(e.target.value)}
					/>
					<select className="admin-filter" value={bannerFilter} onChange={(e) => setBannerFilter(e.target.value)}>
						<option value="all">All Statuses</option>
						<option value="active">Active</option>
						<option value="inactive">Inactive</option>
					</select>
				</div>
				<div className="admin-table-wrap">
					<table className="admin-table">
						<thead><tr><th>Title</th><th>Tag</th><th>Active</th><th>Order</th><th>Link</th><th>Actions</th></tr></thead>
						<tbody>
							{filteredBanners.map((entry) => (
								<tr key={entry._id}>
									<td>{entry.title || entry.text || "-"}</td>
									<td>{entry.tag || "-"}</td>
									<td>{entry.isActive === false ? "No" : "Yes"}</td>
									<td>{entry.sortOrder ?? 0}</td>
									<td>{entry.link || "-"}</td>
									<td>
										<div className="admin-inline-actions">
											<button className="admin-btn" onClick={() => onEdit(entry)}>Edit</button>
											<button className="admin-btn admin-btn-danger" onClick={() => onDelete(entry._id)}>Delete</button>
										</div>
									</td>
								</tr>
							))}
							{filteredBanners.length === 0 && (
								<tr><td colSpan={6} style={{ textAlign: "center" }}>No banners found.</td></tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</section>
	);
}