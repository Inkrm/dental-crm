import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// schema de validare pentru creare pacient
const createSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  dob: z.string().datetime().optional(),
  notes: z.string().optional()
});

// aplica autentificarea pentru toate rutele de pacienti
router.use(requireAuth);

router.get("/", async (req, res) => {
  // filtreaza pacientii dupa query, daca exista
  const q = (req.query.q || "").toString();
  const patients = await prisma.patient.findMany({
    where: q
      ? { OR: [
          { firstName: { contains: q, mode: "insensitive" } },
          { lastName: { contains: q, mode: "insensitive" } },
          { phone: { contains: q } }
        ]}
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 50
  });
  res.json(patients);
});

router.post("/", async (req, res) => {
  // valideaza payloadul de creare
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const data = parsed.data;
  // creeaza pacientul si converteste data nasterii
  const patient = await prisma.patient.create({
    data: { ...data, dob: data.dob ? new Date(data.dob) : null }
  });
  res.status(201).json(patient);
});

router.get("/:id", async (req, res) => {
  // cauta pacientul dupa id
  const patient = await prisma.patient.findUnique({ where: { id: req.params.id } });
  if (!patient) return res.status(404).json({ error: "Not found" });
  res.json(patient);
});

// schema de validare pentru update pacient
const updateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  dob: z.string().datetime().optional().nullable(),
  notes: z.string().optional().nullable(),
});

router.put("/:id", async (req, res) => {
  // valideaza payloadul de update
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  // verifica existenta pacientului
  const exists = await prisma.patient.findUnique({ where: { id: req.params.id } });
  if (!exists) return res.status(404).json({ error: "Not found" });

  const data = parsed.data;
  // actualizeaza pacientul si normalizeaza data nasterii
  const patient = await prisma.patient.update({
    where: { id: req.params.id },
    data: {
      ...data,
      dob: data.dob ? new Date(data.dob) : data.dob === null ? null : undefined,
    },
  });
  res.json(patient);
});

router.delete("/:id", async (req, res) => {
  // verifica existenta pacientului
  const exists = await prisma.patient.findUnique({ where: { id: req.params.id } });
  if (!exists) return res.status(404).json({ error: "Not found" });

  // sterge pacientul
  await prisma.patient.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
