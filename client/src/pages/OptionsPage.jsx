import { useEffect, useState } from "react";
import { api } from "../api.js";
import Card from "../components/Card.jsx";
import Input from "../components/Input.jsx";
import Button from "../components/Button.jsx";
import { applyThemeMode } from "../theme.js";

export default function OptionsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [themeMode, setThemeMode] = useState("SYSTEM");

  async function loadProfile() {
    setLoading(true);
    setError("");
    try {
      const me = await api("/users/me");
      setEmail(me.email || "");
      setRole(me.role || "");
      setFullName(me.fullName || "");
      setThemeMode(me.themeMode || "SYSTEM");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const body = {
        fullName: fullName.trim() ? fullName.trim() : null,
        themeMode,
      };
      if (password.trim()) body.password = password.trim();

      await api("/users/me", {
        method: "PUT",
        body: JSON.stringify(body),
      });

      setPassword("");
      applyThemeMode(themeMode);
      setSuccess("Setările au fost salvate.");
      await loadProfile();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-sm text-white/70">Se încarcă setările...</div>;
  }

  return (
    <Card title="Setările mele" subtitle="Aceste date sunt pentru contul autentificat">
      <form className="grid gap-4" onSubmit={onSubmit}>
        <div>
          <label className="text-xs text-white/70">Email</label>
          <Input value={email} disabled />
        </div>

        <div>
          <label className="text-xs text-white/70">Rol</label>
          <Input value={role} disabled />
        </div>

        <div>
          <label className="text-xs text-white/70">Nume complet</label>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nume complet"
          />
        </div>

        <div>
          <label className="text-xs text-white/70">Parolă nouă (opțional)</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minim 6 caractere"
          />
        </div>

        <div>
          <label className="text-xs text-white/70">Temă</label>
          <select
            value={themeMode}
            onChange={(e) => setThemeMode(e.target.value)}
            className="ui-input w-full rounded-md px-3 py-2 text-sm"
          >
            <option value="SYSTEM">Implicit (tema sistemului)</option>
            <option value="LIGHT">Light</option>
            <option value="DARK">Dark</option>
          </select>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
            {success}
          </div>
        )}

        <div className="pt-1">
          <Button type="submit" disabled={saving}>
            {saving ? "Se salvează..." : "Salvează setările"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
