import { Plus, Save } from "lucide-react";
import TranslationInput from "../ui/TranslationInput";
import SizeSelector from "../ui/SizeSelector";
import MediaUploader from "../ui/MediaUploader";
import { Button } from "../ui/Button";
import type { MediaItem } from "../../types";

export interface ProductFormState {
  name: { en: string; ta: string };
  productMotto: { en: string; ta: string };
  shortDescription: { en: string; ta: string };
  description: { en: string; ta: string };
  expiryDuration: { en: string; ta: string };
  category: string;
  price: number;
  discountPrice: number;
  stock: number;
  size: { value: number; unit: 'mg' | 'g' | 'kg' | 'ml' | 'L' | 'capsule' | 'tablet' | 'pcs' };
  ingredients: { en: string; ta: string }[];
  benefits: { en: string; ta: string }[];
  usageInstructions: { en: string; ta: string }[];
  safetyInstructions: { en: string; ta: string }[];
  storageInstructions: { en: string; ta: string }[];
  tags: { en: string; ta: string }[];
  images: string[];
  media: MediaItem[];
  isFeatured: boolean;
  isActive: boolean;
}

const emptyT = { en: "", ta: "" };
const RESET_FORM: ProductFormState = {
  name: { ...emptyT },
  productMotto: { ...emptyT },
  shortDescription: { ...emptyT },
  description: { ...emptyT },
  expiryDuration: { ...emptyT },
  category: "",
  price: 350,
  discountPrice: 280,
  stock: 25,
  size: { value: 100, unit: "ml" },
  ingredients: [],
  benefits: [],
  usageInstructions: [],
  safetyInstructions: [],
  storageInstructions: [],
  tags: [],
  images: ["https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600"],
  media: [],
  isFeatured: false,
  isActive: true,
};

export const EMPTY_PRODUCT_FORM = RESET_FORM;

interface ProductFormProps {
  state: ProductFormState;
  editingId: string | null;
  onChange: (state: ProductFormState) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  categories?: { _id: string; name: { en: string } }[];
  submitting?: boolean;
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-gray-400 uppercase">{label}{required && " *"}</label>
      {children}
    </div>
  );
}

function TransArrayInput({
  label,
  items,
  onItemsChange,
}: {
  label: string;
  items: { en: string; ta: string }[];
  onItemsChange: (items: { en: string; ta: string }[]) => void;
}) {
  const addItem = () => onItemsChange([...items, { en: "", ta: "" }]);
  const removeItem = (i: number) => onItemsChange(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, lang: "en" | "ta", value: string) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [lang]: value };
    onItemsChange(updated);
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 items-start">
          <div className="flex-1 grid grid-cols-2 gap-2">
            <input
              value={item.en}
              onChange={(e) => updateItem(i, "en", e.target.value)}
              placeholder="English"
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-siddha-dark"
            />
            <input
              value={item.ta}
              onChange={(e) => updateItem(i, "ta", e.target.value)}
              placeholder="தமிழ்"
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-siddha-dark"
            />
          </div>
          <button type="button" onClick={() => removeItem(i)} className="p-2 text-red-500 hover:text-red-700 cursor-pointer">×</button>
        </div>
      ))}
      <button type="button" onClick={addItem} className="px-4 py-2 text-sm font-medium text-siddha-dark bg-siddha-light rounded-lg hover:bg-[#cbfcd9] transition-colors cursor-pointer">
        + Add More
      </button>
    </div>
  );
}

export default function ProductForm({ state, editingId, onChange, onSubmit, onCancel, categories, submitting }: ProductFormProps) {
  const set = (partial: Partial<ProductFormState>) => onChange({ ...state, ...partial });
  const updateTrans = (field: keyof Pick<ProductFormState, "name" | "productMotto" | "shortDescription" | "description" | "expiryDuration">, lang: "en" | "ta", value: string) => {
    onChange({ ...state, [field]: { ...state[field], [lang]: value } });
  };

  return (
    <div className="lg:col-span-5 bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-5">
      <h3 className="text-base font-bold font-display text-emerald-950 flex items-center">
        <Plus className="w-5 h-5 text-siddha-gold mr-1" />
        {editingId ? "Edit traditional remedy" : "Authorize brand new remedy"}
      </h3>

      <form onSubmit={onSubmit} className="space-y-4">
        <TranslationInput
          label="Remedy Name"
          enValue={state.name.en}
          taValue={state.name.ta}
          onEnChange={(v) => updateTrans("name", "en", v)}
          onTaChange={(v) => updateTrans("name", "ta", v)}
          required
        />

        <TranslationInput
          label="Product Motto"
          enValue={state.productMotto.en}
          taValue={state.productMotto.ta}
          onEnChange={(v) => updateTrans("productMotto", "en", v)}
          onTaChange={(v) => updateTrans("productMotto", "ta", v)}
        />

        <TranslationInput
          label="Short Description"
          enValue={state.shortDescription.en}
          taValue={state.shortDescription.ta}
          onEnChange={(v) => updateTrans("shortDescription", "en", v)}
          onTaChange={(v) => updateTrans("shortDescription", "ta", v)}
          type="textarea"
          rows={2}
        />

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
              required
            >
              <option value="">Select category</option>
              {categories?.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name.en}</option>
              ))}
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

        <MediaUploader
          media={state.media}
          onChange={(media) => set({ media })}
        />

        <SizeSelector
          size={state.size}
          onSizeChange={(s) => set({ size: s })}
        />

        <TransArrayInput
          label="Ingredients"
          items={state.ingredients}
          onItemsChange={(items) => set({ ingredients: items })}
        />

        <TransArrayInput
          label="Benefits"
          items={state.benefits}
          onItemsChange={(items) => set({ benefits: items })}
        />

        <TransArrayInput
          label="Usage Instructions"
          items={state.usageInstructions}
          onItemsChange={(items) => set({ usageInstructions: items })}
        />

        <TransArrayInput
          label="Safety Instructions"
          items={state.safetyInstructions}
          onItemsChange={(items) => set({ safetyInstructions: items })}
        />

        <TransArrayInput
          label="Storage Instructions"
          items={state.storageInstructions}
          onItemsChange={(items) => set({ storageInstructions: items })}
        />

        <TransArrayInput
          label="Tags"
          items={state.tags}
          onItemsChange={(items) => set({ tags: items })}
        />

        <TranslationInput
          label="Expiry Duration"
          enValue={state.expiryDuration.en}
          taValue={state.expiryDuration.ta}
          onEnChange={(v) => updateTrans("expiryDuration", "en", v)}
          onTaChange={(v) => updateTrans("expiryDuration", "ta", v)}
        />

        <TranslationInput
          label="Product Description"
          enValue={state.description.en}
          taValue={state.description.ta}
          onEnChange={(v) => updateTrans("description", "en", v)}
          onTaChange={(v) => updateTrans("description", "ta", v)}
          type="textarea"
          rows={4}
          required
        />

        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={state.isFeatured}
              onChange={(e) => set({ isFeatured: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-siddha-dark focus:ring-siddha-dark/20 cursor-pointer"
            />
            <span className="text-sm font-medium text-gray-700">Featured</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={state.isActive}
              onChange={(e) => set({ isActive: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-siddha-dark focus:ring-siddha-dark/20 cursor-pointer"
            />
            <span className="text-sm font-medium text-gray-700">Active</span>
          </label>
        </div>

        <div className="pt-2 flex gap-2">
          <Button type="submit" variant="primary" className="w-full" loading={submitting}>
            <Save className="w-4 h-4 mr-1" />
            {editingId ? "Apply Edits" : "Insert Formula"}
          </Button>
          {editingId && (
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
