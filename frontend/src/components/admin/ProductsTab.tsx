import { useEffect, useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit3, Trash2, Search } from 'lucide-react';
import { useToastContext } from '../../context/ToastContext';
import { fetchCategoriesApi } from '../../api/categories';
import ProductForm, { EMPTY_PRODUCT_FORM } from './ProductForm';
import type { Product } from '../../types';
import type { ProductFormState } from './ProductForm';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';

interface ProductsTabProps {
  products: Product[];
  onAddProduct: (data: Partial<Product>) => Promise<boolean>;
  onEditProduct: (id: string, data: Partial<Product>) => Promise<boolean>;
  onDeleteProduct: (id: string) => Promise<boolean>;
}

const ITEMS_PER_PAGE = 10;

function getTransValue(val: any, lang: string): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  return val[lang] || val.en || '';
}

function mapProductToForm(p: Product): ProductFormState {
  const mapTransArr = (items: any[]): { en: string; ta: string }[] =>
    (items || []).map((item) => {
      if (typeof item === 'string') return { en: item, ta: '' };
      return { en: item.en || '', ta: item.ta || '' };
    });

  const categoryId = typeof p.category === 'object' && p.category
    ? (p.category as any)._id || '' : (p.category as string);

  return {
    name: { en: getTransValue(p.name, 'en'), ta: getTransValue(p.name, 'ta') },
    productMotto: { en: getTransValue(p.productMotto, 'en'), ta: getTransValue(p.productMotto, 'ta') },
    shortDescription: { en: getTransValue(p.shortDescription, 'en'), ta: getTransValue(p.shortDescription, 'ta') },
    description: { en: getTransValue(p.description, 'en'), ta: getTransValue(p.description, 'ta') },
    expiryDuration: { en: getTransValue(p.expiryDuration, 'en'), ta: getTransValue(p.expiryDuration, 'ta') },
    category: categoryId,
    price: p.price,
    discountPrice: p.discountPrice,
    stock: p.stock,
    size: p.size || { value: 100, unit: 'ml' },
    ingredients: mapTransArr(p.ingredients),
    benefits: mapTransArr(p.benefits),
    usageInstructions: mapTransArr(p.usageInstructions),
    safetyInstructions: mapTransArr(p.safetyInstructions || []),
    storageInstructions: mapTransArr(p.storageInstructions || []),
    tags: mapTransArr(p.tags || []),
    images: p.images.length > 0 ? p.images : [''],
    media: p.media || [],
    isFeatured: p.isFeatured || false,
    isActive: p.isActive !== false,
  };
}

export default function ProductsTab({ products, onAddProduct, onEditProduct, onDeleteProduct }: ProductsTabProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { showSuccess, showError } = useToastContext();

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(EMPTY_PRODUCT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<{ _id: string; name: { en: string } }[]>([]);

  useEffect(() => {
    fetchCategoriesApi().then((data) => setCategories(data as any)).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter((p) => {
      const name = getTransValue(p.name, lang).toLowerCase();
      const catName = typeof p.category === 'object' && p.category
        ? getTransValue((p.category as any).name, lang)
        : (p.category as string);
      return name.includes(q) || catName.toLowerCase().includes(q);
    });
  }, [products, search, lang]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = useMemo(
    () => filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE),
    [filtered, safePage]
  );

  useEffect(() => { setCurrentPage(1); }, [search]);

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_PRODUCT_FORM);
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p._id);
    setForm(mapProductToForm(p));
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('admin.deleteProduct'))) return;
    try {
      await onDeleteProduct(id);
      showSuccess(t('messages.successMessage'), 'Product deleted successfully');
    } catch {
      showError(t('messages.errorMessage'), 'Failed to delete product');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.en || !form.description.en) return;

    const mapToTrans = (items: { en: string; ta: string }[]) =>
      items.filter((i) => i.en.trim() || i.ta.trim()).map((i) => ({ en: i.en.trim(), ta: i.ta.trim() }));

    const payload: Partial<Product> = {
      name: { en: form.name.en, ta: form.name.ta },
      productMotto: { en: form.productMotto.en, ta: form.productMotto.ta },
      shortDescription: { en: form.shortDescription.en, ta: form.shortDescription.ta },
      description: { en: form.description.en, ta: form.description.ta },
      expiryDuration: { en: form.expiryDuration.en, ta: form.expiryDuration.ta },
      category: form.category,
      price: Number(form.price),
      discountPrice: Number(form.discountPrice),
      stock: Number(form.stock),
      size: form.size,
      ingredients: mapToTrans(form.ingredients),
      benefits: mapToTrans(form.benefits),
      usageInstructions: mapToTrans(form.usageInstructions),
      safetyInstructions: mapToTrans(form.safetyInstructions),
      storageInstructions: mapToTrans(form.storageInstructions),
      tags: mapToTrans(form.tags),
      images: form.images.filter(Boolean),
      media: form.media,
      isFeatured: form.isFeatured,
      isActive: form.isActive,
    };

    setSubmitting(true);
    try {
      const ok = editingId
        ? await onEditProduct(editingId, payload)
        : await onAddProduct(payload);

      if (ok) {
        showSuccess(
          t('messages.successMessage'),
          editingId ? 'Product updated successfully' : 'Product created successfully'
        );
        setModalOpen(false);
      }
    } catch {
      showError(t('messages.errorMessage'), editingId ? 'Failed to update product' : 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryName = (p: Product): string => {
    const cat = p.category;
    if (typeof cat === 'object' && cat) {
      return getTransValue((cat as any).name, lang);
    }
    return cat as string;
  };

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-lg font-bold font-display text-emerald-900">
          {t('admin.products')} ({products.length})
        </h2>
        <Button onClick={openAdd} variant="primary" size="sm">
          <Plus className="w-4 h-4 mr-1 inline" />
          {t('admin.addProduct')}
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`${t('common.search')}...`}
          className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-siddha-dark focus:bg-white"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left min-w-[900px]">
          <thead>
            <tr className="border-b border-gray-200 text-gray-400 uppercase font-black tracking-widest text-[10px]">
              <th className="py-3 pr-2 w-12">Image</th>
              <th className="py-3 pr-4">Name (EN)</th>
              <th className="py-3 pr-4">Name (TA)</th>
              <th className="py-3 pr-4">Category</th>
              <th className="py-3 pr-4">Price</th>
              <th className="py-3 pr-4">Stock</th>
              <th className="py-3 pr-4">Featured</th>
              <th className="py-3 pr-4">Active</th>
              <th className="py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginated.map((p) => (
              <tr key={p._id} className="hover:bg-gray-50/50">
                <td className="py-3 pr-2">
                  {p.media && p.media[0] ? (
                    p.media[0].type === 'video' ? (
                      <video src={p.media[0].url} className="w-10 h-10 rounded-xl object-cover border border-gray-100" />
                    ) : (
                      <img src={p.media[0].url} alt="" className="w-10 h-10 rounded-xl object-cover border border-gray-100" />
                    )
                  ) : p.images && p.images[0] ? (
                    <img src={p.images[0]} alt="" className="w-10 h-10 rounded-xl object-cover border border-gray-100" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gray-100" />
                  )}
                </td>
                <td className="py-3 pr-4 font-medium text-gray-800 truncate max-w-[180px]">
                  {getTransValue(p.name, 'en')}
                </td>
                <td className="py-3 pr-4 text-gray-600 truncate max-w-[180px]">
                  {getTransValue(p.name, 'ta')}
                </td>
                <td className="py-3 pr-4 text-gray-500 truncate max-w-[140px]">
                  {getCategoryName(p)}
                </td>
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
            {paginated.length === 0 && (
              <tr>
                <td colSpan={9} className="py-12 text-center text-gray-400 text-sm">
                  {search ? 'No products match your search' : 'No products yet'}
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
            disabled={safePage === 1}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 cursor-pointer disabled:cursor-default"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer ${
                p === safePage
                  ? 'bg-siddha-dark text-white'
                  : 'border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 cursor-pointer disabled:cursor-default"
          >
            Next
          </button>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? t('admin.editProduct') : t('admin.addProduct')}
        size="xl"
      >
        <ProductForm
          state={form}
          editingId={editingId}
          onChange={setForm}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          categories={categories}
          submitting={submitting}
        />
      </Modal>
    </div>
  );
}
