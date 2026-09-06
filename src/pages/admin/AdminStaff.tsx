import React, { useEffect, useState } from 'react';
import { Users, Plus, Shield, Check, X, Loader2, Key } from 'lucide-react';
import { StaffUser, UserRole } from '../../types';
import { getStaffUsers, saveStaffUser } from '../../firebase/services';
import { useAuth } from '../../context/AuthContext';

export const AdminStaff: React.FC = () => {
  const { role, staffProfile } = useAuth();
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    uid: '',
    email: '',
    name: '',
    role: 'staff' as UserRole,
    isActive: true,
  });

  const loadStaff = async () => {
    setLoading(true);
    try {
      const data = await getStaffUsers();
      setStaffList(data);
    } catch (err) {
      console.warn('Staff load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const openCreateModal = () => {
    setFormData({
      uid: `staff-${Date.now()}`,
      email: '',
      name: '',
      role: 'staff',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (st: StaffUser) => {
    setFormData({
      uid: st.uid,
      email: st.email,
      name: st.name,
      role: st.role,
      isActive: st.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.name.trim()) return;
    setSubmitting(true);

    const adminUser = staffProfile
      ? { uid: staffProfile.uid, name: staffProfile.name, email: staffProfile.email }
      : undefined;

    try {
      await saveStaffUser(formData, adminUser);
      setFeedback('Staff profile updated successfully.');
      setIsModalOpen(false);
      await loadStaff();
    } catch (err: any) {
      setFeedback(err.message || 'Failed to save staff');
    } finally {
      setSubmitting(false);
    }
  };

  if (role !== 'super_admin') {
    return (
      <div className="bg-white p-8 rounded-3xl border border-gold-200 text-center space-y-3">
        <Shield className="w-10 h-10 text-rose-600 mx-auto" />
        <h2 className="text-xl font-serif font-bold text-burgundy">Super Admin Access Only</h2>
        <p className="text-xs text-charcoal-muted">
          Only Super Administrators have permissions to manage staff role authorizations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gold-200/60 shadow-sm">
        <div>
          <h1 className="text-2xl font-serif font-bold text-burgundy">Staff Access Management</h1>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Manage administrative user roles (Super Admin, Admin, Staff) and security permissions.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-burgundy hover:bg-burgundy-900 text-gold-light font-bold text-xs py-3 px-5 rounded-xl uppercase tracking-wider shadow flex items-center space-x-2 transition-all"
        >
          <Plus className="w-4 h-4 text-gold" />
          <span>Register Staff Account</span>
        </button>
      </div>

      {feedback && (
        <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs p-3.5 rounded-xl">
          {feedback}
        </div>
      )}

      {/* Staff Table */}
      <div className="bg-white rounded-2xl border border-gold-200/60 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-charcoal-muted">
            <Loader2 className="w-8 h-8 text-gold animate-spin mx-auto mb-2" />
            <p>Loading staff authorization records...</p>
          </div>
        ) : staffList.length === 0 ? (
          <div className="p-12 text-center text-xs text-charcoal-muted">No staff accounts registered.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory text-burgundy font-bold uppercase tracking-wider border-b border-gold-200">
                <tr>
                  <th className="p-3.5">Staff Name</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Assigned Role</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-sans">
                {staffList.map((st) => (
                  <tr key={st.uid} className="hover:bg-ivory/50 transition-colors">
                    <td className="p-3.5 font-bold text-burgundy">{st.name}</td>
                    <td className="p-3.5 font-mono text-gray-600">{st.email}</td>
                    <td className="p-3.5">
                      <span className="bg-gold/20 text-burgundy font-bold text-[10px] uppercase px-2.5 py-0.5 rounded-full border border-gold/40">
                        {st.role}
                      </span>
                    </td>
                    <td className="p-3.5">
                      {st.isActive ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Disabled
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => openEditModal(st)}
                        className="text-xs text-burgundy hover:text-gold font-bold underline"
                      >
                        Edit Role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl border border-gold-300 shadow-2xl w-full max-w-md overflow-hidden my-8">
            <div className="bg-burgundy text-white p-6 flex items-center justify-between border-b border-gold/30">
              <h2 className="text-xl font-serif font-bold text-ivory">Staff Role Authorization</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gold hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-charcoal uppercase block mb-1">Firebase User UID</label>
                <input
                  type="text"
                  required
                  value={formData.uid}
                  onChange={(e) => setFormData({ ...formData, uid: e.target.value })}
                  className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-charcoal uppercase block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-charcoal uppercase block mb-1">Firebase Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-charcoal uppercase block mb-1">User Role</label>
                <select
                  value={formData.role}
                  onChange={(e: any) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl font-bold"
                >
                  <option value="staff">Staff (Standard Orders & Products)</option>
                  <option value="admin">Admin (Full Product, Order & Banner Access)</option>
                  <option value="super_admin">Super Admin (Full Root Access)</option>
                </select>
              </div>

              <div className="pt-2">
                <label className="flex items-center space-x-2 font-semibold text-charcoal cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="accent-burgundy"
                  />
                  <span>Account Active</span>
                </label>
              </div>

              <div className="pt-4 border-t border-ivory flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-ivory text-charcoal hover:bg-gray-200 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-burgundy hover:bg-burgundy-900 text-gold-light rounded-xl font-bold uppercase tracking-wider shadow flex items-center space-x-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin text-gold" />}
                  <span>Save Staff Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
