import React, { useState } from "react";

type Category = { _id: string; name?: string; description?: string; image?: string };
type SubCategory = { _id: string; name?: string; category?: { _id?: string; name?: string } | string; image?: string };
type Style = { _id: string; name?: string; image?: string };
type Gender = { _id: string; name?: string; slug?: string; image?: string; isActive?: boolean };

type Props = {
  categories: Category[];
  subcategories: SubCategory[];
  styles: Style[];
  genders: Gender[];
  onCreateCategory: (payload: { name: string; description?: string; image?: string }) => void;
  onEditCategory: (id: string, payload: any) => void;
  onDeleteCategory: (id: string) => void;
  onCreateSubCategory: (payload: { name: string; category: string; image?: string }) => void;
  onEditSubCategory: (id: string, payload: any) => void;
  onDeleteSubCategory: (id: string) => void;
  onCreateStyle: (payload: { name: string; image?: string }) => void;
  onEditStyle: (id: string, payload: any) => void;
  onDeleteStyle: (id: string) => void;
  onCreateGender: (payload: { name: string; slug?: string; image?: string }) => void;
  onEditGender: (id: string, payload: any) => void;
  onDeleteGender: (id: string) => void;
};

export default function AdminCategoriesTab({ categories, subcategories, styles, genders, onCreateCategory, onEditCategory, onDeleteCategory, onCreateSubCategory, onEditSubCategory, onDeleteSubCategory, onCreateStyle, onEditStyle, onDeleteStyle, onCreateGender, onEditGender, onDeleteGender }: Props) {
  const [catName, setCatName] = useState("");
  const [catImage, setCatImage] = useState("");
  const [subName, setSubName] = useState("");
  const [subCategoryParent, setSubCategoryParent] = useState("");
  const [styleName, setStyleName] = useState("");
  const [genderName, setGenderName] = useState("");

  return (
    <section className="admin-content">
      <div className="admin-panel">
        <h2>Categories &amp; Related</h2>

        <div style={{ marginBottom: 20 }}>
          <h3>Categories</h3>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input placeholder="Name" value={catName} onChange={(e) => setCatName(e.target.value)} />
            <input placeholder="Image URL" value={catImage} onChange={(e) => setCatImage(e.target.value)} />
            <button className="admin-btn" onClick={() => { if (!catName) return alert("Name required"); onCreateCategory({ name: catName, image: catImage }); setCatName(""); setCatImage(""); }}>Create</button>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Name</th><th>Image</th><th>Actions</th></tr></thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c._id}>
                    <td>{c.name}</td>
                    <td>{c.image ? <img src={c.image} alt={c.name} style={{ width: 48, height: 48, objectFit: "contain" }} /> : "-"}</td>
                    <td>
                      <div className="admin-inline-actions">
                        <button className="admin-btn" onClick={() => {
                          const newName = prompt("Edit name", c.name || "");
                          if (newName != null) onEditCategory(c._id, { name: newName });
                        }}>Edit</button>
                        <button className="admin-btn admin-btn-danger" onClick={() => { if (confirm("Delete category?")) onDeleteCategory(c._id); }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <h3>Subcategories</h3>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input placeholder="Name" value={subName} onChange={(e) => setSubName(e.target.value)} />
            <select value={subCategoryParent} onChange={(e) => setSubCategoryParent(e.target.value)}>
              <option value="">Choose category</option>
              {categories.map((c) => <option value={c._id} key={c._id}>{c.name}</option>)}
            </select>
            <button className="admin-btn" onClick={() => { if (!subName || !subCategoryParent) return alert("Name and parent required"); onCreateSubCategory({ name: subName, category: subCategoryParent }); setSubName(""); }}>Create</button>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Name</th><th>Parent</th><th>Actions</th></tr></thead>
              <tbody>
                {subcategories.map((s) => (
                  <tr key={s._id}>
                    <td>{s.name}</td>
                    <td>{typeof s.category === "string" ? s.category : s.category?.name || "-"}</td>
                    <td>
                      <div className="admin-inline-actions">
                        <button className="admin-btn" onClick={() => {
                          const newName = prompt("Edit subcategory name", s.name || "");
                          if (newName != null) onEditSubCategory(s._id, { name: newName });
                        }}>Edit</button>
                        <button className="admin-btn admin-btn-danger" onClick={() => { if (confirm("Delete subcategory?")) onDeleteSubCategory(s._id); }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <h3>Styles</h3>
          <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
            <input placeholder="Name" value={styleName} onChange={(e) => setStyleName(e.target.value)} />
            <input placeholder="Image URL" onChange={(e) => {
              const input = e.target as HTMLInputElement;
              setStyleName(input.value || "");
            }} style={{ display: "none" }} id="styleImageInput" />
            <button className="admin-btn" onClick={() => { if (!styleName) return alert("Name required"); onCreateStyle({ name: styleName }); setStyleName(""); }}>Create</button>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Name</th><th>Image</th><th>Actions</th></tr></thead>
              <tbody>
                {styles.map((st) => (
                  <tr key={st._id}>
                    <td>{st.name}</td>
                    <td>{st.image ? <img src={st.image} alt={st.name} style={{ width: 48, height: 48, objectFit: "contain" }} /> : "-"}</td>
                    <td>
                      <div className="admin-inline-actions">
                        <button className="admin-btn" onClick={() => {
                          const newName = prompt("Edit style name", st.name || "");
                          if (newName != null) onEditStyle(st._id, { name: newName });
                        }}>Edit</button>
                        <button className="admin-btn" onClick={() => {
                          const newImage = prompt("Edit style image URL", st.image || "");
                          if (newImage != null) onEditStyle(st._id, { image: newImage });
                        }}>Update Image</button>
                        <button className="admin-btn admin-btn-danger" onClick={() => { if (confirm("Delete style?")) onDeleteStyle(st._id); }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3>Genders</h3>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input placeholder="Name" value={genderName} onChange={(e) => setGenderName(e.target.value)} />
            <button className="admin-btn" onClick={() => { if (!genderName) return alert("Name required"); onCreateGender({ name: genderName }); setGenderName(""); }}>Create</button>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Name</th><th>Active</th><th>Actions</th></tr></thead>
              <tbody>
                {genders.map((g) => (
                  <tr key={g._id}>
                    <td>{g.name}</td>
                    <td>{g.isActive ? "Yes" : "No"}</td>
                    <td>
                      <div className="admin-inline-actions">
                        <button className="admin-btn" onClick={() => {
                          const newName = prompt("Edit gender name", g.name || "");
                          if (newName != null) onEditGender(g._id, { name: newName });
                        }}>Edit</button>
                        <button className="admin-btn admin-btn-danger" onClick={() => { if (confirm("Delete gender?")) onDeleteGender(g._id); }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
}
