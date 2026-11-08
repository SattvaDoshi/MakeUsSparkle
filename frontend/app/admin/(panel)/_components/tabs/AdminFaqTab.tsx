import { useCallback, useEffect, useState, type FormEvent } from "react";
import { apiRequest } from "@/lib/api";

type Faq = { _id: string; question: string; answer: string; isActive: boolean; sortOrder: number };
type Settings = { eyebrow: string; title: string; subtitle: string };
type Props = { onError: (m: string | null) => void; onNotice: (m: string | null) => void };

export default function AdminFaqTab({ onError, onNotice }: Props) {
	const [faqs, setFaqs] = useState<Faq[]>([]);
	const [settings, setSettings] = useState<Settings>({ eyebrow: "", title: "", subtitle: "" });
	const [loading, setLoading] = useState(true);
	const [question, setQuestion] = useState("");
	const [answer, setAnswer] = useState("");
	const [editId, setEditId] = useState<string | null>(null);
	const [editQ, setEditQ] = useState("");
	const [editA, setEditA] = useState("");

	const load = useCallback(async () => {
		try {
			const res = await apiRequest<{ success: boolean; faqs: Faq[]; settings: Settings }>("/admin/site/faqs");
			setFaqs(res.faqs || []);
			setSettings(res.settings);
		} catch (err) {
			onError(err instanceof Error ? err.message : "Could not load FAQs");
		} finally {
			setLoading(false);
		}
	}, [onError]);

	useEffect(() => { void load(); }, [load]);

	const run = async (fn: () => Promise<unknown>, ok?: string) => {
		onError(null); onNotice(null);
		try { await fn(); if (ok) onNotice(ok); await load(); } catch (err) { onError(err instanceof Error ? err.message : "Request failed"); }
	};

	const saveSettings = (e: FormEvent) => {
		e.preventDefault();
		void run(() => apiRequest("/admin/site/faqs/settings", { method: "PUT", body: JSON.stringify(settings) }), "Section heading saved");
	};

	const add = (e: FormEvent) => {
		e.preventDefault();
		void run(async () => {
			await apiRequest("/admin/site/faqs", { method: "POST", body: JSON.stringify({ question, answer }) });
			setQuestion(""); setAnswer("");
		}, "FAQ added");
	};

	const saveEdit = () => {
		if (!editId) return;
		void run(async () => {
			await apiRequest(`/admin/site/faqs/${editId}`, { method: "PUT", body: JSON.stringify({ question: editQ, answer: editA }) });
			setEditId(null);
		}, "FAQ updated");
	};

	const move = (index: number, dir: -1 | 1) => {
		const next = [...faqs];
		const j = index + dir;
		if (j < 0 || j >= next.length) return;
		[next[index], next[j]] = [next[j], next[index]];
		void run(() => Promise.all(next.map((f, n) => (f.sortOrder === n ? null : apiRequest(`/admin/site/faqs/${f._id}`, { method: "PUT", body: JSON.stringify({ sortOrder: n }) })))));
	};

	const remove = (f: Faq) => {
		if (!window.confirm("Delete this FAQ?")) return;
		void run(() => apiRequest(`/admin/site/faqs/${f._id}`, { method: "DELETE" }), "FAQ deleted");
	};

	return (
		<section className="admin-content">
			<form onSubmit={saveSettings} className="admin-panel" style={{ marginBottom: "2rem" }}>
				<h2>Section heading</h2>
				<div className="admin-form-grid" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: "1rem" }}>
					<div className="admin-form-group">
						<label>Small label</label>
						<input type="text" value={settings.eyebrow} onChange={(e) => setSettings({ ...settings, eyebrow: e.target.value })} maxLength={60} placeholder="Good to know" />
					</div>
					<div className="admin-form-group">
						<label>Title</label>
						<input type="text" value={settings.title} onChange={(e) => setSettings({ ...settings, title: e.target.value })} maxLength={120} placeholder="Frequently asked questions" />
					</div>
				</div>
				<div className="admin-form-group" style={{ marginBottom: "1rem" }}>
					<label>Intro line</label>
					<input type="text" value={settings.subtitle} onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })} maxLength={300} />
				</div>
				<button type="submit" className="admin-btn">Save heading</button>
			</form>

			<form onSubmit={add} className="admin-panel" style={{ marginBottom: "2rem" }}>
				<h2>Add a question</h2>
				<div className="admin-form-group" style={{ marginBottom: "1rem" }}>
					<label>Question *</label>
					<input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} maxLength={200} placeholder="How long does delivery take?" required />
				</div>
				<div className="admin-form-group" style={{ marginBottom: "1rem" }}>
					<label>Answer * (plain text; line breaks are kept)</label>
					<textarea value={answer} onChange={(e) => setAnswer(e.target.value)} maxLength={3000} rows={4} required />
				</div>
				<button type="submit" className="admin-btn">Add FAQ</button>
			</form>

			<div className="admin-panel">
				<h2>Questions on the homepage ({faqs.filter((f) => f.isActive).length} live / {faqs.length} total)</h2>
				{loading ? <p>Loading…</p> : faqs.length === 0 ? <p>No questions yet — the FAQ section stays hidden until you add one.</p> : (
					<div className="admin-table-wrap">
						<table className="admin-table">
							<thead><tr><th>Question &amp; answer</th><th>Live</th><th>Order</th><th /></tr></thead>
							<tbody>
								{faqs.map((f, i) => (
									<tr key={f._id}>
										<td style={{ maxWidth: 520 }}>
											{editId === f._id ? (
												<div style={{ display: "grid", gap: 8 }}>
													<input type="text" value={editQ} onChange={(e) => setEditQ(e.target.value)} maxLength={200} />
													<textarea value={editA} onChange={(e) => setEditA(e.target.value)} maxLength={3000} rows={4} />
													<div className="admin-inline-actions">
														<button type="button" className="admin-btn" onClick={saveEdit}>Save</button>
														<button type="button" className="admin-btn admin-btn-muted" onClick={() => setEditId(null)}>Cancel</button>
													</div>
												</div>
											) : (
												<>
													<strong>{f.question}</strong>
													<div style={{ color: "#6f6f64", fontSize: 13, marginTop: 4, whiteSpace: "pre-line" }}>{f.answer.length > 160 ? `${f.answer.slice(0, 160)}…` : f.answer}</div>
												</>
											)}
										</td>
										<td><input type="checkbox" checked={f.isActive} aria-label="Show on homepage" onChange={(e) => void run(() => apiRequest(`/admin/site/faqs/${f._id}`, { method: "PUT", body: JSON.stringify({ isActive: e.target.checked }) }))} /></td>
										<td>
											<div className="admin-inline-actions">
												<button type="button" className="admin-btn admin-btn-muted" disabled={i === 0} onClick={() => move(i, -1)}>Up</button>
												<button type="button" className="admin-btn admin-btn-muted" disabled={i === faqs.length - 1} onClick={() => move(i, 1)}>Down</button>
											</div>
										</td>
										<td>
											<div className="admin-inline-actions">
												<button type="button" className="admin-btn admin-btn-muted" onClick={() => { setEditId(f._id); setEditQ(f.question); setEditA(f.answer); }}>Edit</button>
												<button type="button" className="admin-btn admin-btn-danger" onClick={() => remove(f)}>Delete</button>
											</div>
										</td>
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
