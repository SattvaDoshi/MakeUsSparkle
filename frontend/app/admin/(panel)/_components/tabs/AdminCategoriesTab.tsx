"use client";
import React, { useRef, useState } from "react";

type GenderRef = { _id?: string; name?: string } | string;
type Category = { _id: string; name?: string; description?: string; image?: string; gender?: GenderRef };
type SubCategory = { _id: string; name?: string; category?: { _id?: string; name?: string; gender?: GenderRef } | string; image?: string };
type Style = { _id: string; name?: string; image?: string; gender?: GenderRef };
type Gender = { _id: string; name?: string; slug?: string; image?: string; isActive?: boolean };

type Props = {
  categories: Category[];
  subcategories: SubCategory[];
  styles: Style[];
  genders: Gender[];
  onCreateCategory: (payload: FormData) => void;
  onEditCategory: (id: string, payload: FormData) => void;
  onDeleteCategory: (id: string) => void;
  onCreateSubCategory: (payload: FormData) => void;
  onEditSubCategory: (id: string, payload: FormData) => void;
  onDeleteSubCategory: (id: string) => void;
  onCreateStyle: (payload: FormData) => void;
  onEditStyle: (id: string, payload: FormData) => void;
  onDeleteStyle: (id: string) => void;
  onCreateGender: (payload: FormData) => void;
  onEditGender: (id: string, payload: FormData) => void;
  onDeleteGender: (id: string) => void;
};

type ModalState = {
  kind: "category" | "subcategory" | "style" | "gender";
  mode: "create" | "edit";
  id?: string;
  name: string;
  description: string;
  slug: string;
  parentCategoryId: string;
  genderId: string;
  imageFile: File | null;
  existingImage?: string;
};

const defaultModal: ModalState = {
  kind: "category",
  mode: "create",
  name: "",
  description: "",
  slug: "",
  parentCategoryId: "",
  genderId: "",
  imageFile: null,
};

type TabKey = "categories" | "subcategories" | "styles" | "genders";

const tabLabels: Record<TabKey, string> = {
  categories: "Categories",
  subcategories: "Sub-Categories",
  styles: "Styles",
  genders: "Genders",
};

export default function AdminCategoriesTab({
  categories,
  subcategories,
  styles,
  genders,
  onCreateCategory,
  onEditCategory,
  onDeleteCategory,
  onCreateSubCategory,
  onEditSubCategory,
  onDeleteSubCategory,
  onCreateStyle,
  onEditStyle,
  onDeleteStyle,
  onCreateGender,
  onEditGender,
  onDeleteGender,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("categories");
  const [modal, setModal] = useState<ModalState | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openCreate = (kind: TabKey) => {
    setImagePreview(null);
    setModal({ ...defaultModal, kind: kind === "subcategories" ? "subcategory" : kind === "styles" ? "style" : kind === "genders" ? "gender" : "category", mode: "create" });
  };

  const openEdit = (kind: TabKey, item: Category | SubCategory | Style | Gender) => {
    setImagePreview(item.image || null);
    const base: ModalState = {
      kind: kind === "subcategories" ? "subcategory" : kind === "styles" ? "style" : kind === "genders" ? "gender" : "category",
      mode: "edit",
      id: item._id,
      name: (item as any).name || "",
      description: (item as any).description || "",
      slug: (item as any).slug || "",
      genderId:
        kind === "categories"
          ? typeof (item as Category).gender === "string"
            ? (item as Category).gender
            : ((item as Category).gender as any)?._id || ""
          : kind === "styles"
            ? typeof (item as Style).gender === "string"
              ? (item as Style).gender
              : ((item as Style).gender as any)?._id || ""
            : "",
      parentCategoryId:
        kind === "subcategories"
          ? typeof (item as SubCategory).category === "string"
            ? ((item as SubCategory).category as string)
            : ((item as SubCategory).category as any)?._id || ""
          : "",
      imageFile: null,
      existingImage: item.image,
    };
    setModal(base);
  };

  const closeModal = () => {
    setModal(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!modal) return;
    setModal((prev) => prev ? { ...prev, imageFile: file } : prev);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const buildFormData = (): FormData => {
    if (!modal) return new FormData();
    const fd = new FormData();
    fd.append("name", modal.name.trim());
    if (modal.description) fd.append("description", modal.description.trim());
    if (modal.slug) fd.append("slug", modal.slug.trim());
    if ((modal.kind === "category" || modal.kind === "style") && modal.genderId) fd.append("gender", modal.genderId);
    if (modal.kind === "subcategory" && modal.parentCategoryId) fd.append("category", modal.parentCategoryId);
    if (modal.imageFile) fd.append("image", modal.imageFile);
    return fd;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modal || !modal.name.trim()) return;
    const fd = buildFormData();

    if (modal.kind === "category") {
      modal.mode === "create" ? onCreateCategory(fd) : onEditCategory(modal.id!, fd);
    } else if (modal.kind === "subcategory") {
      modal.mode === "create" ? onCreateSubCategory(fd) : onEditSubCategory(modal.id!, fd);
    } else if (modal.kind === "style") {
      modal.mode === "create" ? onCreateStyle(fd) : onEditStyle(modal.id!, fd);
    } else if (modal.kind === "gender") {
      modal.mode === "create" ? onCreateGender(fd) : onEditGender(modal.id!, fd);
    }
    closeModal();
  };

  const confirmDelete = (kind: TabKey, id: string) => {
    if (!window.confirm(`Delete this ${tabLabels[kind].slice(0, -1).toLowerCase()}?`)) return;
    if (kind === "categories") onDeleteCategory(id);
    else if (kind === "subcategories") onDeleteSubCategory(id);
    else if (kind === "styles") onDeleteStyle(id);
    else if (kind === "genders") onDeleteGender(id);
  };

  const visibleCategories = genderFilter === "all"
    ? categories
    : categories.filter((category) => {
        const genderId = typeof category.gender === "string" ? category.gender : category.gender?._id || "";
        return genderId === genderFilter;
      });

  const visibleStyles = genderFilter === "all"
    ? styles
    : styles.filter((style) => {
        const genderId = typeof style.gender === "string" ? style.gender : style.gender?._id || "";
        return genderId === genderFilter;
      });

  const visibleSubcategories = subcategories.filter((subcategory) => {
    if (genderFilter === "all") return true;
    const category = typeof subcategory.category === "string" ? null : subcategory.category;
    const genderId = category?.gender
      ? typeof category.gender === "string"
        ? category.gender
        : category.gender._id || ""
      : "";
    return genderId === genderFilter;
  });

  const renderTable = () => {
    if (activeTab === "categories") {
      return (
        <div className="admin-table-wrap">
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <select value={genderFilter} onChange={(event) => setGenderFilter(event.target.value)} style={{ padding: "0.55rem 0.75rem", border: "1px solid #d4d4c8", borderRadius: 6 }}>
              <option value="all">All Genders</option>
              {genders.map((gender) => (
                <option key={gender._id} value={gender._id}>{gender.name}</option>
              ))}
            </select>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 64 }}>Image</th>
                <th>Name</th>
                <th>Gender</th>
                <th>Description</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleCategories.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: "center", color: "#888", padding: "2rem" }}>No categories yet</td></tr>
              )}
              {visibleCategories.map((c) => {
                const genderName = typeof c.gender === "string" ? c.gender : c.gender?.name || "—";
                return (
                <tr key={c._id}>
                  <td>
                    {c.image
                      ? <img src={c.image} alt={c.name} style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 6, border: "1px solid #e5e5e0" }} />
                      : <span style={{ width: 48, height: 48, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#f5f4ef", borderRadius: 6, color: "#aaa", fontSize: 20 }}>🏷️</span>}
                  </td>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td style={{ color: "#666" }}>{genderName}</td>
                  <td style={{ color: "#666", fontSize: "0.88rem" }}>{c.description || "—"}</td>
                  <td>
                    <div className="admin-inline-actions">
                      <button className="admin-btn" style={{ padding: "0.3rem 0.7rem", fontSize: "0.8rem" }} onClick={() => openEdit("categories", c)}>Edit</button>
                      <button className="admin-btn admin-btn-danger" style={{ padding: "0.3rem 0.7rem", fontSize: "0.8rem" }} onClick={() => confirmDelete("categories", c._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    if (activeTab === "subcategories") {
      const categoryLookup = new Map(categories.map((category) => [category._id, category]));
      return (
        <div className="admin-table-wrap">
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <select value={genderFilter} onChange={(event) => setGenderFilter(event.target.value)} style={{ padding: "0.55rem 0.75rem", border: "1px solid #d4d4c8", borderRadius: 6 }}>
              <option value="all">All Genders</option>
              {genders.map((gender) => (
                <option key={gender._id} value={gender._id}>{gender.name}</option>
              ))}
            </select>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 64 }}>Image</th>
                <th>Name</th>
                <th>Parent Category</th>
                <th>Gender</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleSubcategories.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: "center", color: "#888", padding: "2rem" }}>No subcategories yet</td></tr>
              )}
              {visibleSubcategories.map((s) => {
                const parentCategory = typeof s.category === "string" ? categoryLookup.get(s.category) : s.category;
                const parentGender = parentCategory?.gender;
                const genderName = parentGender ? (typeof parentGender === "string" ? parentGender : parentGender.name || "—") : "—";
                return (
                <tr key={s._id}>
                  <td>
                    {s.image
                      ? <img src={s.image} alt={s.name} style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 6, border: "1px solid #e5e5e0" }} />
                      : <span style={{ width: 48, height: 48, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#f5f4ef", borderRadius: 6, color: "#aaa", fontSize: 20 }}>📂</span>}
                  </td>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td style={{ color: "#666" }}>{typeof s.category === "string" ? s.category : s.category?.name || "—"}</td>
                  <td style={{ color: "#666" }}>{genderName}</td>
                  <td>
                    <div className="admin-inline-actions">
                      <button className="admin-btn" style={{ padding: "0.3rem 0.7rem", fontSize: "0.8rem" }} onClick={() => openEdit("subcategories", s)}>Edit</button>
                      <button className="admin-btn admin-btn-danger" style={{ padding: "0.3rem 0.7rem", fontSize: "0.8rem" }} onClick={() => confirmDelete("subcategories", s._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    if (activeTab === "styles") {
      return (
        <div className="admin-table-wrap">
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <select value={genderFilter} onChange={(event) => setGenderFilter(event.target.value)} style={{ padding: "0.55rem 0.75rem", border: "1px solid #d4d4c8", borderRadius: 6 }}>
              <option value="all">All Genders</option>
              {genders.map((gender) => (
                <option key={gender._id} value={gender._id}>{gender.name}</option>
              ))}
            </select>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 64 }}>Image</th>
                <th>Name</th>
                <th>Gender</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleStyles.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: "center", color: "#888", padding: "2rem" }}>No styles yet</td></tr>
              )}
              {visibleStyles.map((st) => {
                const genderName = typeof st.gender === "string" ? st.gender : st.gender?.name || "—";
                return (
                <tr key={st._id}>
                  <td>
                    {st.image
                      ? <img src={st.image} alt={st.name} style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 6, border: "1px solid #e5e5e0" }} />
                      : <span style={{ width: 48, height: 48, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#f5f4ef", borderRadius: 6, color: "#aaa", fontSize: 20 }}>🎨</span>}
                  </td>
                  <td style={{ fontWeight: 600 }}>{st.name}</td>
                  <td style={{ color: "#666" }}>{genderName}</td>
                  <td>
                    <div className="admin-inline-actions">
                      <button className="admin-btn" style={{ padding: "0.3rem 0.7rem", fontSize: "0.8rem" }} onClick={() => openEdit("styles", st)}>Edit</button>
                      <button className="admin-btn admin-btn-danger" style={{ padding: "0.3rem 0.7rem", fontSize: "0.8rem" }} onClick={() => confirmDelete("styles", st._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    if (activeTab === "genders") {
      return (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 64 }}>Image</th>
                <th>Name</th>
                <th>Slug</th>
                <th>Active</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {genders.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: "center", color: "#888", padding: "2rem" }}>No genders yet</td></tr>
              )}
              {genders.map((g) => (
                <tr key={g._id}>
                  <td>
                    {g.image
                      ? <img src={g.image} alt={g.name} style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 6, border: "1px solid #e5e5e0" }} />
                      : <span style={{ width: 48, height: 48, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#f5f4ef", borderRadius: 6, color: "#aaa", fontSize: 20 }}>👤</span>}
                  </td>
                  <td style={{ fontWeight: 600 }}>{g.name}</td>
                  <td style={{ color: "#888", fontFamily: "monospace", fontSize: "0.85rem" }}>{g.slug || "—"}</td>
                  <td>
                    <span style={{
                      display: "inline-block",
                      padding: "0.2rem 0.6rem",
                      borderRadius: 100,
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      background: g.isActive ? "#d4f5dc" : "#fde8e8",
                      color: g.isActive ? "#1a7a35" : "#943b2a",
                    }}>
                      {g.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="admin-inline-actions">
                      <button className="admin-btn" style={{ padding: "0.3rem 0.7rem", fontSize: "0.8rem" }} onClick={() => openEdit("genders", g)}>Edit</button>
                      <button className="admin-btn admin-btn-danger" style={{ padding: "0.3rem 0.7rem", fontSize: "0.8rem" }} onClick={() => confirmDelete("genders", g._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return null;
  };

  const modalTitle = modal
    ? `${modal.mode === "create" ? "Add" : "Edit"} ${
        modal.kind === "category" ? "Category" :
        modal.kind === "subcategory" ? "Sub-Category" :
        modal.kind === "style" ? "Style" : "Gender"
      }`
    : "";

  return (
    <section className="admin-content">
      {/* Sub-tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", borderBottom: "2px solid #e8ead0", paddingBottom: "0.5rem", flexWrap: "wrap" }}>
        {(Object.keys(tabLabels) as TabKey[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "0.5rem 1.2rem",
              borderRadius: "6px 6px 0 0",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.9rem",
              transition: "all 0.18s",
              background: activeTab === tab ? "#4a5c22" : "transparent",
              color: activeTab === tab ? "#fff" : "#6b6b60",
            }}
          >
            {tabLabels[tab]}
            <span style={{
              display: "inline-block",
              marginLeft: "0.4rem",
              padding: "0.05rem 0.5rem",
              borderRadius: 100,
              fontSize: "0.75rem",
              fontWeight: 700,
              background: activeTab === tab ? "rgba(255,255,255,0.25)" : "#e8ead0",
              color: activeTab === tab ? "#fff" : "#4a5c22",
            }}>
              {tab === "categories" ? categories.length : tab === "subcategories" ? subcategories.length : tab === "styles" ? styles.length : genders.length}
            </span>
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button
          className="admin-btn"
          style={{ alignSelf: "flex-start" }}
          onClick={() => openCreate(activeTab)}
        >
          + Add {tabLabels[activeTab].slice(0, -1)}
        </button>
      </div>

      {/* Table content */}
      <div className="admin-panel" style={{ padding: 0, overflow: "hidden" }}>
        {renderTable()}
      </div>

      {/* Modal */}
      {modal && (
        <div
          className="admin-modal-backdrop"
          onClick={closeModal}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}
        >
          <div
            className="admin-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 520, width: "100%", maxHeight: "90vh", display: "flex", flexDirection: "column", padding: 0, overflow: "hidden", borderRadius: 12 }}
          >
            {/* Modal Header */}
            <div style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid #e8ead0", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff" }}>
              <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "#1a1f0f" }}>{modalTitle}</h3>
              <button
                type="button"
                onClick={closeModal}
                style={{ background: "none", border: "1px solid #d4d4c8", borderRadius: 6, cursor: "pointer", padding: "0.3rem 0.8rem", color: "#666", fontSize: "0.9rem" }}
              >
                Close
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "1.5rem", overflowY: "auto", flex: 1 }}>
              <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
                {/* Name */}
                <div style={{ display: "grid", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>Name *</label>
                  <input
                    required
                    placeholder="Enter name..."
                    value={modal.name}
                    onChange={(e) => setModal((prev) => prev ? { ...prev, name: e.target.value } : prev)}
                    style={{ padding: "0.65rem 0.8rem", border: "1px solid #d4d4c8", borderRadius: 6, fontSize: "0.95rem" }}
                  />
                </div>

                {/* Description (for categories) */}
                {modal.kind === "category" && (
                  <div style={{ display: "grid", gap: "0.35rem" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>Description</label>
                    <textarea
                      placeholder="Optional description..."
                      value={modal.description}
                      onChange={(e) => setModal((prev) => prev ? { ...prev, description: e.target.value } : prev)}
                      rows={3}
                      style={{ padding: "0.65rem 0.8rem", border: "1px solid #d4d4c8", borderRadius: 6, fontSize: "0.95rem", resize: "vertical" }}
                    />
                  </div>
                )}

                {/* Slug (for genders) */}
                {modal.kind === "gender" && (
                  <div style={{ display: "grid", gap: "0.35rem" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>Slug</label>
                    <input
                      placeholder="e.g. women, men, kids"
                      value={modal.slug}
                      onChange={(e) => setModal((prev) => prev ? { ...prev, slug: e.target.value } : prev)}
                      style={{ padding: "0.65rem 0.8rem", border: "1px solid #d4d4c8", borderRadius: 6, fontSize: "0.95rem" }}
                    />
                  </div>
                )}

                {/* Parent category picker (for subcategories) */}
                {modal.kind === "subcategory" && (
                  <div style={{ display: "grid", gap: "0.35rem" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>Parent Category *</label>
                    <select
                      required
                      value={modal.parentCategoryId}
                      onChange={(e) => setModal((prev) => prev ? { ...prev, parentCategoryId: e.target.value } : prev)}
                      style={{ padding: "0.65rem 0.8rem", border: "1px solid #d4d4c8", borderRadius: 6, fontSize: "0.95rem", background: "#fff" }}
                    >
                      <option value="">Select category...</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {(modal.kind === "category" || modal.kind === "style") && (
                  <div style={{ display: "grid", gap: "0.35rem" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>Gender *</label>
                    <select
                      required
                      value={modal.genderId}
                      onChange={(e) => setModal((prev) => prev ? { ...prev, genderId: e.target.value } : prev)}
                      style={{ padding: "0.65rem 0.8rem", border: "1px solid #d4d4c8", borderRadius: 6, fontSize: "0.95rem", background: "#fff" }}
                    >
                      <option value="">Select gender...</option>
                      {genders.map((gender) => (
                        <option key={gender._id} value={gender._id}>{gender.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Image upload */}
                <div style={{ display: "grid", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3d4a20" }}>Image</label>

                  {/* Preview */}
                  {imagePreview && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "0.4rem" }}>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: "1px solid #d4d4c8" }}
                      />
                      <div style={{ fontSize: "0.82rem", color: "#666" }}>
                        {modal.imageFile ? <><strong style={{ color: "#4a5c22" }}>New file selected:</strong><br />{modal.imageFile.name}</> : "Current image"}
                      </div>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    style={{ padding: "0.4rem", border: "1px solid #d4d4c8", borderRadius: 6, fontSize: "0.9rem" }}
                  />
                  <p style={{ margin: 0, fontSize: "0.78rem", color: "#888" }}>JPEG, PNG, or WebP. Leave empty to keep existing image.</p>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.6rem", paddingTop: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={closeModal}
                    style={{ padding: "0.6rem 1.2rem", border: "1px solid #d4d4c8", borderRadius: 6, cursor: "pointer", background: "#fff", color: "#444", fontSize: "0.9rem" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="admin-btn"
                    style={{ padding: "0.6rem 1.4rem" }}
                  >
                    {modal.mode === "create" ? "Create" : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
