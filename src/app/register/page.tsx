'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Ticket, Loader2, Phone, Building, User, Mail, Lock, GraduationCap, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    college: 'Indian Institute of Technology Delhi (IIT Delhi)',
    studentId: '',
    department: 'Computer Science & Engineering',
    password: '',
    role: 'STUDENT' as 'STUDENT' | 'ORGANIZER',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.phoneNumber.trim()) {
      showToast('Please enter your mobile number', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(form as any);
      showToast('Account created successfully!', 'success');
      router.push(form.role === 'ORGANIZER' ? '/organizer' : '/dashboard');
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 my-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/30">
            <Ticket className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white">Join UniPass</h1>
          <p className="text-xs text-slate-400">Create your college account as a Student or Host</p>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account Type Selection (Student vs Host) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase">Account Type *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'STUDENT' })}
                  className={'p-3 rounded-2xl border text-left transition flex flex-col justify-between ' + (
                    form.role === 'STUDENT'
                      ? 'bg-indigo-600/15 border-indigo-500 ring-2 ring-indigo-500/30'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400'
                  )}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <div className={'p-1.5 rounded-lg ' + (form.role === 'STUDENT' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400')}>
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    {form.role === 'STUDENT' && (
                      <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">Selected</span>
                    )}
                  </div>
                  <p className="font-bold text-white text-xs">🎓 Student</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Attend events & passes</p>
                </button>

                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'ORGANIZER' })}
                  className={'p-3 rounded-2xl border text-left transition flex flex-col justify-between ' + (
                    form.role === 'ORGANIZER'
                      ? 'bg-emerald-600/15 border-emerald-500 ring-2 ring-emerald-500/30'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400'
                  )}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <div className={'p-1.5 rounded-lg ' + (form.role === 'ORGANIZER' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400')}>
                      <Building className="w-4 h-4" />
                    </div>
                    {form.role === 'ORGANIZER' && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Selected</span>
                    )}
                  </div>
                  <p className="font-bold text-white text-xs">🎪 Host</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Publish events & scan</p>
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={form.role === 'ORGANIZER' ? 'Anurag (Events Council)' : 'Anurag Rai'}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white text-xs"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">College Email (.edu / .ac.in / Gmail) *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="student@college.edu"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white text-xs font-mono"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Mobile Number *</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value.replace(/\D/g, '').slice(0, 15) })}
                  placeholder="9723890793"
                  maxLength={15}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white text-xs font-mono"
                />
              </div>
            </div>

            {/* College & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">College *</label>
                <input
                  type="text"
                  required
                  value={form.college}
                  onChange={(e) => setForm({ ...form, college: e.target.value })}
                  placeholder="e.g. Stanford University"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Department</label>
                <input
                  type="text"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  placeholder="e.g. Computer Science"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-white text-xs"
                />
              </div>
            </div>

            {/* Student Roll / ID or Host Staff ID */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                {form.role === 'ORGANIZER' ? 'Organizer / Host Staff ID (Optional)' : 'Student Roll / College ID (Optional)'}
              </label>
              <input
                type="text"
                value={form.studentId}
                onChange={(e) => setForm({ ...form, studentId: e.target.value.slice(0, 20) })}
                placeholder={form.role === 'ORGANIZER' ? 'e.g. ORG-IITD-2026' : 'e.g. 202310842'}
                maxLength={20}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-4 text-white text-xs font-mono"
              />
            </div>

            {/* Password with Eye Button Toggle */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-10 pr-10 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition focus:outline-none"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition hover:scale-[1.02]"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Create Account</span>}
            </button>
          </form>

          <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span>Already have an account? </span>
            <Link href="/login" className="text-indigo-400 font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
