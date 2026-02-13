import { verifyAccess } from "../utils/tokens.js";

export function requireAuth(req, res, next) {
  // preia headerul de autorizare si extrage tokenul Bearer
  const hdr = req.headers.authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
  // daca nu exista token, respinge cererea
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    // verifica tokenul si ataseaza utilizatorul pe request
    req.user = verifyAccess(token);
    next();
  } catch {
    // token invalid sau expirat
    return res.status(401).json({ error: "Invalid/expired token" });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    // necesita utilizator autentificat
    if (!req.user) return res.status(401).json({ error: "Unauthenticated" });
    // verifica daca rolul utilizatorului este permis
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: "Forbidden" });
    next();
  };
}
