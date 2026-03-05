import { useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import roLocale from "@fullcalendar/core/locales/ro";
import { api } from "../api.js";
import Card from "../components/Card.jsx";
import Button from "../components/Button.jsx";

// metadate ui pentru statusurile venite din backend.
const STATUS_META = {
  PLANNED: { color: "#94a3b8", label: "Planificata" },
  CONFIRMED: { color: "#3b82f6", label: "Confirmata" },
  DONE: { color: "#10b981", label: "Finalizata" },
  CANCELLED: { color: "#ef4444", label: "Anulata" },
};

function fmt(dt) {
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return dt;
  }
}

export default function CalendarPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // incarca programarile si trateaza erorile de retea/API.
  async function load() {
    setError("");
    try {
      const data = await api("/appointments");
      setItems(data);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const syncMobile = (event) => setIsMobile(event.matches);

    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener("change", syncMobile);

    return () => mediaQuery.removeEventListener("change", syncMobile);
  }, []);

  // normalizeaza structura programarilor in formatul asteptat de FullCalendar.
  const events = useMemo(
    () =>
      items.map((a) => {
        const patientName =
          `${a.patient?.firstName || ""} ${a.patient?.lastName || ""}`.trim() ||
          "Pacient";
        const doctorName = a.doctor?.fullName || a.doctor?.email || "Doctor";
        const statusMeta = STATUS_META[a.status] || STATUS_META.PLANNED;

        return {
          id: a.id,
          title: `${patientName} · ${doctorName}`,
          start: a.startTime,
          end: a.endTime,
          backgroundColor: statusMeta.color,
          borderColor: statusMeta.color,
          extendedProps: {
            status: a.status,
            reason: a.reason || "",
            patientName,
            doctorName,
          },
        };
      }),
    [items],
  );

  return (
    <div className="grid gap-4">
      <Card
        title="Calendar"
        subtitle="Programarile clinicii"
        right={<Button onClick={load}>Refresh</Button>}
      >
        {error && (
          <div className="mb-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="mb-3 flex flex-wrap gap-2 text-xs text-white/80">
          {Object.entries(STATUS_META).map(([key, meta]) => (
            <span
              key={key}
              className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-2 py-1"
            >
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: meta.color }}
              />
              {meta.label}
            </span>
          ))}
        </div>

        <FullCalendar
          className="crm-calendar"
          key={isMobile ? "calendar-mobile" : "calendar-desktop"}
          plugins={[dayGridPlugin, listPlugin]}
          initialView={isMobile ? "listWeek" : "dayGridMonth"}
          events={events}
          locales={[roLocale]}
          locale="ro"
          height="auto"
          firstDay={1}
          buttonText={{
            today: "Astazi",
            month: "Luna",
            week: "Saptamana",
            day: "Zi",
          }}
          // retinem evenimentul selectat pentru a afisa detalii sub calendar.
          eventClick={(info) => setSelectedEvent(info.event)}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: isMobile ? "listWeek,dayGridDay" : "dayGridMonth,dayGridDay",
          }}
        />
      </Card>

      {selectedEvent && (
        <Card title="Detalii programare">
          <div className="grid gap-2 text-sm text-white/85">
            <div>
              <span className="text-white/60">Pacient:</span>{" "}
              {selectedEvent.extendedProps.patientName}
            </div>
            <div>
              <span className="text-white/60">Doctor:</span>{" "}
              {selectedEvent.extendedProps.doctorName}
            </div>
            <div>
              <span className="text-white/60">Status:</span>{" "}
              {STATUS_META[selectedEvent.extendedProps.status]?.label ||
                selectedEvent.extendedProps.status}
            </div>
            <div>
              <span className="text-white/60">Start:</span>{" "}
              {fmt(selectedEvent.start)}
            </div>
            <div>
              <span className="text-white/60">Sfârșit:</span>{" "}
              {fmt(selectedEvent.end)}
            </div>
            {selectedEvent.extendedProps.reason && (
            <div>
              <span className="text-white/60">Motiv:</span>{" "}
              {selectedEvent.extendedProps.reason}
            </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
