import { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TagInputProps {
  label: string;
  items: string[];
  onItemsChange: (items: string[]) => void;
  placeholder?: string;
}

export default function TagInput({ label, items, onItemsChange, placeholder }: TagInputProps) {
  const { t } = useTranslation();
  const [input, setInput] = useState('');

  const addItem = () => {
    const trimmed = input.trim();
    if (trimmed && !items.includes(trimmed)) {
      onItemsChange([...items, trimmed]);
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
  };

  const removeItem = (index: number) => {
    onItemsChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || t('common.add') || 'Add...'}
          className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-siddha-dark/20 focus:border-siddha-dark"
        />
        <button
          type="button"
          onClick={addItem}
          className="px-4 py-2 bg-siddha-dark text-white text-sm font-semibold rounded-lg hover:bg-emerald-800 transition-colors cursor-pointer"
        >
          {t('common.add') || 'Add'}
        </button>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((item, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-siddha-light text-siddha-dark text-xs font-medium rounded-full">
              {item}
              <button type="button" onClick={() => removeItem(i)} className="hover:text-red-600 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
