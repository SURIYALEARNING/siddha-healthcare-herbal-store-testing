import type { Size } from '../../types';

interface SizeSelectorProps {
  size: Size;
  onSizeChange: (size: Size) => void;
}

const UNITS = ['mg', 'g', 'kg', 'ml', 'L', 'capsule', 'tablet', 'pcs'] as const;

export default function SizeSelector({ size, onSizeChange }: SizeSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Size</label>
      <div className="flex gap-3">
        <div className="flex-1">
          <input
            type="number"
            min={0}
            step="0.1"
            value={size.value || ''}
            onChange={(e) => onSizeChange({ ...size, value: parseFloat(e.target.value) || 0 })}
            placeholder="Value"
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-siddha-dark/20 focus:border-siddha-dark"
          />
        </div>
        <div className="w-32">
          <select
            value={size.unit}
            onChange={(e) => onSizeChange({ ...size, unit: e.target.value as Size['unit'] })}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-siddha-dark/20 focus:border-siddha-dark cursor-pointer"
          >
            {UNITS.map((unit) => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
