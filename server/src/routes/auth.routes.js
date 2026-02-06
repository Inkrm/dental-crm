import { Router } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { signAccessToken, signRefreshToken, verifyRefresh } from "../utils/tokens.js";

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const access = signAccessToken({ sub: user.id, role: user.role, email: user.email });
  const refresh = signRefreshToken({ sub: user.id });

  // (MVP) păstrăm refresh în DB (hashuit) ca să-l poți revoca
  const tokenHash = await bcrypt.hash(refresh, 10);
  const decoded = verifyRefresh(refresh); // ca să luăm exp
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(decoded.exp * 1000)
    }
  });

  res.json({ accessToken: access, refreshToken: refresh, user: { id: user.id, email: user.email, role: user.role } });
});

router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body || {};
  if (!refreshToken) return res.status(400).json({ error: "Missing refreshToken" });

  try {
    const payload = verifyRefresh(refreshToken); // { sub, iat, exp }
    const tokens = await prisma.refreshToken.findMany({
      where: { userId: payload.sub, revokedAt: null }
    });

    // verificăm dacă există un hash care se potrivește
    let match = false;
    for (const t of tokens) {
      if (await bcrypt.compare(refreshToken, t.tokenHash)) { match = true; break; }
    }
    if (!match) return res.status(401).json({ error: "Invalid refresh token" });

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return res.status(401).json({ error: "User not found" });

    const access = signAccessToken({ sub: user.id, role: user.role, email: user.email });
    res.json({ accessToken: access });
  } catch {
    return res.status(401).json({ error: "Invalid/expired refresh token" });
  }
});

export default router;
