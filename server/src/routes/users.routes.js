import { Router } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/me", async (req, res) => {
  const userId = req.user?.sub;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      themeMode: true,
      createdAt: true,
    },
  });

  if (!user) return res.status(404).json({ error: "Not found" });
  res.json(user);
});

const updateMeSchema = z.object({
  fullName: z.string().min(1).optional().nullable(),
  password: z.string().min(6).optional(),
  themeMode: z.enum(["SYSTEM", "LIGHT", "DARK"]).optional(),
});

router.put("/me", async (req, res) => {
  const parsed = updateMeSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });

  const userId = req.user?.sub;
  const me = await prisma.user.findUnique({ where: { id: userId } });
  if (!me) return res.status(404).json({ error: "Not found" });

  const data = parsed.data;
  const updateData = {
    fullName: data.fullName === undefined ? undefined : data.fullName,
    themeMode: data.themeMode,
  };

  if (data.password) {
    updateData.passwordHash = await bcrypt.hash(data.password, 10);
  }

  const updated = await prisma.user.update({
    where: { id: me.id },
    data: updateData,
    select: { id: true, email: true, fullName: true, role: true, themeMode: true },
  });

  res.json(updated);
});

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
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      themeMode: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(users);
});

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["ADMIN", "DOCTOR", "RECEPTION"]),
  fullName: z.string().min(1).optional(),
  themeMode: z.enum(["SYSTEM", "LIGHT", "DARK"]).optional(),
});

router.post("/", requireRole("ADMIN"), async (req, res) => {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });

  const { email, password, role, fullName, themeMode } = parsed.data;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ error: "Email already exists" });

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role,
      fullName: fullName || null,
      themeMode: themeMode || undefined,
    },
    select: { id: true, email: true, fullName: true, role: true, themeMode: true },
  });

  res.status(201).json(user);
});

const updateUserSchema = z.object({
  fullName: z.string().min(1).optional().nullable(),
  role: z.enum(["ADMIN", "DOCTOR", "RECEPTION"]).optional(),
  password: z.string().min(6).optional(),
  themeMode: z.enum(["SYSTEM", "LIGHT", "DARK"]).optional(),
});

router.put("/:id", requireRole("ADMIN"), async (req, res) => {
  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });

  const u = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!u) return res.status(404).json({ error: "Not found" });

  const data = parsed.data;
  const updateData = {
    fullName: data.fullName === undefined ? undefined : data.fullName,
    role: data.role,
    themeMode: data.themeMode,
  };

  if (data.password) {
    updateData.passwordHash = await bcrypt.hash(data.password, 10);
  }

  const updated = await prisma.user.update({
    where: { id: u.id },
    data: updateData,
    select: { id: true, email: true, fullName: true, role: true, themeMode: true },
  });

  res.json(updated);
});

router.delete("/:id", requireRole("ADMIN"), async (req, res) => {
  const targetId = req.params.id;

  const currentUserId = req.user?.id || req.user?.userId || req.user?.sub;
  if (currentUserId && String(currentUserId) === String(targetId)) {
    return res
      .status(400)
      .json({ error: "You cannot delete your own account" });
  }

  const u = await prisma.user.findUnique({ where: { id: targetId } });
  if (!u) return res.status(404).json({ error: "Not found" });

  if (u.role === "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) {
      return res.status(400).json({ error: "Cannot delete the last ADMIN" });
    }
  }
  await prisma.user.delete({ where: { id: u.id } });
  res.json({ ok: true });
});

export default router;
