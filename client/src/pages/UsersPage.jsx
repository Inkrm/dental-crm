import { useEffect, useState } from "react";
import { api } from "../api.js";
import Card from "../components/Card.jsx";
import Input from "../components/Input.jsx";
import Button from "../components/Button.jsx";

function UserRow({ u, onChanged, onError }) {
  // rand utilizator cu editare locala
  const [editing, setEditing] = useState(false);

  const [fullName, setFullName] = useState(u.fullName || "");
  const [role, setRole] = useState(u.role);
  const [password, setPassword] = useState("");

  async function save() {
    // salveaza modificarile utilizatorului
    try {
      const body = {};
      // fullname: trimiti doar daca vrei sa-l schimbi
      body.fullName = fullName.trim() ? fullName.trim() : null;
      body.role = role;
      if (password.trim()) body.password = password.trim();

      await api(`/users/${u.id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });

      setPassword("");
      setEditing(false);
      onChanged();
    } catch (e) {
      onError(e.message);
    }
  }

  function cancel() {
    // revine la valorile initiale
    setFullName(u.fullName || "");
    setRole(u.role);
    setPassword("");
    setEditing(false);
  }

  async function del() {
    // sterge utilizatorul dupa confirmare
    if (!confirm(`Ștergi utilizatorul ${u.email}?`)) return;
    try {
      await api(`/users/${u.id}`, { method: "DELETE" });
      onChanged();
    } catch (e) {
      onError(e.message);
    }
  }

  return (
    <tr className="border-b border-white/5">
      <td className="py-2">{u.email}</td>

      <td className="py-2 text-white/80">
        {editing ? (
          <input
            className="w-full max-w-xs rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white outline-none"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nume complet"
          />
        ) : (
          u.fullName || "-"
        )}
      </td>

      <td className="py-2">
        {editing ? (
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white outline-none"
          >
            <option className="bg-zinc-900" value="ADMIN">ADMIN</option>
            <option className="bg-zinc-900" value="DOCTOR">DOCTOR</option>
            <option className="bg-zinc-900" value="RECEPTION">RECEPTION</option>
          </select>
        ) : (
          u.role
        )}
      </td>

      <td className="py-2">
        {editing ? (
          <input
            className="w-full max-w-xs rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Parolă nouă (opțional)"
            type="password"
          />
        ) : (
          <span className="text-white/50 text-xs">—</span>
        )}
      </td>

      <td className="py-2">
        <div className="flex flex-wrap gap-2">
          {!editing ? (
            <>
              <Button
                variant="secondary"
                type="button"
                onClick={() => setEditing(true)}
              >
                Editează
              </Button>

              <Button
                variant="warning"
                type="button"
                onClick={del}
              >
                Șterge
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="success"
                type="button"
                onClick={save}
              >
                Salvează
              </Button>

              <Button
                variant="warning"
                type="button"
                onClick={cancel}
              >
                Anulează
              </Button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

function UserCard({ u, onChanged, onError }) {
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(u.fullName || "");
  const [role, setRole] = useState(u.role);
  const [password, setPassword] = useState("");

  async function save() {
    try {
      const body = {};
      body.fullName = fullName.trim() ? fullName.trim() : null;
      body.role = role;
      if (password.trim()) body.password = password.trim();

      await api(`/users/${u.id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });

      setPassword("");
      setEditing(false);
      onChanged();
    } catch (e) {
      onError(e.message);
    }
  }

  function cancel() {
    setFullName(u.fullName || "");
    setRole(u.role);
    setPassword("");
    setEditing(false);
  }

  async function del() {
    if (!confirm(`Ștergi utilizatorul ${u.email}?`)) return;
    try {
      await api(`/users/${u.id}`, { method: "DELETE" });
      onChanged();
    } catch (e) {
      onError(e.message);
    }
  }

  return (
    <div className="rounded-md border border-white/10 bg-white/5 p-3">
      <div className="text-sm text-white/90">{u.email}</div>

      <div className="mt-2 text-sm">
        {editing ? (
          <input
            className="w-full rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white outline-none"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nume complet"
          />
        ) : (
          u.fullName || "-"
        )}
      </div>

      <div className="mt-2 text-sm">
        {editing ? (
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white outline-none"
          >
            <option className="bg-zinc-900" value="ADMIN">ADMIN</option>
            <option className="bg-zinc-900" value="DOCTOR">DOCTOR</option>
            <option className="bg-zinc-900" value="RECEPTION">RECEPTION</option>
          </select>
        ) : (
          u.role
        )}
      </div>

      <div className="mt-2 text-sm">
        {editing ? (
          <input
            className="w-full rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Parolă nouă (opțional)"
            type="password"
          />
        ) : (
          <span className="text-white/50 text-xs">Reset parolă: —</span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {!editing ? (
          <>
            <Button
              variant="secondary"
              type="button"
              onClick={() => setEditing(true)}
            >
              Editează
            </Button>

            <Button
              variant="warning"
              type="button"
              onClick={del}
            >
              Șterge
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="success"
              type="button"
              onClick={save}
            >
              Salvează
            </Button>

            <Button
              variant="warning"
              type="button"
              onClick={cancel}
            >
              Anulează
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default function UsersPage() {
  // stare pentru lista si erori
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  // formular creare (post /users)
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("DOCTOR");
  const [password, setPassword] = useState("");

  async function load() {
    // incarca lista de utilizatori
    setError("");
    try {
      const data = await api("/users");
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    // initializare lista la montare
    load();
  }, []);

  async function createUser(e) {
    // creeaza un utilizator nou
    e.preventDefault();
    setError("");
    try {
      await api("/users", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          role,
          fullName: fullName.trim() ? fullName.trim() : undefined,
        }),
      });

      setEmail("");
      setFullName("");
      setRole("DOCTOR");
      setPassword("");
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="grid gap-4">
      <Card
        title="Utilizatori"
        subtitle="ADMIN creează / editează / șterge"
        right={<Button onClick={load}>Refresh</Button>}
      >
        <form onSubmit={createUser} className="grid gap-3 md:grid-cols-4">
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@domain.com"
            required
          />

          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nume complet (opțional)"
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
          >
            <option className="bg-zinc-900" value="DOCTOR">DOCTOR</option>
            <option className="bg-zinc-900" value="RECEPTION">RECEPTION</option>
            <option className="bg-zinc-900" value="ADMIN">ADMIN</option>
          </select>

          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Parolă (min 6)"
            type="password"
            required
          />

          <div className="md:col-span-4">
            <Button>Creează utilizator</Button>
          </div>

          {error && (
            <div className="md:col-span-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}
        </form>
      </Card>

      <Card title="Listă utilizatori" subtitle={`${users.length} conturi`}>
        <div className="md:hidden grid gap-2">
          {users.map((u) => (
            <UserCard key={u.id} u={u} onChanged={load} onError={setError} />
          ))}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-white/60">
              <tr className="border-b border-white/10">
                <th className="py-2 text-left font-medium">Email</th>
                <th className="py-2 text-left font-medium">Nume</th>
                <th className="py-2 text-left font-medium">Rol</th>
                <th className="py-2 text-left font-medium">Reset parolă</th>
                <th className="py-2 text-left font-medium">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <UserRow key={u.id} u={u} onChanged={load} onError={setError} />
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
