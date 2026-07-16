import { Plus, Save } from "lucide-react";

interface ProductFormState {
  name: string;
  price: number;
  discountPrice: number;
  category: string;
  stock: number;
  description: string;
  ingredients: string;
  benefits: string;
  usage: string;
  image: string;
}

interface ProductFormProps {
  state: ProductFormState;
  editingId: string | null;
  onChange: (state: ProductFormState) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const RESET_FORM: ProductFormState = {
  name: "",
  price: 350,
  discountPrice: 280,
  category: "Immunity Boosters",
  stock: 25,
  description: "",
  ingredients: "",
  benefits: "",
  usage: "",
  image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600",
};

export const EMPTY_PRODUCT_FORM = RESET_FORM;

interface FieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

function Field({ label, required, children }: FieldProps) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-gray-400 uppercase">{label}{required && " *"}</label>
      {children}
    </div>
  );
}

export default function ProductForm({ state, editingId, onChange, onSubmit, onCancel }: ProductFormProps) {
  const set = (partial: Partial<ProductFormState>) => onChange({ ...state, ...partial });

  return (
    <div className="lg:col-span-5 bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-5">
      <h3 className="text-base font-bold font-display text-emerald-950 flex items-center">
        <Plus className="w-5 h-5 text-siddha-gold mr-1" />
        {editingId ? "Edit traditional remedy" : "Authorize brand new remedy"}
      </h3>

      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Remedy Name" required>
          <input
            type="text"
            placeholder="Ex. Organic Sandal Herbal Tablet"
            value={state.name}
            onChange={(e) => set({ name: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-150 focus:border-siddha-dark rounded-xl text-xs focus:bg-white text-gray-800"
            required
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Original Price (₹)" required>
            <input
              type="number"
              value={state.price}
              onChange={(e) => set({ price: Number(e.target.value) })}
              className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs focus:bg-white font-mono"
              required
            />
          </Field>
          <Field label="Offer Discounted Price (₹)" required>
            <input
              type="number"
              value={state.discountPrice}
              onChange={(e) => set({ discountPrice: Number(e.target.value) })}
              className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs focus:bg-white font-mono"
              required
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Therapeutic Category" required>
            <select
              value={state.category}
              onChange={(e) => set({ category: e.target.value })}
              className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs cursor-pointer"
            >
              <option value="Immunity Boosters">Immunity Boosters</option>
              <option value="Digestive Care">Digestive Care</option>
              <option value="Skin Care">Skin Care</option>
              <option value="Hair Care">Hair Care</option>
            </select>
          </Field>
          <Field label="Stock units" required>
            <input
              type="number"
              value={state.stock}
              onChange={(e) => set({ stock: Number(e.target.value) })}
              className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs focus:bg-white font-mono"
            />
          </Field>
        </div>

        <Field label="Image Resource URL" required>
          <input
            type="text"
            value={state.image}
            onChange={(e) => set({ image: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs focus:bg-white text-gray-550"
            required
          />
        </Field>

        <Field label="Raw ingredients (Comma separated list)">
          <input
            type="text"
            placeholder="Ex. Sandalwood Extract, Curcumin Extract, Tulsi, Cardamom"
            value={state.ingredients}
            onChange={(e) => set({ ingredients: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs focus:bg-white placeholder-gray-400"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Dosage Guidelines">
            <input
              type="text"
              placeholder="Take with hot water, morning chew empty stomach"
              value={state.usage}
              onChange={(e) => set({ usage: e.target.value })}
              className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs focus:bg-white placeholder-gray-400"
            />
          </Field>
          <Field label="Therapeutic Benefits">
            <input
              type="text"
              placeholder="Quenches dry skin heat, purifies liver sluggish"
              value={state.benefits}
              onChange={(e) => set({ benefits: e.target.value })}
              className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs focus:bg-white placeholder-gray-400"
            />
          </Field>
        </div>

        <Field label="Product Description" required>
          <textarea
            value={state.description}
            onChange={(e) => set({ description: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-150 rounded-xl text-xs focus:bg-white"
            required
          />
        </Field>

        <div className="pt-2 flex gap-2">
          <button
            type="submit"
            className="w-full py-3 px-4 bg-siddha-dark hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1"
          >
            <Save className="w-4 h-4 text-siddha-gold" />
            <span>{editingId ? "Apply Edits" : "Insert Formula"}</span>
          </button>
          {editingId && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-3 bg-slate-100 text-gray-600 rounded-xl text-xs font-bold"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
