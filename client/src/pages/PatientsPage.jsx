import { useEffect, useState } from "react";
import { api } from "../api.js";
import Card from "../components/Card.jsx";
import Input from "../components/Input.jsx";
import Button from "../components/Button.jsx";

export default function PatientsPage() {
  // stare pentru lista si formular
  const [patients, setPatients] = useState([]);
  const [q, setQ] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  async function load() {
    // incarca lista de pacienti cu filtrare optionala
    setError("");
    try {
      const data = await api(
        `/patients${q ? `?q=${encodeURIComponent(q)}` : ""}`,
      );
      setPatients(data);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    // initializare lista la montare
    load();
  }, []);

  async function addPatient(e) {
    // creeaza un pacient nou
    e.preventDefault();
    setError("");
    try {
      await api("/patients", {
        method: "POST",
        body: JSON.stringify({ firstName, lastName, phone }),
      });
      setFirstName("");
      setLastName("");
      setPhone("");
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  function Row({ p, onChanged, onError }) {
    // componenta locala pentru editare pacient (nefolosita momentan)
    const [editing, setEditing] = useState(false);
    const [firstName, setFirstName] = useState(p.firstName);
    const [lastName, setLastName] = useState(p.lastName);
    const [phone, setPhone] = useState(p.phone || "");

    async function save() {
      // salveaza modificarile pacientului
      try {
        await api(`/patients/${p.id}`, {
          method: "PUT",
          body: JSON.stringify({ firstName, lastName, phone }),
        });
        setEditing(false);
        onChanged();
      } catch (e) {
        onError(e.message);
      }
    }

    function cancel() {
      // revine la valorile initiale
      setFirstName(p.firstName);
      setLastName(p.lastName);
      setPhone(p.phone || "");
      setEditing(false);
    }

  }

  async function del(id) {
    // sterge pacientul dupa confirmare
    if (!confirm("Ștergi pacientul?")) return;
    setError("");
    try {
      await api(`/patients/${id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="grid gap-4">
      <Card
        title="Pacienți"
        subtitle="Creează și caută pacienți"
        right={<Button onClick={load}>Refresh</Button>}
      >
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Caută după nume/telefon..."
          />
          <Button onClick={load}>Caută</Button>
        </div>

        <hr className="m-4" />

        <form onSubmit={addPatient} className="mt-4 grid gap-3 md:grid-cols-4">
          <Input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Prenume"
            required
          />
          <Input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Nume"
            required
          />
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Telefon"
          />
          <Button>Adaugă</Button>
        </form>

        {error && (
          <div className="mt-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}
      </Card>

      <Card title="Listă pacienți" subtitle={`${patients.length} rezultate`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-white/60">
              <tr className="border-b border-white/10">
                <th className="py-2 text-left font-medium">Nume</th>
                <th className="py-2 text-left font-medium">Telefon</th>
                <th className="py-2 text-left font-medium">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id} className="border-b border-white/5">
                  <td className="py-2">
                    {p.firstName} {p.lastName}
                  </td>
                  <td className="py-2 text-white/80">{p.phone || "-"}</td>
                  <td className="py-2">
                    <Button onClick={() => del(p.id)}>
                      Șterge
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
