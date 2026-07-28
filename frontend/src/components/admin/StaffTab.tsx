import { useEffect, useState, useCallback } from "react";
import { Plus, Edit3, Eye, Key, XCircle, CheckCircle, Trash2 } from "lucide-react";
import { useToastContext } from "../../context/ToastContext";
import {
  fetchStaffList, createStaff, updateStaff,
  updateStaffStatus, resetStaffPassword, deleteStaff,
} from "../../api/staff";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { Spinner } from "../ui/Spinner";
import type { User, PermissionKey, Permissions } from "../../types";

const PERMISSION_KEYS: { key: PermissionKey; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "products", label: "Products" },
  { key: "categories", label: "Categories" },
  { key: "orders", label: "Orders" },
  { key: "customers", label: "Customers" },
  { key: "batches", label: "Batch Management" },
  { key: "reminders", label: "Medicine Reminders" },
  { key: "reviews", label: "Reviews" },
  { key: "coupons", label: "Coupons" },
  { key: "carousel", label: "Promo Carousel" },
  { key: "consultations", label: "Doctor Consults" },
  { key: "shipping", label: "Shipping & Delivery" },
  { key: "staffManagement", label: "Staff Management" },
];

const EMPTY_PERMS: Permissions = Object.fromEntries(PERMISSION_KEYS.map(p => [p.key, false])) as Permissions;

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString();
}

export default function StaffTab() {
  const { showSuccess, showError } = useToastContext();

  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Create/Edit state
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ fullName: "", email: "", mobileNumber: "", password: "" });
  const [formPerms, setFormPerms] = useState<Permissions>({ ...EMPTY_PERMS });
  const [submitting, setSubmitting] = useState(false);

  // Detail view
  const [selectedStaff, setSelectedStaff] = useState<User | null>(null);

  // Password reset
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordTarget, setPasswordTarget] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  const loadStaff = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchStaffList();
      setStaff(data || []);
    } catch {
      setStaff([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStaff(); }, [loadStaff]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ fullName: "", email: "", mobileNumber: "", password: "" });
    setFormPerms({ ...EMPTY_PERMS });
    setFormOpen(true);
  };

  const openEdit = (s: User) => {
    setEditingId(s.id);
    setForm({
      fullName: s.fullName,
      email: s.email,
      mobileNumber: s.mobileNumber || "",
      password: "",
    });
    setFormPerms(s.permissions ? { ...EMPTY_PERMS, ...s.permissions } : { ...EMPTY_PERMS });
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.fullName || !form.email) {
      showError("Error", "Name and email are required.");
      return;
    }
    if (!editingId && !form.password) {
      showError("Error", "Password is required for new staff.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        const payload: any = {
          fullName: form.fullName,
          mobileNumber: form.mobileNumber,
          permissions: formPerms,
        };
        await updateStaff(editingId, payload);
        showSuccess("Success", "Staff updated successfully.");
      } else {
        await createStaff({
          fullName: form.fullName,
          email: form.email,
          mobileNumber: form.mobileNumber,
          password: form.password,
          permissions: formPerms,
        });
        showSuccess("Success", "Staff created successfully.");
      }
      setFormOpen(false);
      loadStaff();
    } catch (e: any) {
      console.error("Staff save error:", e); showError("Error", "Failed to save staff.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (s: User) => {
    try {
      await updateStaffStatus(s.id, !s.isActive);
      showSuccess("Success", `Staff ${s.isActive ? "disabled" : "enabled"} successfully.`);
      loadStaff();
      if (selectedStaff?.id === s.id) {
        setSelectedStaff({ ...selectedStaff, isActive: !s.isActive });
      }
    } catch (e: any) {
      console.error("Staff status error:", e); showError("Error", "Failed to update status.");
    }
  };

  const openPasswordReset = (s: User) => {
    setPasswordTarget(s);
    setNewPassword("");
    setPasswordOpen(true);
  };

  const handlePasswordReset = async () => {
    if (!passwordTarget || !newPassword || newPassword.length < 6) {
      showError("Error", "Password must be at least 6 characters.");
      return;
    }
    setPasswordSubmitting(true);
    try {
      await resetStaffPassword(passwordTarget.id, newPassword);
      showSuccess("Success", "Password reset successfully.");
      setPasswordOpen(false);
    } catch (e: any) {
      console.error("Staff password reset error:", e); showError("Error", "Failed to reset password.");
    } finally {
      setPasswordSubmitting(false);
    }
  };

  const handleDelete = async (s: User) => {
    if (!window.confirm(`Delete staff "${s.fullName}"? This cannot be undone.`)) return;
    try {
      await deleteStaff(s.id);
      showSuccess("Success", "Staff deleted.");
      loadStaff();
      if (selectedStaff?.id === s.id) setSelectedStaff(null);
    } catch (e: any) {
      console.error("Staff delete error:", e); showError("Error", "Failed to delete staff.");
    }
  };

  const togglePerm = (key: PermissionKey) => {
    setFormPerms((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Detail view
  if (selectedStaff) {
    const s = selectedStaff;
    return (
      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedStaff(null)} className="p-1.5 text-gray-400 hover:text-siddha-dark cursor-pointer">
              <Eye className="w-4 h-4" />
            </button>
            <h2 className="text-lg font-bold font-display text-emerald-900">Staff Details</h2>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => { setSelectedStaff(null); openEdit(s); }}>
              <Edit3 className="w-3.5 h-3.5 mr-1 inline" /> Edit
            </Button>
            <Button variant="secondary" size="sm" onClick={() => openPasswordReset(s)}>
              <Key className="w-3.5 h-3.5 mr-1 inline" /> Reset Password
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-2xl">
          <div><p className="text-[10px] font-bold text-gray-400 uppercase">Name</p><p className="text-sm font-semibold mt-0.5">{s.fullName}</p></div>
          <div><p className="text-[10px] font-bold text-gray-400 uppercase">Email</p><p className="text-sm mt-0.5">{s.email}</p></div>
          <div><p className="text-[10px] font-bold text-gray-400 uppercase">Phone</p><p className="text-sm mt-0.5">{s.mobileNumber || "—"}</p></div>
          <div><p className="text-[10px] font-bold text-gray-400 uppercase">Role</p><p className="text-sm mt-0.5">{s.role || "STAFF"}</p></div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Status</p>
            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mt-0.5 ${s.isActive !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              {s.isActive !== false ? "Active" : "Disabled"}
            </span>
          </div>
          <div><p className="text-[10px] font-bold text-gray-400 uppercase">Last Login</p><p className="text-sm mt-0.5">{formatDate(s.lastLogin)}</p></div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-3">Permissions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {PERMISSION_KEYS.map((p) => {
              const granted = s.permissions?.[p.key] === true;
              return (
                <div key={p.key} className={`px-3 py-2 rounded-xl text-xs font-bold ${granted ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-400'}`}>
                  {granted ? "✓ " : "✗ "}{p.label}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-display text-emerald-900">
            Staff Management ({staff.length})
          </h2>
          <Button onClick={openCreate} variant="primary" size="sm">
            <Plus className="w-4 h-4 mr-1 inline" /> Add Staff
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : staff.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">No staff members yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-200 text-gray-400 uppercase font-black tracking-widest text-[10px]">
                  <th className="py-3 pr-4">Name</th>
                  <th className="py-3 pr-4">Email</th>
                  <th className="py-3 pr-4">Phone</th>
                  <th className="py-3 pr-4">Role</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4">Last Login</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {staff.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/50">
                    <td className="py-3 pr-4 font-semibold text-xs">{s.fullName}</td>
                    <td className="py-3 pr-4 text-xs">{s.email}</td>
                    <td className="py-3 pr-4 text-xs">{s.mobileNumber || "—"}</td>
                    <td className="py-3 pr-4 text-xs">{s.role || "STAFF"}</td>
                    <td className="py-3 pr-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${s.isActive !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                        {s.isActive !== false ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-xs text-gray-400">{formatDate(s.lastLogin)}</td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setSelectedStaff(s)} className="p-1.5 text-gray-400 hover:text-siddha-dark cursor-pointer" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => openEdit(s)} className="p-1.5 text-gray-400 hover:text-siddha-dark cursor-pointer" title="Edit">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => openPasswordReset(s)} className="p-1.5 text-gray-400 hover:text-amber-600 cursor-pointer" title="Reset Password">
                          <Key className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleToggleStatus(s)} className="p-1.5 text-gray-400 hover:text-blue-600 cursor-pointer" title={s.isActive !== false ? "Disable" : "Enable"}>
                          {s.isActive !== false ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                        <button onClick={() => handleDelete(s)} className="p-1.5 text-gray-400 hover:text-rose-600 cursor-pointer" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title={editingId ? "Edit Staff" : "Create Staff"} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Full Name *</label>
              <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="w-full p-2.5 border border-gray-150 rounded-xl text-xs" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Email *</label>
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full p-2.5 border border-gray-150 rounded-xl text-xs" disabled={!!editingId} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Phone</label>
              <input value={form.mobileNumber} onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })}
                className="w-full p-2.5 border border-gray-150 rounded-xl text-xs" />
            </div>
            {!editingId && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Password *</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full p-2.5 border border-gray-150 rounded-xl text-xs" />
              </div>
            )}
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Permissions</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {PERMISSION_KEYS.map((p) => (
                <label key={p.key} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-colors ${
                  formPerms[p.key] ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100'
                }`}>
                  <input type="checkbox" checked={formPerms[p.key]}
                    onChange={() => togglePerm(p.key)}
                    className="w-3.5 h-3.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500/20 cursor-pointer" />
                  {p.label}
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit} loading={submitting}>
              {editingId ? "Update Staff" : "Create Staff"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reset Password Modal */}
      <Modal isOpen={passwordOpen} onClose={() => setPasswordOpen(false)} title="Reset Password" size="sm">
        {passwordTarget && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-3 text-xs">
              <p><span className="font-bold">Staff:</span> {passwordTarget.fullName}</p>
              <p><span className="font-bold">Email:</span> {passwordTarget.email}</p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">New Password *</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2.5 border border-gray-150 rounded-xl text-xs" placeholder="Min 6 characters" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setPasswordOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handlePasswordReset} loading={passwordSubmitting} disabled={newPassword.length < 6}>
                <Key className="w-3.5 h-3.5 mr-1 inline" /> Reset Password
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
