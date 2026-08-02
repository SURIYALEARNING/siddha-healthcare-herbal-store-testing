import { useTranslation } from "react-i18next";
import { ShoppingBag, ShieldCheck } from "lucide-react";

interface OrderSummaryProps {
  cart: { productId: string; name: string; discountPrice: number; quantity: number; image: string }[];
  subtotal: number;
  discountAmount: number;
  deliveryCharges: number;
  shippingCharge: number;
  packedWeight: number;
  shippingCourierName?: string;
  total: number;
  hasCoupon: boolean;
  orderSubmitting: boolean;
  paymentMethod: string;
}

export default function OrderSummary({
  cart, subtotal, discountAmount, deliveryCharges, shippingCharge, packedWeight, shippingCourierName,
  total, hasCoupon, orderSubmitting, paymentMethod,
}: OrderSummaryProps) {
  const { t } = useTranslation();
  const isRazorpay = paymentMethod !== "Cash on Delivery";

  return (
    <div className="lg:col-span-4 bg-white border border-gray-100 rounded-3xl p-6 sticky top-24 shadow-xs space-y-6">
      <h3 className="text-base font-bold font-display text-emerald-950 flex items-center">
        <ShoppingBag className="w-4.5 h-4.5 text-siddha-dark mr-1.5" />
        {t('checkout.orderSummary')} ({cart.length})
      </h3>

      <div className="max-h-56 overflow-y-auto divide-y divide-gray-100 pr-1 space-y-3">
        {cart.map((item) => (
          <div key={item.productId} className="flex items-center space-x-3 pt-3 first:pt-0">
            <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg border border-gray-100" />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-emerald-950 truncate">{item.name}</h4>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">₹{item.discountPrice} x {item.quantity}</p>
            </div>
            <span className="text-xs font-bold text-gray-800">₹{item.discountPrice * item.quantity}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-100 pt-4 space-y-3.5 text-xs text-gray-500 font-medium">
        <div className="flex justify-between">
          <span>{t('cart.itemsCostSubtotal')}</span>
          <span className="text-gray-800 font-bold">₹{subtotal}</span>
        </div>

        {packedWeight > 0 && (
          <div className="flex justify-between">
            <span>{t('checkout.packedWeight') || 'Packed Weight'}</span>
            <span className="text-gray-800 font-bold">{packedWeight}g</span>
          </div>
        )}

        {hasCoupon && (
          <div className="flex justify-between text-emerald-700 font-bold">
            <span>{t('checkout.couponDeduction')}</span>
            <span>- ₹{discountAmount}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span>{t('cart.shipping')}</span>
          {deliveryCharges === 0 ? (
            <span className="text-emerald-700 font-black">{t('cart.free')}</span>
          ) : (
            <span className="text-gray-800 font-bold">₹{deliveryCharges}</span>
          )}
        </div>
        {shippingCourierName && (
          <p className="text-right text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            via {shippingCourierName}
          </p>
        )}

        <div className="border-t border-gray-100 pt-4 flex justify-between text-lg font-black text-gray-800">
          <span>{t('cart.orderTotalCost')}</span>
          <span className="text-siddha-dark">₹{total}</span>
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-4 bg-siddha-gold hover:bg-yellow-500 text-siddha-dark font-black text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer shadow-lg shadow-yellow-500/10 disabled:opacity-55 disabled:cursor-not-allowed h-12"
        disabled={orderSubmitting}
      >
        {orderSubmitting ? (
          <span>{isRazorpay ? t('checkout.proceedingPayment') : t('checkout.proceedingCod')}</span>
        ) : (
          <span>{isRazorpay ? t('checkout.orderNow', { total }) : t('checkout.placeOrder', { total })}</span>
        )}
      </button>

      <div className="pt-2 flex items-center justify-center space-x-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>{t('checkout.ayushVerified')}</span>
      </div>
    </div>
  );
}
