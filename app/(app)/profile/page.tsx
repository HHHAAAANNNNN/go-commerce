"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const BACKEND = "http://localhost:8080";

interface UserProfile {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  balance: number;
  is_member: boolean;
}

type ToastType = "success" | "error";

function Toast({ message, type, onClose }: { message: string; type: ToastType; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed top-6 right-6 z-[999] flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border backdrop-blur-md animate-slideIn
        ${type === "success"
          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
          : "bg-red-500/20 border-red-500/40 text-red-300"
        }`}
      style={{ animation: "slideIn 0.3s ease-out" }}
    >
      {type === "success" ? (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ) : (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 transition-opacity">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<UserProfile | null>(null);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", avatar_url: "" });
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [changePassword, setChangePassword] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        // Login stores a flat user object directly: { id, full_name, email, ... }
        const u: UserProfile = JSON.parse(storedUser);
        setUser(u);
        setForm({
          full_name: u.full_name || "",
          email: u.email || "",
          phone: u.phone || "",
          avatar_url: u.avatar_url || "",
        });
        setAvatarPreview(u.avatar_url ? `${BACKEND}${u.avatar_url}` : "");
      } catch {
        router.push("/");
      }
    } else {
      router.push("/");
    }
  }, [router]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const showToast = (message: string, type: ToastType) => setToast({ message, type });

  const handleCancel = () => router.push("/dashboard");

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let finalAvatarUrl = form.avatar_url;

      // Upload avatar if a new file was picked
      if (avatarFile) {
        const fd = new FormData();
        fd.append("image", avatarFile);
        fd.append("category", "avatars");
        const uploadRes = await fetch(`${BACKEND}/api/upload`, { method: "POST", body: fd });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || !uploadData.success) {
          showToast("Failed to upload avatar. Please try again.", "error");
          setLoading(false);
          return;
        }
        finalAvatarUrl = uploadData.data.url;
      }

      // Validate password fields if section is open
      if (changePassword) {
        if (!pwForm.current) { showToast("Please enter your current password.", "error"); setLoading(false); return; }
        if (!pwForm.newPw) { showToast("Please enter a new password.", "error"); setLoading(false); return; }
        if (pwForm.newPw !== pwForm.confirm) { showToast("New passwords do not match.", "error"); setLoading(false); return; }
        if (pwForm.newPw.length < 6) { showToast("Password must be at least 6 characters.", "error"); setLoading(false); return; }
      }

      const body: Record<string, unknown> = {
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        avatar_url: finalAvatarUrl,
      };
      if (changePassword && pwForm.current && pwForm.newPw) {
        body.current_password = pwForm.current;
        body.new_password = pwForm.newPw;
      }

      const res = await fetch(`${BACKEND}/api/users/${user.id}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.error || "Failed to save profile.", "error");
        setLoading(false);
        return;
      }

      // Persist updated user to localStorage as flat object (same format written by login)
      const currentRaw = localStorage.getItem("user");
      const currentStored = currentRaw ? JSON.parse(currentRaw) : {};
      const merged = { ...currentStored, ...data.data };
      localStorage.setItem("user", JSON.stringify(merged));

      // Dispatch custom event — works reliably within the same Next.js window
      window.dispatchEvent(new CustomEvent("profileUpdated", { detail: merged }));

      showToast("Profile saved successfully!", "success");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const avatarInitials = user
    ? user.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.4s ease-out both; }
      `}</style>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className="max-w-2xl mx-auto space-y-6 pb-10">
        {/* Header */}
        <div className="fade-up">
          <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
          <p className="text-slate-400 mt-1 text-sm">Update your personal information and account security.</p>
        </div>

        {/* Avatar Section */}
        <div className="fade-up bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6" style={{ animationDelay: "0.05s" }}>
          <h2 className="text-white font-semibold mb-4">Profile Picture</h2>
          <div className="flex items-center gap-6">
            {/* Avatar circle */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-primary-400/30 bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-2xl font-bold">{avatarInitials}</span>
                )}
              </div>
              {/* Hover overlay */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            <div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-primary-500/20 hover:bg-primary-500/30 border border-primary-400/40 text-primary-300 rounded-lg text-sm font-medium transition-colors"
              >
                Change Photo
              </button>
              {avatarFile && (
                <button
                  onClick={() => { setAvatarFile(null); setAvatarPreview(form.avatar_url ? `${BACKEND}${form.avatar_url}` : ""); }}
                  className="ml-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-400 rounded-lg text-sm transition-colors"
                >
                  Remove
                </button>
              )}
              <p className="text-slate-500 text-xs mt-2">JPG, PNG, WEBP — max 5MB</p>
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <div className="fade-up bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6" style={{ animationDelay: "0.1s" }}>
          <h2 className="text-white font-semibold mb-5">Personal Information</h2>
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Full Name</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={e => setForm({ ...form, full_name: e.target.value })}
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400/50 transition-all"
                  placeholder="Your full name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400/50 transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Phone Number</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400/50 transition-all"
                  placeholder="+62 8xx-xxxx-xxxx"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Password Section */}
        <div className="fade-up bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden" style={{ animationDelay: "0.15s" }}>
          <button
            onClick={() => setChangePassword(!changePassword)}
            className="w-full p-6 flex items-center justify-between text-left hover:bg-slate-700/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold">Change Password</p>
                <p className="text-slate-400 text-xs">Leave closed to keep your current password</p>
              </div>
            </div>
            <svg
              className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${changePassword ? "rotate-180" : ""}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {changePassword && (
            <div className="px-6 pb-6 space-y-4 border-t border-slate-700/50">
              <div className="pt-4 space-y-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Current Password</label>
                  <input
                    type="password"
                    value={pwForm.current}
                    onChange={e => setPwForm({ ...pwForm, current: e.target.value })}
                    className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-400/50 transition-all"
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">New Password</label>
                  <input
                    type="password"
                    value={pwForm.newPw}
                    onChange={e => setPwForm({ ...pwForm, newPw: e.target.value })}
                    className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-400/50 transition-all"
                    placeholder="Min. 6 characters"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={pwForm.confirm}
                    onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })}
                    className={`w-full bg-slate-900/60 border rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all
                      ${pwForm.confirm && pwForm.newPw !== pwForm.confirm
                        ? "border-red-500/60 focus:ring-red-400/40"
                        : "border-slate-700 focus:ring-primary-400/50"
                      }`}
                    placeholder="Re-enter new password"
                  />
                  {pwForm.confirm && pwForm.newPw !== pwForm.confirm && (
                    <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="fade-up flex items-center gap-3 justify-end" style={{ animationDelay: "0.2s" }}>
          <button
            onClick={handleCancel}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white font-medium transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-400 hover:to-secondary-400 text-white font-semibold shadow-lg shadow-primary-500/25 transition-all disabled:opacity-60 flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
