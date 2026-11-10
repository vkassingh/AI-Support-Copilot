"use client";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const API = "http://localhost:3000";

export default function LoginPage({ onDone }: { onDone: () => void }) {
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", role: "customer" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (isRegister) {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }
      setIsRegister(false);
      setLoading(false);
      return;
    }

    const err = await login(form.email, form.password);
    if (err) setError(err);
    else onDone();
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-indigo-50">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-200 mb-4">
            <span className="text-white text-xl">✦</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">AI Support Copilot</h1>
          <p className="text-sm text-slate-500 mt-1">
            {isRegister ? "Create your account" : "Sign in to your workspace"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-8 shadow-sm shadow-slate-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1.5 block">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1.5 block">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            {isRegister && (
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">Role</label>
                <select
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="customer">Customer</option>
                  <option value="agent">Agent</option>
                </select>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <p className="text-red-600 text-xs">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 shadow-sm shadow-violet-200 transition-all"
            >
              {loading ? "Please wait..." : isRegister ? "Create Account" : "Sign In"}
            </button>
          </form>

          <p className="text-xs text-center text-slate-500 mt-5">
            {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              className="text-violet-600 font-medium hover:text-violet-700"
              onClick={() => { setIsRegister(!isRegister); setError(""); }}
            >
              {isRegister ? "Sign In" : "Register"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
