import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "../context/AppContext";
import ShippingForm from "../components/checkout/ShippingForm";
import PaymentSelector from "../components/checkout/PaymentSelector";
import CourierSelector from "../components/checkout/CourierSelector";
import OrderSummary from "../components/checkout/OrderSummary";
import { fetchRazorpayConfigApi, createRazorpayOrderApi, verifyRazorpayPaymentApi } from "../api";
import { calculateShippingApi } from "../api/shipping";
import type { ShippingOption } from "../types";

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).Razorpay) { resolve(); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
    document.body.appendChild(script);
  });
}

export default function Checkout() {
  const { t } = useTranslation();
  const { cart, activeCoupon, user, submitOrder, error } = useApp();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [state, setState] = useState("Tamil Nadu");
  const [district, setDistrict] = useState("");
  const [pincode, setPincode] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");

  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [packedWeight, setPackedWeight] = useState(0);
  const [selectedCourierId, setSelectedCourierId] = useState("");
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState("");

  const subtotal = cart.reduce((acc, item) => acc + item.discountPrice * item.quantity, 0);
  const discountAmount = activeCoupon ? Math.round(subtotal * (activeCoupon.percent / 100)) : 0;

  const selectedCourier = shippingOptions.find((o) => o.courierId === selectedCourierId) || null;
  const shippingCharge = selectedCourier?.charge ?? 0;
  const hasShipping = selectedCourier != null;
  const deliveryCharges = hasShipping ? shippingCharge : 0;
  const total = subtotal - discountAmount + deliveryCharges;

  const validPincode = /^[0-9]{6}$/.test(pincode);
  const validAddress = !!(state && district && validPincode);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setMobileNumber(user.mobileNumber || "");
      setEmail(user.email);
      if (user.address) {
        setAddress(user.address.address || "");
        setState(user.address.state || "Tamil Nadu");
        setDistrict(user.address.district || "");
        setPincode(user.address.pincode || "");
      }
    }
  }, [user]);

  useEffect(() => {
    if (cart.length === 0 && !orderSubmitting) {
      navigate("/cart");
    }
  }, [cart, navigate, orderSubmitting]);

  const recalcShipping = useCallback(() => {
    if (!validAddress || cart.length === 0) {
      setShippingOptions([]);
      setSelectedCourierId("");
      setPackedWeight(0);
      setShippingError("");
      return;
    }

    let cancelled = false;
    setShippingLoading(true);
    setShippingError("");

    calculateShippingApi({
      items: cart.map((c) => ({ productId: c.productId, quantity: c.quantity })),
      pincode,
      state,
      district,
    })
      .then((res) => {
        if (cancelled) return;
        setPackedWeight(res.packedWeight || 0);
        const options = res.options || [];
        setShippingOptions(options);
        setSelectedCourierId((prev) => {
          const available = options.map((o) => o.courierId);
          if (prev && available.includes(prev)) return prev;
          return res.selected?.courierId || options[0]?.courierId || "";
        });
      })
      .catch(() => {
        if (cancelled) return;
        setShippingOptions([]);
        setSelectedCourierId("");
        setPackedWeight(0);
        setShippingError(t('checkout.validation.shippingUnavailable') || "Could not calculate shipping for this address.");
      })
      .finally(() => {
        if (!cancelled) setShippingLoading(false);
      });

    return () => { cancelled = true; };
  }, [validAddress, cart, pincode, state, district, t]);

  useEffect(() => {
    return recalcShipping();
  }, [recalcShipping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!fullName || !mobileNumber || !address || !state || !district || !pincode) {
      setValidationError(t('checkout.validation.fillFields'));
      return;
    }
    if (!/^[0-9]{10}$/.test(mobileNumber)) {
      setValidationError(t('checkout.validation.invalidMobile'));
      return;
    }
    if (!/^[0-9]{6}$/.test(pincode)) {
      setValidationError(t('checkout.validation.invalidPincode'));
      return;
    }

    if (shippingLoading) {
      setValidationError(t('checkout.validation.shippingLoading'));
      return;
    }
    if (!selectedCourier) {
      setValidationError(t('checkout.validation.shippingRequired'));
      return;
    }

    setOrderSubmitting(true);

    const shippingAddress = { address, state, district, pincode };
    const courierId = selectedCourier?.courierId;

    if (paymentMethod === "Cash on Delivery") {
      const placedOrder = await submitOrder(shippingAddress, mobileNumber, email, fullName, paymentMethod, undefined, courierId);
      setOrderSubmitting(false);
      if (placedOrder) navigate("/track-order", { state: { justPlacedId: placedOrder.id } });
    } else {
      try {
        await loadRazorpayScript();
        const config = await fetchRazorpayConfigApi();
        if (!config) throw new Error("Failed to fetch payment config");
        const orderData = await createRazorpayOrderApi({
          items: cart.map(c => ({ productId: c.productId, quantity: c.quantity })),
          couponCode: activeCoupon?.code,
          shippingAddress,
          courierId,
        });
        if (!orderData) throw new Error("Failed to create Razorpay order");

        const razorpay = new (window as any).Razorpay({
          key: config.key,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "Siddha Healthcare",
          description: "Herbal Store Purchase",
          order_id: orderData.orderId,
          prefill: { name: fullName, email, contact: mobileNumber },
          handler: async (response: any) => {
            const verified = await verifyRazorpayPaymentApi(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );
            if (verified?.success) {
              const placedOrder = await submitOrder(
                shippingAddress, mobileNumber, email, fullName, paymentMethod,
                verified.razorpayPaymentId, courierId
              );
              setOrderSubmitting(false);
              if (placedOrder) navigate("/track-order", { state: { justPlacedId: placedOrder.id } });
            } else {
              setValidationError(t('checkout.validation.paymentFailed'));
              setOrderSubmitting(false);
            }
          },
          modal: {
            ondismiss: () => {
              setOrderSubmitting(false);
              setValidationError(t('checkout.validation.paymentCancelled'));
            },
          },
        });
        razorpay.open();
      } catch (err: any) {
        setValidationError(err.message || t('checkout.validation.paymentFailed'));
        setOrderSubmitting(false);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-8 space-y-8">
          <ShippingForm
            fullName={fullName} setFullName={setFullName}
            mobileNumber={mobileNumber} setMobileNumber={setMobileNumber}
            email={email} setEmail={setEmail}
            address={address} setAddress={setAddress}
            state={state} setState={setState}
            district={district} setDistrict={setDistrict}
            pincode={pincode} setPincode={setPincode}
            validationError={validationError} error={error} user={user}
          />
          {shippingError && (
            <p className="p-3 bg-amber-50 text-amber-700 border border-amber-100 rounded-xl text-xs font-bold">
              {shippingError}
            </p>
          )}
          <CourierSelector
            options={shippingOptions}
            selectedCourierId={selectedCourierId}
            onSelect={setSelectedCourierId}
            packedWeight={packedWeight}
            loading={shippingLoading}
          />
          <PaymentSelector paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />
        </div>
        <OrderSummary
          cart={cart}
          subtotal={subtotal}
          discountAmount={discountAmount}
          deliveryCharges={deliveryCharges}
          shippingCharge={shippingCharge}
          packedWeight={packedWeight}
          shippingCourierName={selectedCourier?.courierName}
          total={total}
          hasCoupon={!!activeCoupon}
          orderSubmitting={orderSubmitting}
          paymentMethod={paymentMethod}
        />
      </form>
    </div>
  );
}
