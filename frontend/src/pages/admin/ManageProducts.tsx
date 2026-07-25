import { useEffect, useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit3, Trash2, Search } from 'lucide-react';
import { useToastContext } from '../../context/ToastContext';
import { fetchCategoriesApi } from '../../api/categories';
import { fetchProductsV2Api, createProductV2Api, updateProductV2Api, deleteProductV2Api, fetchProductByIdV2Api } from '../../api/productsV2';
import type { CategoryV2, ProductV2, Translation } from '../../types/v2';
import TranslationInput from '../../components/ui/TranslationInput';
import ImageUploader from '../../components/ui/ImageUploader';
import SizeSelector from '../../components/ui/SizeSelector';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';

const emptyT = { en: '', ta: '' };

interface ProductForm {
  name: { en: string; ta: string };
  slug: { en: string; ta: string };
  productMotto: { en: string; ta: string };
  shortDescription: { en: string; ta: string };
  description: { en: string; ta: string };
  expiryDuration: { en: string; ta: string };
  category: string;
  price: number;
  discountPrice: number;
  stock: number;
  size: { value: number; unit: 'ml' | 'mg' | 'g' | 'kg' | 'L' | 'capsule' | 'tablet' | 'pcs' };
  ingredients: { en: string; ta: string }[];
  benefits: { en: string; ta: string }[];
  usageInstructions: { en: string; ta: string }[];
  safetyInstructions: { en: string; ta: string }[];
  storageInstructions: { en: string; ta: string }[];
  tags: { en: string; ta: string }[];
  images: string[];
  isFeatured: boolean;
  isActive: boolean;
}

const initialForm: ProductForm = {
  name: { ...emptyT },
  slug: { ...emptyT },
  productMotto: { ...emptyT },
  shortDescription: { ...emptyT },
  description: { ...emptyT },
  expiryDuration: { ...emptyT },
  category: '',
  price: 0,
  discountPrice: 0,
  stock: 0,
  size: { value: 100, unit: 'ml' },
  ingredients: [],
  benefits: [],
  usageInstructions: [],
  safetyInstructions: [],
  storageInstructions: [],
  tags: [],
  images: [],
  isFeatured: false,
  isActive: true,
};

const ITEMS_PER_PAGE = 10;

function TranslationArrayInput({
  label,
  items,
  onItemsChange,
}: {
  label: string;
  items: { en: string; ta: string }[];
  onItemsChange: (items: { en: string; ta: string }[]) => void;
}) {
  const addItem = () => onItemsChange([...items, { en: '', ta: '' }]);
  const removeItem = (i: number) => onItemsChange(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, lang: 'en' | 'ta', value: string) => {
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
              onChange={(e) => updateItem(i, 'en', e.target.value)}
              placeholder="English"
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-siddha-dark"
            />
            <input
              value={item.ta}
              onChange={(e) => updateItem(i, 'ta', e.target.value)}
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

export default function ManageProducts() {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToastContext();

  const [products, setProducts] = useState<ProductV2[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState('');

  const [categories, setCategories] = useState<CategoryV2[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(initialForm);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await fetchCategoriesApi();
      setCategories(data);
    } catch {
      // silently fail for dropdown
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchProductsV2Api({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: search || undefined,
        category: categoryFilter || undefined,
        active: activeFilter === 'all' ? undefined : activeFilter === 'true' ? true : activeFilter === 'false' ? false : undefined,
        featured: featuredFilter === 'all' ? undefined : featuredFilter === 'true' ? true : featuredFilter === 'false' ? false : undefined,
      });
      setProducts(res.data);
      setTotalPages(res.pagination.totalPages);
      setTotalItems(res.pagination.total);
    } catch {
      showError(t('messages.errorMessage'), 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, categoryFilter, activeFilter, featuredFilter, showError, t]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, activeFilter, featuredFilter]);

  const openAdd = () => {
    setEditingId(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEdit = async (product: ProductV2) => {
    setEditingId(product._id);
    try {
      const detailed = await fetchProductByIdV2Api(product._id);
      const catId = typeof detailed.category === 'object' && detailed.category ? (detailed.category as CategoryV2)._id : (detailed.category as string);
      const mapTrans = (items: Translation[]): { en: string; ta: string }[] =>
        items.map((item) => ({ en: item.en || '', ta: item.ta || '' }));
      setForm({
        name: { en: detailed.name.en || '', ta: detailed.name.ta || '' },
        slug: { en: detailed.slug.en || '', ta: detailed.slug.ta || '' },
        productMotto: { en: detailed.productMotto?.en || '', ta: detailed.productMotto?.ta || '' },
        shortDescription: { en: detailed.shortDescription?.en || '', ta: detailed.shortDescription?.ta || '' },
        description: { en: detailed.description.en || '', ta: detailed.description.ta || '' },
        expiryDuration: { en: detailed.expiryDuration?.en || '', ta: detailed.expiryDuration?.ta || '' },
        category: catId,
        price: detailed.price,
        discountPrice: detailed.discountPrice,
        stock: detailed.stock,
        size: { value: detailed.size.value, unit: detailed.size.unit },
        ingredients: mapTrans(detailed.ingredients || []),
        benefits: mapTrans(detailed.benefits || []),
        usageInstructions: mapTrans(detailed.usageInstructions || []),
        safetyInstructions: mapTrans(detailed.safetyInstructions || []),
        storageInstructions: mapTrans(detailed.storageInstructions || []),
        tags: mapTrans(detailed.tags || []),
        images: detailed.images || [],
        isFeatured: detailed.isFeatured,
        isActive: detailed.isActive,
      });
      setModalOpen(true);
    } catch {
      showError(t('messages.errorMessage'), 'Failed to load product details');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('admin.deleteProduct'))) return;
    try {
      await deleteProductV2Api(id);
      showSuccess(t('messages.successMessage'), 'Product deleted successfully');
      fetchProducts();
    } catch {
      showError(t('messages.errorMessage'), 'Failed to delete product');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.en.trim() || !form.name.ta.trim()) {
      showError(t('messages.errorMessage'), 'Name in both languages is required');
      return;
    }
    if (!form.slug.en.trim() || !form.slug.ta.trim()) {
      showError(t('messages.errorMessage'), 'Slug in both languages is required');
      return;
    }
    if (!form.category) {
      showError(t('messages.errorMessage'), 'Category is required');
      return;
    }
    if (form.price < 0) {
      showError(t('messages.errorMessage'), 'Price must be a positive number');
      return;
    }

    setSubmitting(true);
    try {
      const mapToTrans = (items: { en: string; ta: string }[]): Translation[] =>
        items.filter((item) => item.en.trim() || item.ta.trim()).map((item) => ({ en: item.en.trim(), ta: item.ta.trim() }));

      const payload = {
        name: form.name,
        slug: form.slug,
        productMotto: form.productMotto,
        shortDescription: form.shortDescription,
        description: form.description,
        expiryDuration: form.expiryDuration,
        category: form.category,
        price: form.price,
        discountPrice: form.discountPrice,
        stock: form.stock,
        size: form.size,
        ingredients: mapToTrans(form.ingredients),
        benefits: mapToTrans(form.benefits),
        usageInstructions: mapToTrans(form.usageInstructions),
        safetyInstructions: mapToTrans(form.safetyInstructions),
        storageInstructions: mapToTrans(form.storageInstructions),
        tags: mapToTrans(form.tags),
        images: form.images,
        isFeatured: form.isFeatured,
        isActive: form.isActive,
      };

      if (editingId) {
        await updateProductV2Api(editingId, payload);
        showSuccess(t('messages.successMessage'), 'Product updated successfully');
      } else {
        await createProductV2Api(payload);
        showSuccess(t('messages.successMessage'), 'Product created successfully');
      }
      setModalOpen(false);
      fetchProducts();
    } catch {
      showError(t('messages.errorMessage'), editingId ? 'Failed to update product' : 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  const set = (partial: Partial<ProductForm>) => setForm((prev) => ({ ...prev, ...partial }));
  const updateTranslation = (field: keyof Pick<ProductForm, 'name' | 'slug' | 'productMotto' | 'shortDescription' | 'description' | 'expiryDuration'>, lang: 'en' | 'ta', value: string) => {
    setForm((prev) => ({ ...prev, [field]: { ...prev[field], [lang]: value } }));
  };

  const getCategoryName = (cat: CategoryV2 | string): string => {
    if (typeof cat === 'object' && cat) return cat.name?.en || cat._id;
    const found = categories.find((c) => c._id === cat);
    return found ? found.name?.en : cat;
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-lg font-bold font-display text-emerald-900">{t('admin.products')} ({totalItems})</h2>
        <Button onClick={openAdd} variant="primary" size="sm">
          <Plus className="w-4 h-4 mr-1 inline" />
          {t('admin.addProduct')}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`${t('common.search')}...`}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-siddha-dark focus:bg-white"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-siddha-dark cursor-pointer"
        >
          <option value="">{t('product.category')} - All</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>{cat.name.en}</option>
          ))}
        </select>
        <select
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-siddha-dark cursor-pointer"
        >
          <option value="">{t('common.active')} - All</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <select
          value={featuredFilter}
          onChange={(e) => setFeaturedFilter(e.target.value)}
          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-siddha-dark cursor-pointer"
        >
          <option value="">{t('common.featured')} - All</option>
          <option value="true">Featured</option>
          <option value="false">Not Featured</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left min-w-[900px]">
          <thead>
            <tr className="border-b border-gray-200 text-gray-400 uppercase font-black tracking-widest text-[10px]">
              <th className="py-3 pr-2 w-12">Image</th>
              <th className="py-3 pr-4">{t('auth.name')} (EN)</th>
              <th className="py-3 pr-4">{t('product.category')} (EN)</th>
              <th className="py-3 pr-4">{t('product.price')}</th>
              <th className="py-3 pr-4">{t('product.inStock')}</th>
              <th className="py-3 pr-4">{t('common.featured')}</th>
              <th className="py-3 pr-4">{t('common.active')}</th>
              <th className="py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map((p) => (
              <tr key={p._id} className="hover:bg-gray-50/50">
                <td className="py-3 pr-2">
                  {p.images && p.images[0] ? (
                    <img src={p.images[0]} alt="" className="w-10 h-10 rounded-xl object-cover border border-gray-100" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gray-100" />
                  )}
                </td>
                <td className="py-3 pr-4 font-medium text-gray-800 truncate max-w-[200px]">{p.name.en}</td>
                <td className="py-3 pr-4 text-gray-600 truncate max-w-[150px]">{getCategoryName(p.category)}</td>
                <td className="py-3 pr-4 font-mono text-sm">
                  <span className="font-bold text-gray-800">₹{p.discountPrice}</span>
                  {p.price > p.discountPrice && (
                    <span className="text-[10px] text-gray-400 line-through ml-1">₹{p.price}</span>
                  )}
                </td>
                <td className="py-3 pr-4">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                    p.stock <= 0 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {p.stock <= 0 ? 'Out' : p.stock}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  {p.isFeatured ? (
                    <span className="text-amber-500 text-xs font-bold">★ Yes</span>
                  ) : (
                    <span className="text-gray-300 text-xs">—</span>
                  )}
                </td>
                <td className="py-3 pr-4">
                  <span className={`inline-block w-2 h-2 rounded-full ${p.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                </td>
                <td className="py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => openEdit(p)}
                      className="p-1.5 text-gray-400 hover:text-siddha-dark transition-colors cursor-pointer"
                      title={t('admin.editProduct')}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                      title={t('admin.deleteProduct')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={8} className="py-12 text-center text-gray-400 text-sm">
                  {search || categoryFilter || activeFilter || featuredFilter ? 'No products match your filters' : 'No products yet'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 cursor-pointer disabled:cursor-default"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer ${
                p === currentPage
                  ? 'bg-siddha-dark text-white'
                  : 'border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 cursor-pointer disabled:cursor-default"
          >
            Next
          </button>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? t('admin.editProduct') : t('admin.addProduct')} size="xl">
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
          <div className="space-y-5">
            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Basic Info</h4>
            <TranslationInput
              label={t('auth.name')}
              enValue={form.name.en}
              taValue={form.name.ta}
              onEnChange={(v) => updateTranslation('name', 'en', v)}
              onTaChange={(v) => updateTranslation('name', 'ta', v)}
              required
            />
            <TranslationInput
              label="Slug"
              enValue={form.slug.en}
              taValue={form.slug.ta}
              onEnChange={(v) => updateTranslation('slug', 'en', v)}
              onTaChange={(v) => updateTranslation('slug', 'ta', v)}
              required
            />
            <TranslationInput
              label="Product Motto"
              enValue={form.productMotto.en}
              taValue={form.productMotto.ta}
              onEnChange={(v) => updateTranslation('productMotto', 'en', v)}
              onTaChange={(v) => updateTranslation('productMotto', 'ta', v)}
            />
            <TranslationInput
              label="Short Description"
              enValue={form.shortDescription.en}
              taValue={form.shortDescription.ta}
              onEnChange={(v) => updateTranslation('shortDescription', 'en', v)}
              onTaChange={(v) => updateTranslation('shortDescription', 'ta', v)}
              type="textarea"
              rows={2}
            />
            <TranslationInput
              label={t('product.description')}
              enValue={form.description.en}
              taValue={form.description.ta}
              onEnChange={(v) => updateTranslation('description', 'en', v)}
              onTaChange={(v) => updateTranslation('description', 'ta', v)}
              type="textarea"
              rows={3}
            />
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">{t('product.category')}</label>
              <select
                value={form.category}
                onChange={(e) => set({ category: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-siddha-dark cursor-pointer"
                required
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name.en}</option>
                ))}
              </select>
            </div>
            <ImageUploader
              images={form.images}
              onImagesChange={(imgs) => set({ images: imgs })}
              maxImages={5}
            />
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => set({ isFeatured: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-siddha-dark focus:ring-siddha-dark/20 cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700">{t('common.featured')}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => set({ isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-siddha-dark focus:ring-siddha-dark/20 cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700">{t('common.active')}</span>
              </label>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5 space-y-4">
            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Pricing & Stock</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">{t('product.price')}</label>
                <input
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(e) => set({ price: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-siddha-dark"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Discount Price</label>
                <input
                  type="number"
                  min={0}
                  value={form.discountPrice}
                  onChange={(e) => set({ discountPrice: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-siddha-dark"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">{t('product.inStock')}</label>
                <input
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={(e) => set({ stock: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-siddha-dark"
                />
              </div>
            </div>
            <SizeSelector
              size={form.size}
              onSizeChange={(s) => set({ size: s })}
            />
          </div>

          <div className="border-t border-gray-100 pt-5 space-y-5">
            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Multilingual Details</h4>
            <TranslationArrayInput
              label="Ingredients"
              items={form.ingredients}
              onItemsChange={(items) => set({ ingredients: items })}
            />
            <TranslationArrayInput
              label="Benefits"
              items={form.benefits}
              onItemsChange={(items) => set({ benefits: items })}
            />
            <TranslationArrayInput
              label="Usage Instructions"
              items={form.usageInstructions}
              onItemsChange={(items) => set({ usageInstructions: items })}
            />
            <TranslationArrayInput
              label="Safety Instructions"
              items={form.safetyInstructions}
              onItemsChange={(items) => set({ safetyInstructions: items })}
            />
            <TranslationArrayInput
              label="Storage Instructions"
              items={form.storageInstructions}
              onItemsChange={(items) => set({ storageInstructions: items })}
            />
            <TranslationArrayInput
              label="Tags"
              items={form.tags}
              onItemsChange={(items) => set({ tags: items })}
            />
            <TranslationInput
              label="Expiry Duration"
              enValue={form.expiryDuration.en}
              taValue={form.expiryDuration.ta}
              onEnChange={(v) => updateTranslation('expiryDuration', 'en', v)}
              onTaChange={(v) => updateTranslation('expiryDuration', 'ta', v)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {t('common.save')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
