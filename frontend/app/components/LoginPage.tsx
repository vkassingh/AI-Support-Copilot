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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white border rounded-xl p-8 w-full max-w-sm shadow-sm">
        <h1 className="text-xl font-bold mb-1">🎫 AI Support Copilot</h1>
        <p className="text-sm text-gray-500 mb-6">{isRegister ? "Create an account" : "Sign in to continue"}</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            className="w-full border rounded px-3 py-2 text-sm"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border rounded px-3 py-2 text-sm"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          {isRegister && (
            <select
              className="w-full border rounded px-3 py-2 text-sm"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="customer">Customer</option>
              <option value="agent">Agent</option>
            </select>
          )}
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded text-sm hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Please wait..." : isRegister ? "Register" : "Login"}
          </button>
        </form>

        <p className="text-xs text-center text-gray-500 mt-4">
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <button className="text-black underline" onClick={() => { setIsRegister(!isRegister); setError(""); }}>
            {isRegister ? "Login" : "Register"}
          </button>
        </p>
      </div>
    </div>
  );
}
