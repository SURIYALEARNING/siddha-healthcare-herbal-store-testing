import { useState } from "react";
import { Edit3, Trash2 } from "lucide-react";
import ProductForm, { EMPTY_PRODUCT_FORM } from "./ProductForm";
import type { Product } from "../../types";

interface ProductsTabProps {
  products: Product[];
  onAddProduct: (data: Partial<Product>) => Promise<boolean>;
  onEditProduct: (id: string, data: Partial<Product>) => Promise<boolean>;
  onDeleteProduct: (id: string) => Promise<boolean>;
}

export default function ProductsTab({ products, onAddProduct, onEditProduct, onDeleteProduct }: ProductsTabProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_PRODUCT_FORM);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.description) return;

    const payload = {
      name: form.name,
      price: Number(form.price),
      discountPrice: Number(form.discountPrice),
      category: form.category,
      stock: Number(form.stock),
      description: form.description,
      images: [form.image],
      ingredients: form.ingredients.split(",").map(i => i.trim()).filter(Boolean),
      benefits: form.benefits.split(",").map(i => i.trim()).filter(Boolean),
      usageInstructions: form.usage.split(",").map(i => i.trim()).filter(Boolean),
      rating: 5,
      reviews: [],
    };

    const ok = editingId
      ? await onEditProduct(editingId, payload)
      : await onAddProduct(payload);

    if (ok) {
      alert(editingId ? "Siddha formulation updated successfully!" : "New traditional remedy added to pharmacy!");
      resetForm();
    }
  };

  const startEdit = (p: Product) => {
    setEditingId(p._id);
    setForm({
      name: p.name,
      price: p.price,
      discountPrice: p.discountPrice,
      category: p.category,
      stock: p.stock,
      description: p.description,
      ingredients: p.ingredients?.join(", ") || "",
      benefits: p.benefits?.join(", ") || "",
      usage: p.usageInstructions?.join(", ") || "",
      image: p.images[0],
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY_PRODUCT_FORM);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
      <ProductForm
        state={form}
        editingId={editingId}
        onChange={setForm}
        onSubmit={handleSubmit}
        onCancel={resetForm}
      />

      <div className="lg:col-span-7 bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-4 overflow-x-auto">
        <h3 className="text-base font-bold font-display text-emerald-900 border-b border-gray-55 pb-2">
          Active Store Pharmacy Catalog ({products.length} Items)
        </h3>

        <table className="w-full text-xs text-left min-w-140">
          <thead>
            <tr className="border-b border-gray-150 text-gray-400 uppercase font-black tracking-widest text-[9px]">
              <th className="py-3">Name & Info</th>
              <th>Category</th>
              <th>Cost Prices</th>
              <th>Stock balance</th>
              <th className="text-right">Manage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-semibold">
            {products.map((p) => (
              <tr key={p._id}>
                <td className="py-3.5 flex items-center space-x-2.5">
                  <img src={p.images[0]} alt={p.name} className="w-8 h-8 object-cover rounded border bg-slate-50" />
                  <div className="truncate max-w-44">
                    <p className="font-bold text-gray-800 truncate leading-none">{p.name}</p>
                    <span className="text-[10px] text-gray-400 font-mono mt-1">{p._id}</span>
                  </div>
                </td>
                <td className="text-gray-500">{p.category}</td>
                <td>
                  <p className="font-bold text-gray-700 font-mono">₹{p.discountPrice}</p>
                  <span className="text-[10px] text-gray-405 line-through font-mono">₹{p.price}</span>
                </td>
                <td>
                  <span className={`px-2 py-0.5 rounded text-[10px] ${p.stock <= 0 ? "bg-rose-100 text-rose-800" : "bg-emerald-50 text-emerald-800"}`}>
                    {p.stock <= 0 ? "Sold-Out" : `${p.stock} units`}
                  </span>
                </td>
                <td className="text-right">
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => startEdit(p)}
                      className="p-1.5 text-gray-500 hover:text-siddha-dark transition-colors"
                      title="Edit remedy details"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm("Do you want to permanently erase this traditional formulation from catalog?")) {
                          onDeleteProduct(p._id);
                        }
                      }}
                      className="p-1.5 text-rose-650 hover:text-rose-850"
                      title="Erase formula"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
