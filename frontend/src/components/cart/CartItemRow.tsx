import { useTranslation } from "react-i18next";
import { CartItem } from "../../types";
import { formatCurrency } from "../../utils";

interface CartItemRowProps {
  item: CartItem;
  stock: number;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export function CartItemRow({ item, stock, onUpdateQuantity, onRemove }: CartItemRowProps) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100">
      <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-800 truncate">{item.name}</h3>
        <p className="text-emerald-600 font-bold mt-1">{formatCurrency(item.discountPrice)}</p>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center border rounded-lg">
            <button
              onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="px-3 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-30 cursor-pointer"
            >−</button>
            <span className="px-3 py-1 font-medium text-sm border-x">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
              disabled={item.quantity >= stock}
              className="px-3 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-30 cursor-pointer"
            >+</button>
          </div>
          <button onClick={() => onRemove(item.productId)} className="text-red-500 hover:text-red-700 text-sm cursor-pointer">{t('cart.removeProduct')}</button>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-gray-800">{formatCurrency(item.discountPrice * item.quantity)}</p>
      </div>
    </div>
  );
}
