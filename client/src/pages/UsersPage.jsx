import { useEffect, useState } from "react";
import { api } from "../api.js";
import Card from "../components/Card.jsx";
import Input from "../components/Input.jsx";
import Button from "../components/Button.jsx";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("DOCTOR");
  const [password, setPassword] = useState("");

  async function load() {
    setError("");
    try {
      const data = await api("/users");
      setUsers(data);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => { load(); }, []);

  async function createUser(e) {
    e.preventDefault();
    setError("");
    try {
      await api("/users", {
        method: "POST",
        body: JSON.stringify({ email, fullName, role, password }),
      });
      setEmail(""); setFullName(""); setRole("DOCTOR"); setPassword("");
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="grid gap-4">
      <Card title="Utilizatori" subtitle="Doar ADMIN poate crea conturi" right={<Button onClick={load}>Refresh</Button>}>
        <form onSubmit={createUser} className="grid gap-3 md:grid-cols-4">
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@domain.com" required />
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nume complet" />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
          >
            <option value="DOCTOR" className="bg-zinc-900">DOCTOR</option>
            <option value="RECEPTION" className="bg-zinc-900">RECEPTION</option>
            <option value="ADMIN" className="bg-zinc-900">ADMIN</option>
          </select>

          <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Parolă (min 6)" type="password" required />

          <div className="md:col-span-4">
            <Button>Creează utilizator</Button>
          </div>

          {error && (
            <div className="md:col-span-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}
        </form>
      </Card>

      <Card title="Listă utilizatori" subtitle={`${users.length} conturi`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-white/60">
              <tr className="border-b border-white/10">
                <th className="py-2 text-left font-medium">Email</th>
                <th className="py-2 text-left font-medium">Nume</th>
                <th className="py-2 text-left font-medium">Rol</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-white/5">
                  <td className="py-2">{u.email}</td>
                  <td className="py-2 text-white/80">{u.fullName || "-"}</td>
                  <td className="py-2">{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
