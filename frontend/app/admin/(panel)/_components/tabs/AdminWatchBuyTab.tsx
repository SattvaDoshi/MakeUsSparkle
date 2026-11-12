import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { apiRequest } from "@/lib/api";

type AdminProduct = { _id: string; title: string; price?: number; mainImage?: string; images?: string[] };

type WatchBuyEntry = {
	_id: string;
	title?: string;
	product?: { _id: string; title?: string; mainImage?: string; images?: string[]; price?: number; gender?: string } | string;
	publicId?: string;
	videoUrl?: string;
	src?: string;
	poster?: string;
	duration?: number;
	gender?: "women" | "men" | "kids" | "all";
	isActive: boolean;
	sortOrder: number;
};

type Props = {
	products: AdminProduct[];
	onError: (message: string | null) => void;
	onNotice: (message: string | null) => void;
};

const MAX_MB = 60;
const MAX_SECONDS = 90;

/** Reads duration from the chosen file without uploading it. */
function readDuration(file: File): Promise<number> {
	return new Promise((resolve) => {
		const url = URL.createObjectURL(file);
		const el = document.createElement("video");
		el.preload = "metadata";
		el.onloadedmetadata = () => { resolve(el.duration || 0); URL.revokeObjectURL(url); };
		el.onerror = () => { resolve(0); URL.revokeObjectURL(url); };
		el.src = url;
	});
}

export default function AdminWatchBuyTab({ products, onError, onNotice }: Props) {
	const [videos, setVideos] = useState<WatchBuyEntry[]>([]);
	const [loading, setLoading] = useState(true);
	const [title, setTitle] = useState("");
	const [productId, setProductId] = useState("");
	const [productSearch, setProductSearch] = useState("");
	const [file, setFile] = useState<File | null>(null);
	const [videoUrl, setVideoUrl] = useState("");
	const [progress, setProgress] = useState<number | null>(null);
	const [saving, setSaving] = useState(false);
	const fileInput = useRef<HTMLInputElement>(null);

	const load = useCallback(async () => {
		try {
			const res = await apiRequest<{ success: boolean; videos: WatchBuyEntry[] }>("/admin/watch-buy");
			setVideos(res.videos || []);
		} catch (err) {
			onError(err instanceof Error ? err.message : "Could not load videos");
		} finally {
			setLoading(false);
		}
	}, [onError]);

	useEffect(() => { void load(); }, [load]);

	const filteredProducts = useMemo(() => {
		const q = productSearch.trim().toLowerCase();
		return products.filter((p) => !q || p.title?.toLowerCase().includes(q)).slice(0, 80);
	}, [products, productSearch]);

	const productTitle = (v: WatchBuyEntry) =>
		typeof v.product === "object" && v.product ? v.product.title || "—" : products.find((p) => p._id === v.product)?.title || "—";

	/** Direct browser → Cloudinary upload (the video never passes through our server). */
	const uploadToCloudinary = async (f: File) => {
		const sign = await apiRequest<{ cloudName: string; apiKey: string; folder: string; timestamp: number; signature: string; uploadUrl: string }>(
			"/admin/watch-buy/sign-upload",
			{ method: "POST" },
		);
		const form = new FormData();
		form.append("file", f);
		form.append("api_key", sign.apiKey);
		form.append("timestamp", String(sign.timestamp));
		form.append("folder", sign.folder);
		form.append("signature", sign.signature);

		return new Promise<{ public_id: string; duration?: number }>((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			xhr.open("POST", sign.uploadUrl);
			xhr.upload.onprogress = (e) => { if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100)); };
			xhr.onload = () => {
				try {
					const body = JSON.parse(xhr.responseText);
					if (xhr.status >= 200 && xhr.status < 300) resolve(body);
					else reject(new Error(body?.error?.message || "Upload failed"));
				} catch { reject(new Error("Upload failed")); }
			};
			xhr.onerror = () => reject(new Error("Network error during upload"));
			xhr.send(form);
		});
	};

	const pickFile = async (f: File | null) => {
		onError(null);
		if (!f) { setFile(null); return; }
		if (!/^video\/(mp4|quicktime|webm)$/.test(f.type)) { onError("Please choose an MP4, MOV or WebM video."); return; }
		if (f.size > MAX_MB * 1024 * 1024) { onError(`That video is ${(f.size / 1048576).toFixed(0)} MB. Please keep it under ${MAX_MB} MB (15–30s vertical clips are ideal).`); return; }
		const d = await readDuration(f);
		if (d > MAX_SECONDS) { onError(`That video is ${Math.round(d)}s long. Please keep it under ${MAX_SECONDS}s — short clips convert best and load faster.`); return; }
		setFile(f);
	};

	const reset = () => {
		setTitle(""); setProductId(""); setProductSearch(""); setFile(null); setVideoUrl(""); setProgress(null);
		if (fileInput.current) fileInput.current.value = "";
	};

	const submit = async (event: FormEvent) => {
		event.preventDefault();
		onError(null); onNotice(null);
		if (!productId) { onError("Choose the product this video sells."); return; }
		if (!file && !videoUrl.trim()) { onError("Upload a video file or paste a video URL."); return; }
		setSaving(true);
		try {
			let publicId = "";
			let duration = 0;
			if (file) {
				const up = await uploadToCloudinary(file);
				publicId = up.public_id;
				duration = up.duration || (await readDuration(file));
			}
			const nextOrder = videos.length ? Math.max(...videos.map((v) => v.sortOrder || 0)) + 1 : 0;
			await apiRequest("/admin/watch-buy", {
				method: "POST",
				body: JSON.stringify({
					title: title.trim(),
					product: productId,
					publicId,
					videoUrl: publicId ? "" : videoUrl.trim(),
					duration,
					isActive: true,
					sortOrder: nextOrder,
				}),
			});
			onNotice("Video added — it's live on the homepage within a few minutes.");
			reset();
			await load();
		} catch (err) {
			onError(err instanceof Error ? err.message : "Could not add video");
		} finally {
			setSaving(false);
			setProgress(null);
		}
	};

	const patch = async (id: string, body: Record<string, unknown>, message?: string) => {
		onError(null);
		try {
			await apiRequest(`/admin/watch-buy/${id}`, { method: "PUT", body: JSON.stringify(body) });
			if (message) onNotice(message);
			await load();
		} catch (err) {
			onError(err instanceof Error ? err.message : "Update failed");
		}
	};

	const move = async (index: number, dir: -1 | 1) => {
		const a = videos[index];
		const b = videos[index + dir];
		if (!a || !b) return;
		// Re-number the whole list so equal sortOrders can't make a swap a no-op.
		const next = [...videos];
		next[index] = b; next[index + dir] = a;
		await Promise.all(next.map((v, n) => (v.sortOrder === n ? null : apiRequest(`/admin/watch-buy/${v._id}`, { method: "PUT", body: JSON.stringify({ sortOrder: n }) }))));
		await load();
	};

	const remove = async (v: WatchBuyEntry) => {
		if (!window.confirm("Delete this video? It will also be removed from Cloudinary.")) return;
		onError(null);
		try {
			await apiRequest(`/admin/watch-buy/${v._id}`, { method: "DELETE" });
			onNotice("Video deleted");
			await load();
		} catch (err) {
			onError(err instanceof Error ? err.message : "Delete failed");
		}
	};

	return (
		<section className="admin-content">
			<form onSubmit={submit} className="admin-panel" style={{ marginBottom: "2rem" }}>
				<h2>Add a Watch &amp; Buy video</h2>
				<p style={{ color: "#6f6f64", marginTop: 0 }}>
					Best results: vertical 9:16, 15–30 seconds, MP4 under {MAX_MB} MB. We compress and serve it in a light mobile-friendly size automatically.
				</p>

				<div className="admin-form-grid" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: "1rem" }}>
					<div className="admin-form-group">
						<label>Video file</label>
						<input ref={fileInput} type="file" accept="video/mp4,video/quicktime,video/webm" onChange={(e) => void pickFile(e.target.files?.[0] || null)} />
						{file && <small>{file.name} · {(file.size / 1048576).toFixed(1)} MB</small>}
					</div>
					<div className="admin-form-group">
						<label>…or paste a video URL (https, mp4)</label>
						<input type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://…/video.mp4" disabled={Boolean(file)} />
					</div>
				</div>

				<div className="admin-form-grid" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: "1rem" }}>
					<div className="admin-form-group">
						<label>Product this video sells *</label>
						<input type="text" className="admin-search" placeholder="Search products…" value={productSearch} onChange={(e) => setProductSearch(e.target.value)} style={{ marginBottom: 8 }} />
						<select value={productId} onChange={(e) => setProductId(e.target.value)} size={5} style={{ width: "100%" }}>
							{filteredProducts.map((p) => (
								<option key={p._id} value={p._id}>{p.title} {p.price ? `· ₹${Math.round(p.price)}` : ""}</option>
							))}
						</select>
					</div>
					<div className="admin-form-group">
						<label>Internal title (optional)</label>
						<input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Styling the hair chain" maxLength={120} />
					</div>
				</div>

				{progress !== null && (
					<div style={{ margin: "0 0 1rem" }}>
						<div style={{ height: 8, background: "#eee", borderRadius: 4, overflow: "hidden" }}>
							<div style={{ width: `${progress}%`, height: "100%", background: "#2a4736", transition: "width .2s" }} />
						</div>
						<small>Uploading… {progress}%</small>
					</div>
				)}

				<button type="submit" className="admin-btn" disabled={saving}>{saving ? "Uploading…" : "Add video"}</button>
			</form>

			<div className="admin-panel">
				<h2>Videos on the homepage ({videos.filter((v) => v.isActive).length} live / {videos.length} total)</h2>
				{loading ? <p>Loading…</p> : videos.length === 0 ? (
					<p>No videos yet. Add one above and the “Watch &amp; Buy” section appears below New Arrivals.</p>
				) : (
					<div className="admin-table-wrap">
						<table className="admin-table">
							<thead>
								<tr><th>Preview</th><th>Product</th><th>Title</th><th>Length</th><th>Live</th><th>Order</th><th /></tr>
							</thead>
							<tbody>
								{videos.map((v, index) => (
									<tr key={v._id}>
										<td>
											{v.poster ? (
												// eslint-disable-next-line @next/next/no-img-element
												<img src={v.poster} alt="" style={{ width: 44, height: 78, objectFit: "cover", borderRadius: 6, background: "#eee" }} />
											) : "—"}
										</td>
										<td>{productTitle(v)}</td>
										<td>{v.title || "—"}</td>
										<td>{v.duration ? `${Math.round(v.duration)}s` : "—"}</td>
										<td>
											<input type="checkbox" checked={v.isActive} onChange={(e) => void patch(v._id, { isActive: e.target.checked }, e.target.checked ? "Video is live" : "Video hidden")} aria-label="Show on homepage" />
										</td>
										<td>
											<div className="admin-inline-actions">
												<button type="button" className="admin-btn admin-btn-muted" onClick={() => void move(index, -1)} disabled={index === 0}>Up</button>
												<button type="button" className="admin-btn admin-btn-muted" onClick={() => void move(index, 1)} disabled={index === videos.length - 1}>Down</button>
											</div>
										</td>
										<td><button type="button" className="admin-btn admin-btn-danger" onClick={() => void remove(v)}>Delete</button></td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</section>
	);
}
