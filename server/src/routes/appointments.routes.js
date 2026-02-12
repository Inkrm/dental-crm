import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

const createSchema = z.object({
  patientId: z.string().min(1),
  doctorId: z.string().min(1),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  reason: z.string().optional(),
});

router.get("/", async (req, res) => {
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
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });

  const { patientId, doctorId, startTime, endTime, reason } = parsed.data;
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (end <= start)
    return res.status(400).json({ error: "endTime must be after startTime" });

  // overlap: start < existing.end AND end > existing.start
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

  if (overlap)
    return res
      .status(409)
      .json({ error: "Doctor is not available in that interval" });

  const appt = await prisma.appointment.create({
    data: { patientId, doctorId, startTime: start, endTime: end, reason },
    include: {
      patient: true,
      doctor: { select: { id: true, email: true, fullName: true, role: true } },
    },
  });
  res.status(201).json(appt);
});

const statusSchema = z.object({
  status: z.enum(["PLANNED", "CONFIRMED", "CANCELLED", "DONE"]),
});

router.patch("/:id/status", async (req, res) => {
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });

  const appt = await prisma.appointment.findUnique({
    where: { id: req.params.id },
  });
  if (!appt) return res.status(404).json({ error: "Not found" });

  const updated = await prisma.appointment.update({
    where: { id: req.params.id },
    data: { status: parsed.data.status },
  });

  res.json(updated);
});

const updateApptSchema = z.object({
  patientId: z.string().min(1).optional(),
  doctorId: z.string().min(1).optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  reason: z.string().optional().nullable(),
  status: z.enum(["PLANNED", "CONFIRMED", "CANCELLED", "DONE"]).optional(),
});

router.put("/:id", async (req, res) => {
  const parsed = updateApptSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });

  const current = await prisma.appointment.findUnique({
    where: { id: req.params.id },
  });
  if (!current) return res.status(404).json({ error: "Not found" });

  const data = parsed.data;

  const doctorId = data.doctorId ?? current.doctorId;
  const start = data.startTime ? new Date(data.startTime) : current.startTime;
  const end = data.endTime ? new Date(data.endTime) : current.endTime;

  if (end <= start)
    return res.status(400).json({ error: "endTime must be after startTime" });

  // overlap check (exclude current)
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
  const current = await prisma.appointment.findUnique({
    where: { id: req.params.id },
  });
  if (!current) return res.status(404).json({ error: "Not found" });

  await prisma.appointment.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
