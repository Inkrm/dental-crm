import { Router } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/doctors", async (req, res) => {
  const doctors = await prisma.user.findMany({
    where: { role: "DOCTOR" },
    select: { id: true, email: true, fullName: true, role: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(doctors);
});

router.get("/", requireRole("ADMIN"), async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, fullName: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(users);
});

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["ADMIN", "DOCTOR", "RECEPTION"]),
  fullName: z.string().min(1).optional(),
});

router.post("/", requireRole("ADMIN"), async (req, res) => {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { email, password, role, fullName } = parsed.data;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ error: "Email already exists" });

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, passwordHash, role, fullName: fullName || null },
    select: { id: true, email: true, fullName: true, role: true },
  });

  res.status(201).json(user);
});

export default router;
