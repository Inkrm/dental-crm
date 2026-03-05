import { Router } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { signAccessToken, signRefreshToken, verifyRefresh } from "../utils/tokens.js";

const router = Router();

// schema de validare pentru login
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

router.post("/login", async (req, res) => {
  // valideaza datele de autentificare
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { email, password } = parsed.data;
  // cauta utilizatorul dupa email
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  // compara parola cu hashul salvat
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  // genereaza tokenuri de acces si refresh
  const access = signAccessToken({ sub: user.id, role: user.role, email: user.email });
  const refresh = signRefreshToken({ sub: user.id });

  // salveaza hashul refresh tokenului pentru revocare
  const tokenHash = await bcrypt.hash(refresh, 10);
  const decoded = verifyRefresh(refresh); // ca sa luam exp
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(decoded.exp * 1000)
    }
  });

  res.json({
    accessToken: access,
    refreshToken: refresh,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      themeMode: user.themeMode,
    },
  });
});

router.post("/refresh", async (req, res) => {
  // citeste refresh tokenul din body
  const { refreshToken } = req.body || {};
  if (!refreshToken) return res.status(400).json({ error: "Missing refreshToken" });

  try {
    // verifica validitatea refresh tokenului
    const payload = verifyRefresh(refreshToken); 
    const tokens = await prisma.refreshToken.findMany({
      where: { userId: payload.sub, revokedAt: null }
    });

    // verificam daca exista un hash care se potriveate
    let match = false;
    for (const t of tokens) {
      if (await bcrypt.compare(refreshToken, t.tokenHash)) { match = true; break; }
    }
    if (!match) return res.status(401).json({ error: "Invalid refresh token" });

    // incarca utilizatorul si emite un nou access token
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return res.status(401).json({ error: "User not found" });

    const access = signAccessToken({ sub: user.id, role: user.role, email: user.email });
    res.json({ accessToken: access });
  } catch {
    return res.status(401).json({ error: "Invalid/expired refresh token" });
  }
});

export default router;
