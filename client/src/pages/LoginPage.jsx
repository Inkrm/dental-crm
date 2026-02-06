import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setToken } from "../api.js";
import Input from "../components/Input.jsx";
import Button from "../components/Button.jsx";

export default function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@local.com"); // email valid!
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setToken(data.accessToken);
      nav("/patients");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white grid place-items-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Dental CRM</h1>
          <p className="text-white/60 text-sm">Autentificare</p>
        </div>

        <form onSubmit={onSubmit} className="grid gap-3">
          <div>
            <label className="text-xs text-white/70">Email</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@domain.com" />
          </div>

          <div>
            <label className="text-xs text-white/70">Parola</label>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}

          <Button disabled={loading} className="mt-2">
            {loading ? "Se conectează..." : "Intră"}
          </Button>
        </form>

        <div className="mt-4 text-xs text-white/50">
          Tip: folosește seed-ul (ex: <span className="text-white/70">admin@local.com / admin123</span>)
        </div>
      </div>
    </div>
  );
}
