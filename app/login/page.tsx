"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function signIn() {
    setLoading(true);
    setError("");

    try {
      const supabase = getSupabaseBrowser();

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        window.location.href = "/rag-test";
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold">Dev Login</h1>

        <input
          className="w-full rounded bg-white/5 border border-white/10 px-3 py-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full rounded bg-white/5 border border-white/10 px-3 py-2"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={signIn}
          disabled={loading}
          className="w-full bg-white text-black rounded py-2 disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        {error && (
          <div className="text-sm text-red-400 border border-red-500/30 p-2 rounded">
            {error}
          </div>
        )}
      </div>
    </main>
  );
}
