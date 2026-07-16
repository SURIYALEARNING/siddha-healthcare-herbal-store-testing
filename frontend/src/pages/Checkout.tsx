import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import ShippingForm from "../components/checkout/ShippingForm";
import PaymentSelector from "../components/checkout/PaymentSelector";
import OrderSummary from "../components/checkout/OrderSummary";
import { fetchRazorpayConfigApi, createRazorpayOrderApi, verifyRazorpayPaymentApi } from "../api";

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

  const subtotal = cart.reduce((acc, item) => acc + item.discountPrice * item.quantity, 0);
  const discountAmount = activeCoupon ? Math.round(subtotal * (activeCoupon.percent / 100)) : 0;
  const deliveryCharges = subtotal > 500 ? 0 : 50;
  const total = subtotal - discountAmount + deliveryCharges;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!fullName || !mobileNumber || !address || !state || !district || !pincode) {
      setValidationError("Please fill out all required shipping fields.");
      return;
    }
    if (!/^[0-9]{10}$/.test(mobileNumber)) {
      setValidationError("Please specify a valid 10-digit mobile number.");
      return;
    }
    if (!/^[0-9]{6}$/.test(pincode)) {
      setValidationError("Please specify a valid 6-digit postal pincode.");
      return;
    }

    setOrderSubmitting(true);

    const shippingAddress = { address, state, district, pincode };

    if (paymentMethod === "Cash on Delivery") {
      const placedOrder = await submitOrder(shippingAddress, mobileNumber, email, fullName, paymentMethod);
      setOrderSubmitting(false);
      if (placedOrder) navigate("/track-order", { state: { justPlacedId: placedOrder.id } });
    } else {
      try {
        await loadRazorpayScript();
        const config = await fetchRazorpayConfigApi();
        if (!config) throw new Error("Failed to fetch payment config");
        const orderData = await createRazorpayOrderApi(total);
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
                verified.razorpayPaymentId
              );
              setOrderSubmitting(false);
              if (placedOrder) navigate("/track-order", { state: { justPlacedId: placedOrder.id } });
            } else {
              setValidationError("Payment verification failed. Please contact support.");
              setOrderSubmitting(false);
            }
          },
          modal: {
            ondismiss: () => {
              setOrderSubmitting(false);
              setValidationError("Payment cancelled. Please try again.");
            },
          },
        });
        razorpay.open();
      } catch (err: any) {
        setValidationError(err.message || "Payment processing failed.");
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
          <PaymentSelector paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />
        </div>
        <OrderSummary
          cart={cart}
          subtotal={subtotal}
          discountAmount={discountAmount}
          deliveryCharges={deliveryCharges}
          total={total}
          hasCoupon={!!activeCoupon}
          orderSubmitting={orderSubmitting}
          paymentMethod={paymentMethod}
        />
      </form>
    </div>
  );
}
