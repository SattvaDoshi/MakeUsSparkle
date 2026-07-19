"use client";

import { useEffect, useState } from "react";
import type { Warehouse } from "../../_lib/admin.types";
import { listWarehouses, addWarehouse } from "@/lib/shippingApi";

const EMPTY_FORM = {
  name: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  email: "",
};

export default function AdminShippingTab() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadWarehouses = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listWarehouses();
      const raw = res.data;
      const list: Warehouse[] = Array.isArray(raw)
        ? raw
        : Array.isArray((raw as any)?.warehouse_list)
        ? (raw as any).warehouse_list
        : [];
      setWarehouses(list);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load warehouses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadWarehouses(); }, []);

  const handleSave = async () => {
    setError(""); setSuccess("");
    if (!form.name || !form.phone || !form.address || !form.city || !form.state || !form.pincode) {
      setError("All fields except email are required."); return;
    }
    setSaving(true);
    try {
      await addWarehouse({
        name:    form.name,
        phone:   form.phone,
        address: form.address,
        city:    form.city,
        state:   form.state,
        pincode: form.pincode,
        email:   form.email,
      });
      setSuccess("Warehouse added successfully!");
      setForm({ ...EMPTY_FORM });
      setShowForm(false);
      await loadWarehouses();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to add warehouse.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="admin-content">
      <style>{`
        .itl-panel { max-width: 900px; }
        .itl-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .itl-header h2 { font-size: 22px; font-weight: 700; color: var(--ink, #0f1a0f); margin: 0; }

        .itl-wh-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px; margin-bottom: 32px;
        }
        .itl-wh-card {
          background: white; border: 1px solid rgba(61,74,34,0.12); border-radius: 12px;
          padding: 18px 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);
          transition: box-shadow 0.2s;
        }
        .itl-wh-card:hover { box-shadow: 0 4px 16px rgba(61,74,34,0.1); }
        .itl-wh-name { font-size: 15px; font-weight: 700; color: var(--olive-900, #1a2e0a); margin-bottom: 8px; }
        .itl-wh-row { font-size: 13px; color: var(--mist, #6b7a5e); margin-bottom: 4px; display: flex; gap: 6px; }
        .itl-wh-row span:first-child { min-width: 56px; font-weight: 600; color: var(--ink, #0f1a0f); }
        .itl-wh-id { margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(61,74,34,0.08);
          font-size: 11px; color: var(--mist, #6b7a5e); }

        .itl-form-card {
          background: white; border: 1px solid rgba(61,74,34,0.12); border-radius: 12px;
          padding: 24px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);
        }
        .itl-form-title { font-size: 16px; font-weight: 700; color: var(--olive-900, #1a2e0a); margin-bottom: 16px; }
        .itl-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 640px) { .itl-form-grid { grid-template-columns: 1fr; } }
        .itl-label { font-size: 12px; font-weight: 600; color: var(--ink, #0f1a0f);
          text-transform: uppercase; letter-spacing: 0.06em; display: block; margin-bottom: 6px; }
        .itl-input {
          width: 100%; padding: 10px 12px; border: 1px solid rgba(61,74,34,0.18);
          border-radius: 8px; font-size: 14px; color: var(--ink, #0f1a0f);
          background: #fafafa; outline: none; box-sizing: border-box;
          transition: border-color 0.2s;
        }
        .itl-input:focus { border-color: var(--olive-600, #3a7a32); background: white; }
        .itl-form-actions { display: flex; gap: 10px; margin-top: 20px; }

        .itl-btn {
          padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 700;
          cursor: pointer; border: none; letter-spacing: 0.04em; transition: opacity 0.15s, transform 0.1s;
        }
        .itl-btn:active { transform: scale(0.97); }
        .itl-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .itl-btn-primary { background: var(--olive-600, #3a7a32); color: white; }
        .itl-btn-primary:hover:not(:disabled) { opacity: 0.88; }
        .itl-btn-ghost { background: transparent; color: var(--mist, #6b7a5e); border: 1px solid rgba(61,74,34,0.18); }
        .itl-btn-ghost:hover { background: #f5f8f2; }

        .itl-alert { padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; }
        .itl-alert-error { background: #ffebee; color: #c62828; border: 1px solid #ef9a9a; }
        .itl-alert-success { background: #e8f5e9; color: #2e7d32; border: 1px solid #a5d6a7; }

        .itl-empty { text-align: center; padding: 40px 20px; color: var(--mist, #6b7a5e); font-size: 14px; }
        .itl-loader { text-align: center; padding: 32px; color: var(--mist, #6b7a5e); font-size: 14px; }

        .itl-section-label {
          font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;
          color: var(--mist, #6b7a5e); font-weight: 700; margin-bottom: 12px;
        }
      `}</style>

      <div className="admin-panel itl-panel">
        <div className="itl-header">
          <h2>📦 Shipping — Warehouses</h2>
          {!showForm && (
            <button className="itl-btn itl-btn-primary" onClick={() => setShowForm(true)}>
              + Add Warehouse
            </button>
          )}
        </div>

        {error && <div className="itl-alert itl-alert-error">{error}</div>}
        {success && <div className="itl-alert itl-alert-success">{success}</div>}

        {showForm && (
          <div className="itl-form-card">
            <div className="itl-form-title">Register New Pickup Warehouse</div>
            <div className="itl-form-grid">
              {([
                ["name",    "Warehouse Name *"],
                ["phone",   "Phone *"],
                ["address", "Address *"],
                ["city",    "City *"],
                ["state",   "State *"],
                ["pincode", "Pincode *"],
                ["email",   "Email (optional)"],
              ] as const).map(([key, label]) => (
                <label key={key}>
                  <span className="itl-label">{label}</span>
                  <input
                    id={`itl-wh-${key}`}
                    className="itl-input"
                    value={form[key]}
                    onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                    placeholder={label.replace(" *", "")}
                    maxLength={key === "pincode" ? 6 : undefined}
                  />
                </label>
              ))}
            </div>
            <div className="itl-form-actions">
              <button className="itl-btn itl-btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : "Save Warehouse"}
              </button>
              <button className="itl-btn itl-btn-ghost" onClick={() => { setShowForm(false); setError(""); }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="itl-section-label">Registered Warehouses</div>
        {loading ? (
          <div className="itl-loader">Loading warehouses…</div>
        ) : warehouses.length === 0 ? (
          <div className="itl-empty">No warehouses registered yet. Add one above.</div>
        ) : (
          <div className="itl-wh-grid">
            {warehouses.map((wh: any, i) => {
              const id = wh.warehouse_id ?? wh.id ?? i;
              const name = wh.company_name || wh.name || `Warehouse ${i + 1}`;
              const address = wh.address1 || wh.address;
              const city = wh.city_name || wh.city;
              const state = wh.state_name || wh.state;
              const phone = wh.mobile || wh.phone;
              return (
                <div className="itl-wh-card" key={String(id)}>
                  <div className="itl-wh-name">{name}</div>
                  {address && <div className="itl-wh-row"><span>Address</span><span>{address}</span></div>}
                  {city    && <div className="itl-wh-row"><span>City</span><span>{city}{state ? `, ${state}` : ""}</span></div>}
                  {wh.pincode && <div className="itl-wh-row"><span>Pincode</span><span>{wh.pincode}</span></div>}
                  {phone   && <div className="itl-wh-row"><span>Phone</span><span>{phone}</span></div>}
                  <div className="itl-wh-id">Warehouse ID: <strong>{String(id)}</strong></div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
