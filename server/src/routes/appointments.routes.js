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
  reason: z.string().optional()
});

router.get("/", async (req, res) => {
  const from = req.query.from ? new Date(req.query.from.toString()) : new Date(Date.now() - 7 * 864e5);
  const to = req.query.to ? new Date(req.query.to.toString()) : new Date(Date.now() + 30 * 864e5);

  const items = await prisma.appointment.findMany({
    where: { startTime: { gte: from }, endTime: { lte: to } },
    include: { patient: true, doctor: { select: { id: true, email: true, fullName: true, role: true } } },
    orderBy: { startTime: "asc" }
  });

  res.json(items);
});

router.post("/", async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { patientId, doctorId, startTime, endTime, reason } = parsed.data;
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (end <= start) return res.status(400).json({ error: "endTime must be after startTime" });

  // overlap: start < existing.end AND end > existing.start
  const overlap = await prisma.appointment.findFirst({
    where: {
      doctorId,
      startTime: { lt: end },
      endTime: { gt: start },
      status: { not: "CANCELLED" }
    }
  });
  if (overlap) return res.status(409).json({ error: "Doctor is not available in that interval" });

  const appt = await prisma.appointment.create({
    data: { patientId, doctorId, startTime: start, endTime: end, reason }
  });
  res.status(201).json(appt);
});

const statusSchema = z.object({
  status: z.enum(["PLANNED", "CONFIRMED", "CANCELLED", "DONE"]),
});

router.patch("/:id/status", async (req, res) => {
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const appt = await prisma.appointment.findUnique({ where: { id: req.params.id } });
  if (!appt) return res.status(404).json({ error: "Not found" });

  const updated = await prisma.appointment.update({
    where: { id: req.params.id },
    data: { status: parsed.data.status },
  });

  res.json(updated);
});


export default router;
