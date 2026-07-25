import { useEffect, useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit3, Trash2, Search } from 'lucide-react';
import { useToastContext } from '../../context/ToastContext';
import { fetchCategoriesApi, createCategoryApi, updateCategoryApi, deleteCategoryApi } from '../../api/categories';
import type { CategoryV2 } from '../../types/v2';
import TranslationInput from '../../components/ui/TranslationInput';
import ImageUploader from '../../components/ui/ImageUploader';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';

interface CategoryForm {
  name: { en: string; ta: string };
  slug: { en: string; ta: string };
  description: { en: string; ta: string };
  image: string;
  isActive: boolean;
}

const emptyT = { en: '', ta: '' };
const EMPTY_FORM: CategoryForm = {
  name: { ...emptyT },
  slug: { ...emptyT },
  description: { ...emptyT },
  image: '',
  isActive: true,
};

const ITEMS_PER_PAGE = 10;

export default function ManageCategories() {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToastContext();

  const [categories, setCategories] = useState<CategoryV2[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryForm>(EMPTY_FORM);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCategoriesApi(false);
      setCategories(data);
    } catch {
      showError(t('messages.errorMessage'), 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [showError, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase();
    return categories.filter((c) => c.name.en?.toLowerCase().includes(q));
  }, [categories, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [filtered, currentPage]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (cat: CategoryV2) => {
    setEditingId(cat._id);
    setForm({
      name: { en: cat.name.en || '', ta: cat.name.ta || '' },
      slug: { en: cat.slug.en || '', ta: cat.slug.ta || '' },
      description: { en: cat.description.en || '', ta: cat.description.ta || '' },
      image: cat.image || '',
      isActive: cat.isActive,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('admin.deleteCategory'))) return;
    try {
      await deleteCategoryApi(id);
      showSuccess(t('messages.successMessage'), 'Category deleted successfully');
      fetchData();
    } catch {
      showError(t('messages.errorMessage'), 'Failed to delete category');
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
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description,
        image: form.image || undefined,
        isActive: form.isActive,
      };
      if (editingId) {
        await updateCategoryApi(editingId, payload);
        showSuccess(t('messages.successMessage'), 'Category updated successfully');
      } else {
        await createCategoryApi(payload);
        showSuccess(t('messages.successMessage'), 'Category created successfully');
      }
      setModalOpen(false);
      fetchData();
    } catch {
      showError(t('messages.errorMessage'), editingId ? 'Failed to update category' : 'Failed to create category');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-lg font-bold font-display text-emerald-900">{t('admin.categories')}</h2>
        <Button onClick={openAdd} variant="primary" size="sm">
          <Plus className="w-4 h-4 mr-1 inline" />
          {t('admin.addCategory')}
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
        <table className="w-full text-sm text-left min-w-[700px]">
          <thead>
            <tr className="border-b border-gray-200 text-gray-400 uppercase font-black tracking-widest text-[10px]">
              <th className="py-3 pr-2 w-12">{t('product.image') ?? 'Image'}</th>
              <th className="py-3 pr-4">{t('auth.name')} (EN)</th>
              <th className="py-3 pr-4">{t('auth.name')} (TA)</th>
              <th className="py-3 pr-4">Slug (EN)</th>
              <th className="py-3 pr-4">{t('common.active')}</th>
              <th className="py-3 text-right">{t('common.actions') ?? 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginated.map((cat) => (
              <tr key={cat._id} className="hover:bg-gray-50/50">
                <td className="py-3 pr-2">
                  {cat.image ? (
                    <img src={cat.image} alt="" className="w-10 h-10 rounded-xl object-cover border border-gray-100" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gray-100" />
                  )}
                </td>
                <td className="py-3 pr-4 font-medium text-gray-800">{cat.name.en}</td>
                <td className="py-3 pr-4 text-gray-600">{cat.name.ta}</td>
                <td className="py-3 pr-4 text-gray-500 text-xs font-mono">{cat.slug.en}</td>
                <td className="py-3 pr-4">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      cat.isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {cat.isActive ? t('common.yes') ?? 'Yes' : t('common.no') ?? 'No'}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => openEdit(cat)}
                      className="p-1.5 text-gray-400 hover:text-siddha-dark transition-colors cursor-pointer"
                      title={t('admin.editCategory')}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                      title={t('admin.deleteCategory')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-400 text-sm">
                  {search ? 'No categories match your search' : 'No categories yet'}
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? t('admin.editCategory') : t('admin.addCategory')} size="lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <TranslationInput
            label={t('auth.name')}
            enValue={form.name.en}
            taValue={form.name.ta}
            onEnChange={(v) => setForm({ ...form, name: { ...form.name, en: v } })}
            onTaChange={(v) => setForm({ ...form, name: { ...form.name, ta: v } })}
            required
          />
          <TranslationInput
            label="Slug"
            enValue={form.slug.en}
            taValue={form.slug.ta}
            onEnChange={(v) => setForm({ ...form, slug: { ...form.slug, en: v } })}
            onTaChange={(v) => setForm({ ...form, slug: { ...form.slug, ta: v } })}
            required
          />
          <TranslationInput
            label={t('product.description')}
            enValue={form.description.en}
            taValue={form.description.ta}
            onEnChange={(v) => setForm({ ...form, description: { ...form.description, en: v } })}
            onTaChange={(v) => setForm({ ...form, description: { ...form.description, ta: v } })}
            type="textarea"
            rows={3}
          />
          <ImageUploader
            images={form.image ? [form.image] : []}
            onImagesChange={(imgs) => setForm({ ...form, image: imgs[0] || '' })}
            maxImages={1}
          />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-siddha-dark focus:ring-siddha-dark/20 cursor-pointer"
            />
            <span className="text-sm font-medium text-gray-700">{t('common.active')}</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
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
