import { useTranslation } from 'react-i18next';

interface TranslationInputProps {
  label: string;
  enValue: string;
  taValue: string;
  onEnChange: (value: string) => void;
  onTaChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'textarea';
  rows?: number;
  required?: boolean;
}

export default function TranslationInput({
  label,
  enValue,
  taValue,
  onEnChange,
  onTaChange,
  placeholder = '',
  type = 'text',
  rows = 3,
  required = false,
}: TranslationInputProps) {
  const { t } = useTranslation();
  const InputTag = type === 'textarea' ? 'textarea' : 'input';

  return (
    <div className="space-y-3">
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">English</span>
          <InputTag
            value={enValue}
            onChange={(e) => onEnChange(e.target.value)}
            placeholder={placeholder}
            {...(type === 'textarea' ? { rows } : {})}
            className={`w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-siddha-dark/20 focus:border-siddha-dark ${type === 'textarea' ? 'resize-y min-h-[80px]' : ''}`}
            required={required}
          />
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">தமிழ்</span>
          <InputTag
            value={taValue}
            onChange={(e) => onTaChange(e.target.value)}
            placeholder={placeholder}
            {...(type === 'textarea' ? { rows } : {})}
            className={`w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-siddha-dark/20 focus:border-siddha-dark ${type === 'textarea' ? 'resize-y min-h-[80px]' : ''}`}
            required={required}
          />
        </div>
      </div>
    </div>
  );
}
