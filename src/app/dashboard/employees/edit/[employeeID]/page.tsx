"use client";

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Info, Key, Eye, EyeOff, Upload, ArrowLeft, ShieldBan, Check } from 'lucide-react';
import Link from 'next/link';
import api from '../../../../../utils/axiosInstance';

export default function EditEmployee({ params }: { params: Promise<{ employeeID: string }> }) {
  const unwrappedParams = use(params);
  const employeeID = unwrappedParams.employeeID;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [branchSearch, setBranchSearch] = useState('');
  const [branches, setBranches] = useState<any[]>([]);
  const [showBranches, setShowBranches] = useState(false);
  const [searchingBranches, setSearchingBranches] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    mobile: '',
    employee_code: '',
    role: '',
    branch_id: '',
    date_of_joining: '',
    status: 'ACTIVE',
    password: '',
    confirm_password: ''
  });

  useEffect(() => {
    fetchEmployee();
  }, []);

  const fetchEmployee = async () => {
    try {
      const res = await api.get(`/employees/${employeeID}`);
      const data = res.data;
      if (data.success) {
        // Exclude password and map date properly
        const emp = data.data;
        setFormData({
          full_name: emp.full_name || '',
          email: emp.email || '',
          mobile: emp.mobile || '',
          employee_code: emp.employee_code || '',
          role: emp.role || '',
          branch_id: emp.branch_id || '',
          date_of_joining: emp.date_of_joining ? emp.date_of_joining.split('T')[0] : '',
          status: emp.status || 'ACTIVE',
          password: '',
          confirm_password: ''
        });
        setBranchSearch(emp.branch_name || emp.branch_id || '');
      } else {
        alert(data.message || 'Failed to load employee');
        router.push('/dashboard/employees');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const fetchBranches = async () => {
      if (!showBranches) return;
      setSearchingBranches(true);
      try {
        const { data } = await api.get('/branches', { params: { search: branchSearch, limit: 10 } });
        if (data?.success) {
          setBranches(data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch branches', err);
      } finally {
        setSearchingBranches(false);
      }
    };

    const timer = setTimeout(fetchBranches, 300);
    return () => clearTimeout(timer);
  }, [branchSearch, showBranches]);

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
    let password = "";
    for (let i = 0; i < 12; i++) {
      const randomNumber = Math.floor(Math.random() * chars.length);
      password += chars.substring(randomNumber, randomNumber + 1);
    }
    setFormData({ ...formData, password, confirm_password: password });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirm_password) {
      alert("Passwords do not match");
      return;
    }
    setSaving(true);

    const payload = { ...formData };
    if (!payload.password) {
      delete payload.password;
      delete payload.confirm_password;
    }

    try {
      const res = await api.put(`/employees/update/${employeeID}`, payload);
      const data = res.data;
      if (data.success) {
        alert('Employee updated successfully');
        router.push('/dashboard/employees');
      } else {
        alert(data.message || 'Failed to update employee');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-zinc-500">Loading...</div>;

  return (
    <div className="animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <Link href="/dashboard/employees" className="p-2 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors shadow-sm">
          <ArrowLeft className="w-4 h-4 text-zinc-600" />
        </Link>
        <div>
          <div className="flex items-center gap-2 text-sm text-zinc-500 mb-1">
            <Link href="/dashboard" className="hover:text-emerald-600">Dashboard</Link>
            <span>›</span>
            <Link href="/dashboard/employees" className="hover:text-emerald-600">Employees</Link>
            <span>›</span>
            <span className="text-zinc-900 font-medium">Edit Employee</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Edit Employee</h1>
          <p className="text-zinc-500 text-sm">Update employee information.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mt-8">
        {/* Main Form */}
        <div className="flex-1 space-y-6">
          <form id="edit-employee-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Section 1: Personal Info */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                <h2 className="text-lg font-bold text-zinc-900">Personal Information</h2>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-8">
                {/* Image Upload Mock */}
                <div className="w-32 flex-shrink-0">
                  <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 flex flex-col items-center justify-center text-zinc-400 hover:border-emerald-500 hover:bg-emerald-50 transition-colors cursor-pointer group">
                    <Upload className="w-8 h-8 mb-2 group-hover:text-emerald-600 transition-colors" />
                    <span className="text-xs font-medium group-hover:text-emerald-700">Change Photo</span>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-medium text-zinc-700">Full Name <span className="text-red-500">*</span></label>
                    <input required name="full_name" value={formData.full_name} onChange={handleChange} type="text" className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700">Email <span className="text-red-500">*</span></label>
                    <input required name="email" value={formData.email} onChange={handleChange} type="email" className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-700">Phone Number <span className="text-red-500">*</span></label>
                    <input required name="mobile" value={formData.mobile} onChange={handleChange} type="tel" className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Employment Info */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                <h2 className="text-lg font-bold text-zinc-900">Employment Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700">Employee Code <span className="text-red-500">*</span></label>
                  <input required name="employee_code" value={formData.employee_code} onChange={handleChange} type="text" className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700">Joining Date <span className="text-red-500">*</span></label>
                  <input required name="date_of_joining" value={formData.date_of_joining} onChange={handleChange} type="date" className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700">Status <span className="text-red-500">*</span></label>
                  <select required name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all">
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Role & Branch */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">3</span>
                <h2 className="text-lg font-bold text-zinc-900">Role & Branch</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700">Role <span className="text-red-500">*</span></label>
                  <select required name="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all">
                    <option value="">Select a role</option>
                    <option value="SUPERADMIN">Superadmin</option>
                    <option value="MANAGER">Manager</option>
                    <option value="ENGINEER">Engineer</option>
                    <option value="OPERATOR">Operator</option>
                  </select>
                </div>
                <div className="space-y-1.5 relative">
                  <label className="text-sm font-medium text-zinc-700">Branch <span className="text-red-500">*</span></label>
                  <input
                    required
                    type="text"
                    value={branchSearch}
                    onChange={(e) => {
                      setBranchSearch(e.target.value);
                      setShowBranches(true);
                      setFormData(prev => ({ ...prev, branch_id: '' }));
                    }}
                    placeholder="Search branches..."
                    onFocus={() => setShowBranches(true)}
                    className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                  {showBranches && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-zinc-200 rounded-xl shadow-lg max-h-[200px] overflow-y-auto">
                      {searchingBranches ? (
                        <div className="p-3 text-sm text-zinc-500 text-center">Searching...</div>
                      ) : branches.length > 0 ? (
                        branches.map(b => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, branch_id: b.id }));
                              setBranchSearch(`${b.name || b.branch_name || b.id}`);
                              setShowBranches(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-zinc-50 flex items-center justify-between transition-colors ${
                              formData.branch_id === b.id ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-zinc-700'
                            }`}
                          >
                            <div>
                              <p>{b.name || b.branch_name}</p>
                              {b.address && <p className="text-xs text-zinc-500 line-clamp-1">{b.address}</p>}
                            </div>
                            {formData.branch_id === b.id && <Check className="w-4 h-4 text-emerald-600" />}
                          </button>
                        ))
                      ) : (
                        <div className="p-3 text-sm text-zinc-500 text-center">No branches found</div>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" />
                    As a Superadmin, you can assign any branch.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 4: Account Access */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">4</span>
                  <h2 className="text-lg font-bold text-zinc-900">Reset Password (Optional)</h2>
                </div>
              </div>
              <p className="text-sm text-zinc-500 mb-4">Leave password fields empty if you don't want to change the password.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700">New Password</label>
                  <div className="relative">
                    <input name="password" value={formData.password} onChange={handleChange} type={showPassword ? "text" : "password"} placeholder="Enter new password" className="w-full px-4 py-2 pr-10 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700">Confirm New Password</label>
                  <div className="relative flex gap-2">
                    <input name="confirm_password" value={formData.confirm_password} onChange={handleChange} type={showPassword ? "text" : "password"} placeholder="Confirm new password" className="flex-1 px-4 py-2 pr-10 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                    <button type="button" onClick={generatePassword} className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      Generate
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Link href="/dashboard/employees" className="px-6 py-2.5 bg-white border border-zinc-200 text-zinc-700 rounded-xl text-sm font-medium hover:bg-zinc-50 transition-colors shadow-sm">
                Cancel
              </Link>
              <button disabled={saving} type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

          </form>
        </div>

        {/* Side Panel */}
        <div className="w-full lg:w-80 space-y-6">
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-800 font-semibold mb-4">
              <ShieldBan className="w-5 h-5" />
              Edit Permissions
            </div>
            <div className="text-sm text-zinc-600 mb-4">
              You are logged in as <span className="inline-flex px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold text-xs ml-1">SUPERADMIN</span>
            </div>
            <ul className="space-y-3 text-sm text-zinc-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                You can edit all employees
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                You can assign any branch
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                All sections are editable
              </li>
            </ul>
          </div>

          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-zinc-800 font-semibold mb-2">
              <Info className="w-5 h-5 text-blue-500" />
              Important Notes
            </div>
            <ul className="space-y-2 text-sm text-zinc-500 list-disc list-inside">
              <li>Changing email requires the new email to be unique.</li>
              <li>Changing status to INACTIVE immediately revokes all current sessions.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
