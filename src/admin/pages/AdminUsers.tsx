import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Shield, Check, X, 
  Trash2, Mail, Lock, Loader2, Save 
} from 'lucide-react';
import { 
  collection, onSnapshot, doc, setDoc, 
  deleteDoc, serverTimestamp, query, orderBy 
} from 'firebase/firestore';
import { getDb } from '../../lib/firebase';
import { useAdminAuth } from '../context/AdminAuthContext';

interface AdminAccount {
  id: string;
  email: string;
  displayName: string;
  role: 'super_admin' | 'clinical_manager' | 'receptionist';
  status: 'active' | 'pending' | 'suspended';
  lastLogin?: string;
  createdAt?: any;
}

const DEFAULT_ADMINS: AdminAccount[] = [
  {
    id: 'admin-1',
    email: 'admin@newarkmed.com',
    displayName: 'Clinical Director (Demo)',
    role: 'super_admin',
    status: 'active',
    lastLogin: 'Today at 9:42 AM'
  },
  {
    id: 'admin-2',
    email: 'reception@newarkmed.com',
    displayName: 'Front Desk Coordinator',
    role: 'receptionist',
    status: 'active',
    lastLogin: 'Yesterday at 5:15 PM'
  },
  {
    id: 'admin-3',
    email: 'operations@newarkmed.com',
    displayName: 'Practice Operations Lead',
    role: 'clinical_manager',
    status: 'active',
    lastLogin: '3 days ago'
  }
];

export default function AdminUsers() {
  const { user } = useAdminAuth();
  const [admins, setAdmins] = useState<AdminAccount[]>(DEFAULT_ADMINS);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState<Partial<AdminAccount>>({
    email: '',
    displayName: '',
    role: 'clinical_manager',
    status: 'active'
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    try {
      const db = getDb();
      const q = query(collection(db, 'admin_users'), orderBy('displayName', 'asc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const list: AdminAccount[] = [];
          snapshot.forEach(d => list.push({ id: d.id, ...d.data() as any }));
          setAdmins(list);
        } else {
          setAdmins(DEFAULT_ADMINS);
        }
        setLoading(false);
      }, (err) => {
        console.warn('Admin users sync fallback:', err);
        setAdmins(DEFAULT_ADMINS);
        setLoading(false);
      });
      return () => unsubscribe();
    } catch {
      setAdmins(DEFAULT_ADMINS);
      setLoading(false);
    }
  }, []);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdmin.email || !newAdmin.displayName) return;

    setIsSaving(true);
    try {
      const db = getDb();
      const id = `admin-${Date.now()}`;
      const payload: AdminAccount = {
        id,
        email: newAdmin.email.toLowerCase().trim(),
        displayName: newAdmin.displayName.trim(),
        role: newAdmin.role || 'clinical_manager',
        status: 'active',
        lastLogin: 'Never',
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, 'admin_users', id), payload);
      setAdmins(prev => [...prev, payload]);
      setIsModalOpen(false);
      setNewAdmin({
        email: '',
        displayName: '',
        role: 'clinical_manager',
        status: 'active'
      });
    } catch (err) {
      console.error('Error adding admin:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    try {
      const db = getDb();
      await deleteDoc(doc(db, 'admin_users', id));
      setAdmins(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Error deleting admin:', err);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <span className="bg-purple-100 text-purple-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">Super Admin</span>;
      case 'clinical_manager':
        return <span className="bg-primary-100 text-primary-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">Clinical Manager</span>;
      case 'receptionist':
        return <span className="bg-teal-100 text-teal-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">Front Desk</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">Staff</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff & Administrator Access</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage administrative personnel, clinical team credentials, and CMS access permissions.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer"
        >
          <UserPlus size={16} />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Role permission info box */}
      <div className="bg-gradient-to-r from-primary-900 to-slate-900 text-white rounded-2xl p-6 shadow-md grid sm:grid-cols-3 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-bold text-sm text-primary-200">
            <Shield size={16} />
            <span>Super Admin</span>
          </div>
          <p className="text-xs text-slate-300">
            Full control over CMS pages, settings, database, analytics, and user privileges.
          </p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-bold text-sm text-teal-300">
            <Shield size={16} />
            <span>Clinical Manager</span>
          </div>
          <p className="text-xs text-slate-300">
            Manage appointments, patients, providers, diagnostics, and reviews.
          </p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-bold text-sm text-indigo-300">
            <Shield size={16} />
            <span>Front Desk Coordinator</span>
          </div>
          <p className="text-xs text-slate-300">
            View calendar, schedule appointments, and process inquiries.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Authorized Personnel</h2>
          <span className="text-xs font-semibold text-slate-500">{admins.length} Active Accounts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">User</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Last Login</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-slate-50/75 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                        {admin.displayName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{admin.displayName}</div>
                        <div className="text-[11px] text-slate-500">{admin.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getRoleBadge(admin.role)}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Active</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-[11px]">{admin.lastLogin || 'Recent'}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDeleteAdmin(admin.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">Add Staff Administrator</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddAdmin} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Staff Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Jane Smith"
                  value={newAdmin.displayName}
                  onChange={(e) => setNewAdmin({ ...newAdmin, displayName: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Clinic Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@newarkmed.com"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Assigned Permission Role
                </label>
                <select
                  value={newAdmin.role}
                  onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white"
                >
                  <option value="super_admin">Super Admin (Full CMS + System Control)</option>
                  <option value="clinical_manager">Clinical Manager (Appointments + Content)</option>
                  <option value="receptionist">Front Desk (Appointments & Calendar Only)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-xs shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>Create Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
