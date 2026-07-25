import { useTranslation } from "react-i18next";
import { CartItem } from "../../types";
import { formatCurrency } from "../../utils";
import { Button } from "../ui/Button";

interface CartSummaryProps {
  cart: CartItem[];
  activeCoupon: { code: string; percent: number } | null;
  onApplyCoupon: (code: string) => void;
  onRemoveCoupon: () => void;
  onCheckout: () => void;
}

export function CartSummary({ cart, activeCoupon, onApplyCoupon, onRemoveCoupon, onCheckout }: CartSummaryProps) {
  const { t } = useTranslation();
  const subtotal = cart.reduce((sum, item) => sum + item.discountPrice * item.quantity, 0);
  const discount = activeCoupon ? Math.round(subtotal * (activeCoupon.percent / 100)) : 0;
  const total = subtotal - discount;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
      <h2 className="text-xl font-bold text-gray-800 mb-6">{t('cart.orderSummary')}</h2>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">{t('cart.subtotal')}</span>
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>
        {activeCoupon && (
          <div className="flex justify-between text-emerald-600">
            <span>{t('cart.couponDiscount', { percent: activeCoupon.percent })}</span>
            <span>−{formatCurrency(discount)}</span>
          </div>
        )}
        <div className="border-t pt-3 flex justify-between text-lg font-bold">
          <span>{t('cart.total')}</span>
          <span className="text-emerald-600">{formatCurrency(total)}</span>
        </div>
      </div>
      <Button className="w-full mt-6" onClick={onCheckout} disabled={cart.length === 0}>
        {t('cart.checkout')}
      </Button>
    </div>
  );
}
