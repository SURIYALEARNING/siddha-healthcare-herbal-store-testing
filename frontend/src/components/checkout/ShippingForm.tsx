import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { INDIAN_STATES } from "../../constants/indianStates";

interface ShippingFormProps {
  fullName: string; setFullName: (v: string) => void;
  mobileNumber: string; setMobileNumber: (v: string) => void;
  email: string; setEmail: (v: string) => void;
  address: string; setAddress: (v: string) => void;
  state: string; setState: (v: string) => void;
  district: string; setDistrict: (v: string) => void;
  pincode: string; setPincode: (v: string) => void;
  validationError: string;
  error: string | null;
  user: any;
}

export default function ShippingForm({
  fullName, setFullName, mobileNumber, setMobileNumber, email, setEmail,
  address, setAddress, state, setState, district, setDistrict, pincode, setPincode,
  validationError, error, user,
}: ShippingFormProps) {
  const { t } = useTranslation();
  return (
    <>
      <Link
        to="/cart"
        className="inline-flex items-center space-x-1 text-xs font-bold text-gray-500 hover:text-siddha-dark uppercase tracking-wider mb-6 cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>{t('checkout.returnToCart')}</span>
      </Link>

      <div className="mb-8 border-b border-gray-100 pb-5">
        <h1 className="text-3xl font-bold font-display text-emerald-950 tracking-tight">{t('checkout.checkoutGate')}</h1>
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mt-1">{t('checkout.formSubtitle')}</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
        <h3 className="text-base font-bold font-display text-emerald-950">{t('checkout.shippingInfo')}</h3>

        {validationError && (
          <p className="p-3 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl text-xs font-bold">
            {validationError}
          </p>
        )}

        {error && (
          <p className="p-3 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl text-xs font-bold font-mono">
            {error}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">{t('checkout.fullName')}</label>
            <input type="text" placeholder={t('checkout.placeholders.fullName')} value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 focus:border-siddha-dark focus:bg-white text-xs rounded-xl focus:outline-none text-gray-800 font-medium" required />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">{t('checkout.mobileNumber')}</label>
            <input type="text" placeholder={t('checkout.placeholders.mobileNumber')} value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 focus:border-siddha-dark focus:bg-white text-xs rounded-xl focus:outline-none text-gray-800 font-medium font-mono" required />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">{t('checkout.emailAddress')}</label>
          <input type="email" placeholder={t('checkout.placeholders.email')} value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 focus:border-siddha-dark focus:bg-white text-xs rounded-xl focus:outline-none text-gray-800" />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">{t('checkout.address')}</label>
          <input type="text" placeholder={t('checkout.placeholders.address')} value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 focus:border-siddha-dark focus:bg-white text-xs rounded-xl focus:outline-none text-gray-800" required />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">{t('checkout.district')}</label>
            <input type="text" placeholder={t('checkout.placeholders.district')} value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 focus:border-siddha-dark focus:bg-white text-xs rounded-xl focus:outline-none text-gray-800 font-medium" required />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">{t('checkout.state')}</label>
            <select value={state} onChange={(e) => setState(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-150 focus:border-siddha-dark rounded-xl text-xs text-gray-700 font-semibold cursor-pointer">
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">{t('checkout.pincode')}</label>
            <input type="text" placeholder={t('checkout.placeholders.pincode')} value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 focus:border-siddha-dark focus:bg-white text-xs rounded-xl focus:outline-none text-gray-800 font-medium font-mono" required />
          </div>
        </div>

        {!user && (
          <p className="text-[11px] bg-amber-50 text-amber-900 px-3.5 py-2.5 rounded-xl font-medium border border-amber-200">
            {t('checkout.guestMessage')}
            <Link to="/auth" className="text-siddha-dark font-black underline ml-1">{t('checkout.loginRegister')}</Link>
            {t('checkout.guestMessageSuffix')}
          </p>
        )}
      </div>
    </>
  );
}
