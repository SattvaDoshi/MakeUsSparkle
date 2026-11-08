import { useCallback, useEffect, useState, type FormEvent } from "react";
import { apiRequest } from "@/lib/api";

type Founder = {
	isActive: boolean;
	desktopImage: string; desktopWidth: number; desktopHeight: number;
	mobileImage: string; mobileWidth: number; mobileHeight: number;
	alt: string; link: string;
};

type Props = { onError: (m: string | null) => void; onNotice: (m: string | null) => void };

const MAX_MB = 8;

export default function AdminFounderTab({ onError, onNotice }: Props) {
	const [founder, setFounder] = useState<Founder | null>(null);
	const [alt, setAlt] = useState("");
	const [link, setLink] = useState("");
	const [isActive, setIsActive] = useState(false);
	const [desktopFile, setDesktopFile] = useState<File | null>(null);
	const [mobileFile, setMobileFile] = useState<File | null>(null);
	const [removeDesktop, setRemoveDesktop] = useState(false);
	const [removeMobile, setRemoveMobile] = useState(false);
	const [saving, setSaving] = useState(false);

	const load = useCallback(async () => {
		try {
			const res = await apiRequest<{ success: boolean; founder: Founder }>("/admin/site/founder-message");
			setFounder(res.founder);
			setAlt(res.founder.alt || "");
			setLink(res.founder.link || "");
			setIsActive(Boolean(res.founder.isActive));
			setDesktopFile(null); setMobileFile(null); setRemoveDesktop(false); setRemoveMobile(false);
		} catch (err) {
			onError(err instanceof Error ? err.message : "Could not load founder banner");
		}
	}, [onError]);

	useEffect(() => { void load(); }, [load]);

	const pick = (f: File | null, set: (f: File | null) => void) => {
		onError(null);
		if (!f) return set(null);
		if (!/^image\/(jpeg|png|webp|avif)$/.test(f.type)) { onError("Please choose a JPG, PNG, WebP or AVIF image."); return; }
		if (f.size > MAX_MB * 1024 * 1024) { onError(`That image is ${(f.size / 1048576).toFixed(1)} MB — please keep it under ${MAX_MB} MB.`); return; }
		set(f);
	};

	const submit = async (event: FormEvent) => {
		event.preventDefault();
		onError(null); onNotice(null);
		setSaving(true);
		try {
			const form = new FormData();
			form.append("alt", alt);
			form.append("link", link);
			form.append("isActive", String(isActive));
			if (desktopFile) form.append("desktopImage", desktopFile);
			if (mobileFile) form.append("mobileImage", mobileFile);
			if (removeDesktop) form.append("removeDesktop", "true");
			if (removeMobile) form.append("removeMobile", "true");
			await apiRequest("/admin/site/founder-message", { method: "PUT", body: form });
			onNotice("Founder banner saved");
			await load();
		} catch (err) {
			onError(err instanceof Error ? err.message : "Could not save");
		} finally {
			setSaving(false);
		}
	};

	const preview = (file: File | null, url: string, removed: boolean) =>
		file ? URL.createObjectURL(file) : removed ? "" : url;

	const desktopSrc = founder ? preview(desktopFile, founder.desktopImage, removeDesktop) : "";
	const mobileSrc = founder ? preview(mobileFile, founder.mobileImage, removeMobile) : "";

	return (
		<section className="admin-content">
			<form onSubmit={submit} className="admin-panel">
				<h2>Message from the founder</h2>
				<p style={{ color: "#6f6f64", marginTop: 0 }}>
					An edge-to-edge banner shown on the homepage between “Watch &amp; Buy” and the customer reviews. Put the founder&apos;s message inside the image itself.
					Recommended: desktop 2400 × 900 px (wide), mobile 1080 × 1350 px (portrait). JPG/PNG/WebP under {MAX_MB} MB.
				</p>

				<div className="admin-form-grid" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: "1rem", alignItems: "start" }}>
					<div className="admin-form-group">
						<label>Desktop banner *</label>
						<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(e) => pick(e.target.files?.[0] || null, setDesktopFile)} />
						{desktopSrc && (
							<div style={{ marginTop: 10 }}>
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img src={desktopSrc} alt="Desktop banner preview" style={{ width: "100%", borderRadius: 8, border: "1px solid #eee" }} />
								<button type="button" className="admin-btn admin-btn-danger" style={{ marginTop: 8 }} onClick={() => { setDesktopFile(null); setRemoveDesktop(true); }}>Remove desktop image</button>
							</div>
						)}
					</div>
					<div className="admin-form-group">
						<label>Mobile banner (optional — falls back to the desktop image)</label>
						<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(e) => pick(e.target.files?.[0] || null, setMobileFile)} />
						{mobileSrc && (
							<div style={{ marginTop: 10, maxWidth: 220 }}>
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img src={mobileSrc} alt="Mobile banner preview" style={{ width: "100%", borderRadius: 8, border: "1px solid #eee" }} />
								<button type="button" className="admin-btn admin-btn-danger" style={{ marginTop: 8 }} onClick={() => { setMobileFile(null); setRemoveMobile(true); }}>Remove mobile image</button>
							</div>
						)}
					</div>
				</div>

				<div className="admin-form-grid" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: "1rem" }}>
					<div className="admin-form-group">
						<label>Image description (for accessibility &amp; SEO)</label>
						<input type="text" value={alt} onChange={(e) => setAlt(e.target.value)} maxLength={200} placeholder="A message from our founder" />
					</div>
					<div className="admin-form-group">
						<label>Link (optional — e.g. /about or https://…)</label>
						<input type="text" value={link} onChange={(e) => setLink(e.target.value)} maxLength={300} placeholder="/about" />
					</div>
				</div>

				<div className="admin-form-group" style={{ marginBottom: "1.5rem" }}>
					<label className="admin-checkbox">
						<input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
						Show this section on the homepage
					</label>
				</div>

				<button type="submit" className="admin-btn" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
			</form>
		</section>
	);
}
