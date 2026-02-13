import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
// aplica autentificarea pentru toate rutele de programari
router.use(requireAuth);

// schema de validare pentru creare programare
const createSchema = z.object({
  patientId: z.string().min(1),
  doctorId: z.string().min(1),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  reason: z.string().optional(),
});

router.get("/", async (req, res) => {
  // listeaza programarile cu date despre pacient si doctor
  const items = await prisma.appointment.findMany({
    include: {
      patient: true,
      doctor: { select: { id: true, email: true, fullName: true, role: true } },
    },
    orderBy: { startTime: "asc" },
  });

  res.json(items);
});

router.post("/", async (req, res) => {
  // valideaza payloadul de creare
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });

  const { patientId, doctorId, startTime, endTime, reason } = parsed.data;
  // converteste intervalul in Date
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (end <= start)
    return res.status(400).json({ error: "endTime must be after startTime" });

  // cauta programari care se suprapun in interval
  const items = await prisma.appointment.findMany({
    where: {
      startTime: { lt: to },
      endTime: { gt: from },
    },
    include: {
      patient: true,
      doctor: { select: { id: true, email: true, fullName: true, role: true } },
    },
    orderBy: { startTime: "asc" },
  });

  // daca exista suprapunere, respinge cererea
  if (overlap)
    return res
      .status(409)
      .json({ error: "Doctor is not available in that interval" });

  // creeaza programarea
  const appt = await prisma.appointment.create({
    data: { patientId, doctorId, startTime: start, endTime: end, reason },
    include: {
      patient: true,
      doctor: { select: { id: true, email: true, fullName: true, role: true } },
    },
  });
  res.status(201).json(appt);
});

// schema de validare pentru schimbarea statusului
const statusSchema = z.object({
  status: z.enum(["PLANNED", "CONFIRMED", "CANCELLED", "DONE"]),
});

router.patch("/:id/status", async (req, res) => {
  // valideaza statusul cerut
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });

  // verifica existenta programarii
  const appt = await prisma.appointment.findUnique({
    where: { id: req.params.id },
  });
  if (!appt) return res.status(404).json({ error: "Not found" });

  // actualizeaza statusul
  const updated = await prisma.appointment.update({
    where: { id: req.params.id },
    data: { status: parsed.data.status },
  });

  res.json(updated);
});

// schema de validare pentru actualizare programare
const updateApptSchema = z.object({
  patientId: z.string().min(1).optional(),
  doctorId: z.string().min(1).optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  reason: z.string().optional().nullable(),
  status: z.enum(["PLANNED", "CONFIRMED", "CANCELLED", "DONE"]).optional(),
});

router.put("/:id", async (req, res) => {
  // valideaza payloadul de update
  const parsed = updateApptSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });

  // incarca programarea curenta
  const current = await prisma.appointment.findUnique({
    where: { id: req.params.id },
  });
  if (!current) return res.status(404).json({ error: "Not found" });

  const data = parsed.data;

  // calculeaza valorile efective pentru doctor si interval
  const doctorId = data.doctorId ?? current.doctorId;
  const start = data.startTime ? new Date(data.startTime) : current.startTime;
  const end = data.endTime ? new Date(data.endTime) : current.endTime;

  if (end <= start)
    return res.status(400).json({ error: "endTime must be after startTime" });

  // verifica suprapuneri cu alte programari
  const overlap = await prisma.appointment.findFirst({
    where: {
      id: { not: current.id },
      doctorId,
      startTime: { lt: end },
      endTime: { gt: start },
      status: { not: "CANCELLED" },
    },
  });
  if (overlap)
    return res
      .status(409)
      .json({ error: "Doctor is not available in that interval" });

  // actualizeaza programarea
  const updated = await prisma.appointment.update({
    where: { id: current.id },
    data: {
      ...data,
      startTime: data.startTime ? start : undefined,
      endTime: data.endTime ? end : undefined,
    },
  });

  res.json(updated);
});

router.delete("/:id", async (req, res) => {
  // verifica existenta programarii
  const current = await prisma.appointment.findUnique({
    where: { id: req.params.id },
  });
  if (!current) return res.status(404).json({ error: "Not found" });

  // sterge programarea
  await prisma.appointment.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
