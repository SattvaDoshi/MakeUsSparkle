import React, { useState, useMemo } from "react";

type AdminProduct = {
  _id: string;
  title: string;
  price?: number;
  mainImage?: string;
  images?: string[];
};

export type OpenSectionItem =
  | { type: "product"; product: string; _id?: string }
  | {
      type: "category";
      image: string;
      imagePublicId: string;
      link: string;
      label: string;
      _id?: string;
      _newImageFile?: File;
    };

export type OpenSectionForm = {
  eyebrow: string;
  title: string;
  isActive: boolean;
  items: OpenSectionItem[];
};

type AdminOpenSectionTabProps = {
  form: OpenSectionForm;
  products: AdminProduct[];
  onChange: (form: OpenSectionForm) => void;
  onSubmit: () => void;
  saving?: boolean;
};

export default function AdminOpenSectionTab({
  form,
  products,
  onChange,
  onSubmit,
  saving,
}: AdminOpenSectionTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [addType, setAddType] = useState<"product" | "category">("product");

  /* ── filtered product list for the picker ── */
  const filteredProducts = useMemo(
    () =>
      products.filter((p) =>
        !searchQuery ? true : p.title?.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [products, searchQuery]
  );

  /* ── helpers ── */
  const updateItem = (index: number, patch: Partial<OpenSectionItem>) => {
    const next = [...form.items];
    next[index] = { ...next[index], ...patch } as OpenSectionItem;
    onChange({ ...form, items: next });
  };

  const removeItem = (index: number) => {
    const next = [...form.items];
    next.splice(index, 1);
    onChange({ ...form, items: next });
  };

  const moveItem = (index: number, dir: -1 | 1) => {
    const nextIndex = index + dir;
    if (nextIndex < 0 || nextIndex >= form.items.length) return;
    const next = [...form.items];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    onChange({ ...form, items: next });
  };

  const addProduct = (productId: string) => {
    if (form.items.some((i) => i.type === "product" && i.product === productId)) return;
    onChange({
      ...form,
      items: [...form.items, { type: "product", product: productId }],
    });
  };

  const addCategoryItem = () => {
    onChange({
      ...form,
      items: [
        ...form.items,
        { type: "category", image: "", imagePublicId: "", link: "", label: "" },
      ],
    });
  };

  const getProductInfo = (id: string) => products.find((p) => p._id === id);

  /* ── render ── */
  return (
    <section className="admin-content">
      {/* ── Section Settings ── */}
      <div className="admin-panel" style={{ marginBottom: "2rem" }}>
        <h2>Section Settings</h2>

        <div className="admin-form-grid" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: "1.5rem" }}>
          <div className="admin-form-group">
            <label>Section Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => onChange({ ...form, title: e.target.value })}
              placeholder="e.g. New Arrivals, Featured Picks"
            />
          </div>
          <div className="admin-form-group">
            <label>Eyebrow Text (optional)</label>
            <input
              type="text"
              value={form.eyebrow}
              onChange={(e) => onChange({ ...form, eyebrow: e.target.value })}
              placeholder="e.g. JUST LANDED"
            />
          </div>
        </div>

        <div className="admin-form-group" style={{ marginBottom: "1.5rem" }}>
          <label className="admin-checkbox">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => onChange({ ...form, isActive: e.target.checked })}
            />
            Show section on homepage
          </label>
        </div>

        <button
          type="button"
          className="admin-btn"
          onClick={onSubmit}
          disabled={saving}
          style={{ opacity: saving ? 0.7 : 1 }}
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {/* ── Current Items ── */}
      <div className="admin-panel" style={{ marginBottom: "2rem" }}>
        <h2>Items in Section ({form.items.length})</h2>
        <p style={{ fontSize: "0.85rem", color: "#666", marginBottom: "1.5rem" }}>
          Items appear in the order listed below. You can mix products and category banners freely.
        </p>

        {form.items.length === 0 && (
          <p style={{ color: "#999", fontSize: "0.9rem", marginBottom: "1rem" }}>
            No items yet. Add a product or a category banner below.
          </p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {form.items.map((item, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #e0e0d8",
                borderRadius: "8px",
                padding: "1.25rem",
                background: item.type === "product" ? "#fafaf7" : "#f7f5f0",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: item.type === "product" ? "#3d6b4f" : "#c9a84c",
                    background: item.type === "product" ? "#e8f5ee" : "#fdf5e4",
                    padding: "2px 10px",
                    borderRadius: "100px",
                  }}
                >
                  {item.type === "product" ? "📦 Product" : "🖼️ Category Banner"}
                </span>
                <div className="admin-inline-actions">
                  <button className="admin-btn admin-btn-muted" type="button" onClick={() => moveItem(index, -1)} disabled={index === 0}>↑</button>
                  <button className="admin-btn admin-btn-muted" type="button" onClick={() => moveItem(index, 1)} disabled={index === form.items.length - 1}>↓</button>
                  <button className="admin-btn admin-btn-danger" type="button" onClick={() => removeItem(index)}>Remove</button>
                </div>
              </div>

              {item.type === "product" ? (
                /* Product item preview */
                (() => {
                  const info = getProductInfo(item.product);
                  const img = info?.mainImage || info?.images?.[0] || "";
                  return (
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      {img && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt={info?.title || ""} style={{ width: 48, height: 60, objectFit: "cover", borderRadius: 4 }} />
                      )}
                      <div>
                        <p style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: 2 }}>{info?.title || item.product}</p>
                        {info?.price && <p style={{ fontSize: "0.8rem", color: "#666" }}>₹{Math.round(info.price).toLocaleString()}</p>}
                      </div>
                    </div>
                  );
                })()
              ) : (
                /* Category banner item editor */
                <div className="admin-form-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div className="admin-form-group">
                    <label style={{ fontSize: "0.8rem" }}>Label (shown over image)</label>
                    <input
                      type="text"
                      placeholder="e.g. Gift Sets, Bracelets"
                      value={(item as any).label || ""}
                      onChange={(e) => updateItem(index, { label: e.target.value } as any)}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label style={{ fontSize: "0.8rem" }}>Link URL</label>
                    <input
                      type="text"
                      placeholder="e.g. /categories/women/bracelets"
                      value={(item as any).link || ""}
                      onChange={(e) => updateItem(index, { link: e.target.value } as any)}
                    />
                  </div>
                  <div className="admin-form-group" style={{ gridColumn: "1 / -1" }}>
                    <label style={{ fontSize: "0.8rem" }}>Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        if (file) updateItem(index, { _newImageFile: file } as any);
                      }}
                    />
                    {(item as any).image && !(item as any)._newImageFile && (
                      <p style={{ fontSize: "0.75rem", marginTop: "0.25rem", color: "#3d6b4f" }}>
                        ✓ Image uploaded. Upload a new file to replace it.
                      </p>
                    )}
                    {(item as any)._newImageFile && (
                      <p style={{ fontSize: "0.75rem", marginTop: "0.25rem", color: "#c9a84c" }}>
                        New file selected: {(item as any)._newImageFile.name}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div style={{  display: "flex", justifyContent: "flex-end" }}>
        <button
          type="button"
          className="admin-btn"
          onClick={onSubmit}
          disabled={saving}
          style={{ opacity: saving ? 0.7 : 1, padding: "0.75rem 2rem", fontSize: "1.05rem" }}
        >
          {saving ? "Saving…" : "Save All Changes"}
        </button>
      </div>

      {/* ── Add Item ── */}
      <div className="admin-panel">
        <h2>Add Item</h2>

        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <button
            type="button"
            onClick={() => setAddType("product")}
            style={{
              padding: "0.5rem 1.25rem",
              borderRadius: "6px",
              border: "1px solid #d4d4c8",
              background: addType === "product" ? "#4a5c22" : "#f9f9f7",
              color: addType === "product" ? "#fff" : "#3d4a20",
              cursor: "pointer",
              fontWeight: addType === "product" ? 600 : 400,
              transition: "all 0.15s",
            }}
          >
            📦 Product
          </button>
          <button
            type="button"
            onClick={() => setAddType("category")}
            style={{
              padding: "0.5rem 1.25rem",
              borderRadius: "6px",
              border: "1px solid #d4d4c8",
              background: addType === "category" ? "#4a5c22" : "#f9f9f7",
              color: addType === "category" ? "#fff" : "#3d4a20",
              cursor: "pointer",
              fontWeight: addType === "category" ? 600 : 400,
              transition: "all 0.15s",
            }}
          >
            🖼️ Category Banner
          </button>
        </div>

        {addType === "category" ? (
          <div>
            <p style={{ fontSize: "0.85rem", color: "#666", marginBottom: "1rem" }}>
              A category banner is a clickable image card that links to a category page. Fill in the details after adding.
            </p>
            <button type="button" className="admin-btn" onClick={addCategoryItem}>
              + Add Category Banner
            </button>
          </div>
        ) : (
          <div>
            <div className="admin-controls" style={{ marginBottom: "1rem" }}>
              <input
                type="text"
                className="admin-search"
                placeholder="Search products by title…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: 50 }}></th>
                    <th>Product</th>
                    <th>Price</th>
                    <th style={{ width: 80 }}>Add</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const image = product.mainImage || product.images?.[0] || "";
                    const alreadyAdded = form.items.some(
                      (i) => i.type === "product" && i.product === product._id
                    );
                    return (
                      <tr key={product._id} style={{ opacity: alreadyAdded ? 0.5 : 1 }}>
                        <td>
                          {image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={image} alt={product.title} style={{ width: 36, height: 46, objectFit: "cover", borderRadius: 3 }} />
                          ) : null}
                        </td>
                        <td>{product.title || "-"}</td>
                        <td>₹{Math.round(product.price || 0).toLocaleString()}</td>
                        <td>
                          <button
                            className="admin-btn admin-btn-muted"
                            type="button"
                            disabled={alreadyAdded}
                            onClick={() => addProduct(product._id)}
                          >
                            {alreadyAdded ? "Added" : "+ Add"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center", color: "#999" }}>No products found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Save Action ── */}
      
    </section>
  );
}
