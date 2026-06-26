"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.push("/admin/dashboard");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error ?? "Identifiants incorrects");
      }
    } catch {
      setError("Impossible de contacter le serveur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#1E1410] flex items-center justify-center px-4">
      <div className="w-full max-w-[380px]">

        {/* Logo */}
        <div className="text-center mb-10">
          <p className="font-display text-[32px] font-medium text-[#FAF6F1] leading-none">✦ Laky</p>
          <p className="font-display text-[11px] font-light tracking-[0.22em] uppercase text-[#7A6E66] mt-2">
            Administration
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#2A1C14] border border-[#3A2820] rounded-2xl p-8">
          <h1 className="font-sans font-medium text-[16px] text-[#FAF6F1] mb-1">Connexion</h1>
          <p className="font-sans font-light text-[12px] text-[#7A6E66] mb-7">
            Accès réservé à l'équipe Laky
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-sans font-medium tracking-[0.10em] uppercase text-[#7A6E66] mb-2">
                Identifiant
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
                required
                className="w-full h-11 px-4 rounded-lg bg-[#1E1410] border border-[#3A2820] text-[14px] font-sans font-light text-[#FAF6F1] placeholder-[#4A3828] focus:outline-none focus:border-[#C9A86C] transition-colors"
                placeholder="admin"
              />
            </div>

            <div>
              <label className="block text-[10px] font-sans font-medium tracking-[0.10em] uppercase text-[#7A6E66] mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="w-full h-11 px-4 pr-11 rounded-lg bg-[#1E1410] border border-[#3A2820] text-[14px] font-sans font-light text-[#FAF6F1] placeholder-[#4A3828] focus:outline-none focus:border-[#C9A86C] transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A6E66] hover:text-[#C9A86C] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-[12px] font-sans text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-full bg-[#C9A86C] text-[#1A1714] text-[12px] font-sans font-medium tracking-[0.10em] uppercase hover:bg-[#D4B87A] transition-all duration-200 disabled:opacity-60 mt-2"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] font-sans font-light text-[#4A3828] mt-8">
          Laky Accessoires © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
