import { useState } from "react";
import { BookOpen, Plus, Pencil, Trash2, X, ImagePlus, PlusCircle } from "lucide-react";
import { useApp } from "../../context/AppContext";
import TranslationInput from "../ui/TranslationInput";
import type { Blog } from "../../types";

export default function BlogTab() {
  const { blogs, blogCategories, adminAddBlog, adminEditBlog, adminDeleteBlog, adminAddBlogCategory, adminDeleteBlogCategory } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Blog | null>(null);
  const [form, setForm] = useState({ title: { en: "", ta: "" }, content: { en: "", ta: "" }, category: "", images: [""] });

  const resetForm = () => {
    setForm({ title: { en: "", ta: "" }, content: { en: "", ta: "" }, category: "", images: [""] });
    setEditing(null);
    setShowForm(false);
  };

  const handleAddCategory = async () => {
    const name = prompt("Enter new category name:");
    if (name && name.trim()) {
      const cat = await adminAddBlogCategory(name.trim());
      if (cat) setForm({ ...form, category: cat.name });
    }
  };

  const handleDeleteCategory = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const cat = blogCategories.find(c => c._id === id);
    if (!cat || !confirm(`Delete category "${cat.name}"?`)) return;
    const ok = await adminDeleteBlogCategory(id);
    if (!ok) alert("Failed to delete category.");
  };

  const addImageInput = () => {
    setForm({ ...form, images: [...form.images, ""] });
  };

  const removeImageInput = (index: number) => {
    if (form.images.length <= 1) return;
    setForm({ ...form, images: form.images.filter((_, i) => i !== index) });
  };

  const updateImage = (index: number, value: string) => {
    const updated = [...form.images];
    updated[index] = value;
    setForm({ ...form, images: updated });
  };

  const toTrans = (val: any): { en: string; ta: string } => {
    if (!val) return { en: "", ta: "" };
    if (typeof val === "string") return { en: val, ta: "" };
    return { en: val.en || "", ta: val.ta || "" };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.en || !form.content.en) return;
    const payload = {
      title: form.title,
      content: form.content,
      category: form.category,
      images: form.images.filter(Boolean),
    };
    const ok = editing
      ? await adminEditBlog(editing.id, payload)
      : await adminAddBlog(payload);
    if (ok) resetForm();
    else alert("Failed to save blog.");
  };

  const handleEdit = (blog: Blog) => {
    setForm({
      title: toTrans(blog.title),
      content: toTrans(blog.content),
      category: blog.category,
      images: blog.images && blog.images.length > 0 ? [...blog.images] : (blog.image ? [blog.image] : [""]),
    });
    setEditing(blog);
    setShowForm(true);
  };

  const blogTitle = (blog: Blog) => toTrans(blog.title).en;

  const handleDelete = async (blog: Blog) => {
    if (!confirm(`Delete "${blogTitle(blog)}"?`)) return;
    const ok = await adminDeleteBlog(blog.id);
    if (!ok) alert("Failed to delete blog.");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-5 bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold font-display text-emerald-950">
            {editing ? "Edit Article" : "Publish New Article"}
          </h3>
          {showForm && (
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <p className="text-xs text-gray-400 uppercase font-bold tracking-widest block leading-none">
          {editing ? "Modify existing blog content" : "Share wellness knowledge"}
        </p>

        {showForm ? (
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <TranslationInput
              label="Title *"
              enValue={form.title.en}
              taValue={form.title.ta}
              onEnChange={(v) => setForm({ ...form, title: { ...form.title, en: v } })}
              onTaChange={(v) => setForm({ ...form, title: { ...form.title, ta: v } })}
              placeholder="Blog title"
              required
            />

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Category</label>
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="text-[10px] text-siddha-dark font-bold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <PlusCircle className="w-3 h-3" /> New
                </button>
              </div>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-150 focus:border-siddha-dark rounded-xl text-xs text-gray-800 font-semibold"
              >
                <option value="">Select category</option>
                {blogCategories.map((cat) => (
                  <option key={cat._id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
              {form.category && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-emerald-600 font-semibold">Selected: {form.category}</span>
                  {blogCategories.find(c => c.name === form.category) && (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteCategory(e, blogCategories.find(c => c.name === form.category)!._id)}
                      className="text-[10px] text-rose-400 hover:text-rose-600 cursor-pointer"
                      title="Delete this category"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>

            <TranslationInput
              label="Content *"
              type="textarea"
              rows={6}
              enValue={form.content.en}
              taValue={form.content.ta}
              onEnChange={(v) => setForm({ ...form, content: { ...form.content, en: v } })}
              onTaChange={(v) => setForm({ ...form, content: { ...form.content, ta: v } })}
              placeholder="Write article content..."
              required
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Blog Images</label>
                <button
                  type="button"
                  onClick={addImageInput}
                  className="text-[10px] text-siddha-dark font-bold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <ImagePlus className="w-3 h-3" /> Add Image
                </button>
              </div>
              {form.images.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://..."
                    value={url}
                    onChange={(e) => updateImage(index, e.target.value)}
                    className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-150 focus:border-siddha-dark rounded-xl text-xs text-gray-800 font-mono"
                  />
                  {form.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageInput(index)}
                      className="text-rose-400 hover:text-rose-600 px-2 cursor-pointer"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {form.images.filter(Boolean).length > 1 && (
                <p className="text-[10px] text-gray-400 italic">{form.images.filter(Boolean).length} images will show as carousel</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-siddha-dark hover:bg-emerald-800 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              {editing ? "Update Article" : "Publish Article"}
            </button>
          </form>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-8 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:text-siddha-dark hover:border-siddha-dark transition-colors flex flex-col items-center gap-2 cursor-pointer"
          >
            <Plus className="w-6 h-6" />
            <span className="text-xs font-bold uppercase tracking-wider">New Article</span>
          </button>
        )}
      </div>

      <div className="lg:col-span-7 bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-4">
        <h3 className="text-base font-bold text-emerald-950 border-b border-gray-50 pb-2 flex items-center">
          <BookOpen className="w-5 h-5 text-siddha-gold mr-1" />
          Published Articles ({blogs.length})
        </h3>

        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {blogs.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8">No articles published yet.</p>
          ) : (
            blogs.map((blog) => (
              <div key={blog.id} className="bg-slate-50 border border-gray-150 rounded-2xl p-4 flex gap-4">
                {blog.image && (
                  <img
                    src={blog.image}
                    alt={blogTitle(blog)}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-black text-siddha-dark uppercase truncate">{blogTitle(blog)}</p>
                      <span className="text-[10px] text-siddha-gold font-bold uppercase">{blog.category}</span>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => handleEdit(blog)}
                        className="p-1.5 hover:bg-white rounded-lg text-gray-400 hover:text-siddha-dark transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(blog)}
                        className="p-1.5 hover:bg-white rounded-lg text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{toTrans(blog.content).en}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-400">
                    <span>{blog.author}</span>
                    <span>{blog.date ? new Date(blog.date).toLocaleDateString() : ""}</span>
                    <span>{blog.reads} reads</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
