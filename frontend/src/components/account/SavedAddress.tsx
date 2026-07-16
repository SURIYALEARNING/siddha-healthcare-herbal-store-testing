import { AlertCircle } from "lucide-react";
import type { User } from "../../types";

interface SavedAddressProps {
  user: User;
}

export default function SavedAddress({ user }: SavedAddressProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-base font-bold text-gray-850 uppercase tracking-wider border-b border-gray-50 pb-2.5">Saved Shipping Address</h3>

      {user.address ? (
        <div className="border border-gray-150 rounded-2xl p-5 space-y-3 bg-slate-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-siddha-light rounded-full filter blur-xl opacity-20"></div>
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <span className="text-[10px] bg-siddha-light text-siddha-dark font-bold px-2 py-0.5 rounded uppercase tracking-wider">Default Delivery Destination</span>
              <h4 className="font-bold text-emerald-950 mt-2.5">{user.fullName}</h4>
              <p className="text-xs text-gray-500 leading-normal mt-1">{user.address.address}</p>
              <p className="text-xs text-gray-500 font-semibold leading-none mt-1">{user.address.district}, {user.address.state} - {user.address.pincode}</p>
              <p className="text-xs font-medium text-gray-400 font-mono mt-2 flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5 shrink-0"></span>
                Mobile Contact: {user.mobileNumber}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-gray-250 rounded-2xl p-6">
          <AlertCircle className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="text-xs text-gray-400 mt-2">No dynamic shipping address stored yet. Go back to Profile tab and enter address fields.</p>
        </div>
      )}
    </div>
  );
}
