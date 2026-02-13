import { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";
import Card from "../components/Card.jsx";
import Input from "../components/Input.jsx";
import Button from "../components/Button.jsx";

function fmtLocal(dt) {
  // formateaza data in format local, cu fallback
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return dt;
  }
}

function Badge({ status }) {
  // mapeaza statusul la stiluri vizuale
  const map = {
    PLANNED: "bg-white/10 text-white/80",
    CONFIRMED: "bg-blue-500/15 text-blue-200",
    DONE: "bg-emerald-500/15 text-emerald-200",
    CANCELLED: "bg-red-500/15 text-red-200",
  };
  return (
    <span
      className={
        "inline-flex items-center rounded-md px-2 py-1 text-xs border border-white/10 " +
        (map[status] || "bg-white/10")
      }
    >
      {status}
    </span>
  );
}

export default function AppointmentsPage() {
  // stare pentru date si erori
  const [items, setItems] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState("");
  const [patientQuery, setPatientQuery] = useState("");
  const [patientOpen, setPatientOpen] = useState(false);

  // form
  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reason, setReason] = useState("");

  // filtre
  const [filterDoctor, setFilterDoctor] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterText, setFilterText] = useState("");

  async function loadAll() {
    // incarca programari, pacienti si doctori
    setError("");
    try {
      const [appts, pats, docs] = await Promise.all([
        api("/appointments"),
        api("/patients"),
        api("/users/doctors"),
      ]);
      setItems(appts);
      setPatients(pats);
      setDoctors(docs);

      if (!patientId && pats[0]) setPatientId(pats[0].id);
      if (!doctorId && docs[0]) setDoctorId(docs[0].id);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    // initializare date la montare
    loadAll();
  }, []);

  // verifica daca formularul poate fi trimis
  const canSubmit = useMemo(
    () => patientId && doctorId && startTime && endTime,
    [patientId, doctorId, startTime, endTime],
  );

  async function createAppointment(e) {
    // trimite cererea de creare programare
    e.preventDefault();
    setError("");
    try {
      await api("/appointments", {
        method: "POST",
        body: JSON.stringify({
          patientId,
          doctorId,
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          reason,
        }),
      });
      setReason("");
      await loadAll();
    } catch (e) {
      setError(e.message);
    }
  }

  async function setStatus(id, status) {
    // actualizeaza statusul programarii
    setError("");
    try {
      await api(`/appointments/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await loadAll();
    } catch (e) {
      setError(e.message);
    }
  }

  const filtered = useMemo(() => {
    // filtreaza programarile dupa criterii
    return items.filter((a) => {
      if (filterDoctor !== "ALL" && a.doctorId !== filterDoctor) return false;
      if (filterStatus !== "ALL" && a.status !== filterStatus) return false;

      if (filterText.trim()) {
        const t = filterText.toLowerCase();
        const p =
          `${a.patient?.firstName || ""} ${a.patient?.lastName || ""} ${a.patient?.phone || ""}`.toLowerCase();
        const d =
          `${a.doctor?.fullName || ""} ${a.doctor?.email || ""}`.toLowerCase();
        const r = `${a.reason || ""}`.toLowerCase();
        if (!p.includes(t) && !d.includes(t) && !r.includes(t)) return false;
      }

      return true;
    });
  }, [items, filterDoctor, filterStatus, filterText]);

  const patientResults = useMemo(() => {
    // sugestii pacienti pentru autocomplete
    const t = patientQuery.trim().toLowerCase();
    if (!t) return patients.slice(0, 8);

    return patients
      .filter((p) => {
        const s = `${p.firstName} ${p.lastName} ${p.phone || ""}`.toLowerCase();
        return s.includes(t);
      })
      .slice(0, 8);
  }, [patients, patientQuery]);

  return (
    <div className="grid gap-4">
      <Card
        title="Programări"
        subtitle="Creează programări + verificare suprapuneri"
        right={<Button onClick={loadAll}>Refresh</Button>}
      >
        <form
          onSubmit={createAppointment}
          className="grid gap-3 md:grid-cols-2"
        >
          <div className="relative">
            <div className="text-xs text-white/70 mb-1">Pacient</div>

            {patientId && (
              <div className="mb-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm">
                <div className="text-white/90">
                  {(() => {
                    const p = patients.find((x) => x.id === patientId);
                    return p
                      ? `${p.firstName} ${p.lastName}`
                      : "Pacient selectat";
                  })()}
                </div>
                <div className="text-xs text-white/50">
                  {patients.find((x) => x.id === patientId)?.phone || ""}
                </div>
              </div>
            )}

            <Input
              value={patientQuery}
              onChange={(e) => {
                setPatientQuery(e.target.value);
                setPatientOpen(true);
              }}
              onFocus={() => setPatientOpen(true)}
              onBlur={() => setTimeout(() => setPatientOpen(false), 150)}
              placeholder="Caută pacient (nume/telefon)..."
              className="h-10"
            />

            {patientOpen && patientResults.length > 0 && (
              <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-md border border-white/10 bg-zinc-900 shadow-lg">
                {patientResults.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setPatientId(p.id);
                      setPatientQuery("");
                      setPatientOpen(false);
                    }}
                    className={
                      "w-full text-left px-3 py-2 text-sm hover:bg-white/10 " +
                      (p.id === patientId ? "bg-white/10" : "")
                    }
                  >
                    <div className="text-white/90">
                      {p.firstName} {p.lastName}
                    </div>
                    <div className="text-xs text-white/50">{p.phone || ""}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="text-xs text-white/70 mb-1">Doctor</div>
            <select
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
              required
            >
              {doctors.map((d) => (
                <option key={d.id} value={d.id} className="bg-zinc-900">
                  {d.fullName || d.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="text-xs text-white/70 mb-1">Start</div>
            <Input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>

          <div>
            <div className="text-xs text-white/70 mb-1">End</div>
            <Input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>

          <div className="md:col-span-2">
            <div className="text-xs text-white/70 mb-1">Motiv (opțional)</div>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="ex: consult, carie..."
            />
          </div>

          <div className="md:col-span-2">
            <Button disabled={!canSubmit}>Creează programare</Button>
          </div>

          {error && (
            <div className="md:col-span-2 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}
        </form>
      </Card>

      <Card title="Filtre" subtitle="Caută după pacient/doctor/motiv">
        <div className="grid gap-3 md:grid-cols-3">
          <select
            value={filterDoctor}
            onChange={(e) => setFilterDoctor(e.target.value)}
            className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
          >
            <option value="ALL" className="bg-zinc-900">
              Toți doctorii
            </option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id} className="bg-zinc-900">
                {d.fullName || d.email}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
          >
            <option value="ALL" className="bg-zinc-900">
              Toate statusurile
            </option>
            <option value="PLANNED" className="bg-zinc-900">
              PLANNED
            </option>
            <option value="CONFIRMED" className="bg-zinc-900">
              CONFIRMED
            </option>
            <option value="DONE" className="bg-zinc-900">
              DONE
            </option>
            <option value="CANCELLED" className="bg-zinc-900">
              CANCELLED
            </option>
          </select>

          <Input
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Nume/Prenume"
          />
        </div>
      </Card>

      <Card title="Listă programări" subtitle={`${filtered.length} rezultate`}>
        {/* mobil */}
        <div className="md:hidden grid gap-2">
          {filtered.map((a) => (
            <div
              key={a.id}
              className="rounded-md border border-white/10 bg-white/5 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm">{fmtLocal(a.startTime)}</div>
                <Badge status={a.status} />
              </div>

              <div className="mt-2 text-sm text-white/90">
                {a.patient?.firstName} {a.patient?.lastName}
              </div>
              <div className="text-xs text-white/50">
                {a.patient?.phone || ""}
              </div>

              <div className="mt-2 text-sm">
                {a.doctor?.fullName || a.doctor?.email}
              </div>

              <div className="mt-2 text-sm text-white/80">
                {a.reason || "-"}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => setStatus(a.id, "CONFIRMED")}
                  className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs hover:bg-white/10"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setStatus(a.id, "DONE")}
                  className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs hover:bg-white/10"
                >
                  Done
                </button>
                <button
                  onClick={() => setStatus(a.id, "CANCELLED")}
                  className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs hover:bg-white/10"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-white/60">
              <tr className="border-b border-white/10">
                <th className="py-2 text-left font-medium">Data</th>
                <th className="py-2 text-left font-medium">Pacient</th>
                <th className="py-2 text-left font-medium">Doctor</th>
                <th className="py-2 text-left font-medium">Motiv</th>
                <th className="py-2 text-left font-medium">Status</th>
                <th className="py-2 text-left font-medium">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="border-b border-white/5">
                  <td className="py-2">{fmtLocal(a.startTime)}</td>
                  <td className="py-2">
                    {a.patient?.firstName} {a.patient?.lastName}
                    <div className="text-xs text-white/50">
                      {a.patient?.phone || ""}
                    </div>
                  </td>
                  <td className="py-2">
                    {a.doctor?.fullName || a.doctor?.email}
                  </td>
                  <td className="py-2 text-white/80">{a.reason || "-"}</td>
                  <td className="py-2">
                    <Badge status={a.status} />
                  </td>
                  <td className="py-2">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setStatus(a.id, "CONFIRMED")}
                        className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs hover:bg-white/10"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setStatus(a.id, "DONE")}
                        className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs hover:bg-white/10"
                      >
                        Done
                      </button>
                      <button
                        onClick={() => setStatus(a.id, "CANCELLED")}
                        className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs hover:bg-white/10"
                      >
                        Cancel
                      </button>
                    </div>
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
