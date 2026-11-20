"use client";

import { FormEvent, useState } from "react";
import { LogoPhone } from "@/components/admin/AdminIcons";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not sign in.");
        setBusy(false);
        return;
      }
      window.location.href = "/admin";
    } catch {
      setError("Network problem. Try again.");
      setBusy(false);
    }
  };

  return (
    <div className="adm-login">
      <form onSubmit={submit} className="adm-login__card">
        <div className="adm-login__brand">
          <LogoPhone />
          <span>
            iPhone<em>Hub</em>
          </span>
        </div>
        <h1>Merchant sign in</h1>
        <label className="adm-field">
          <span>Password</span>
          <input
            type="password"
            autoFocus
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && (
          <p className="adm-alert" role="alert">
            {error}
          </p>
        )}
        <button className="adm-btn adm-btn--primary adm-btn--block" disabled={busy || !password}>
          {busy ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
