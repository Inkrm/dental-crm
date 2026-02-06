import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

import usersRoutes from "./routes/users.routes.js";
import authRoutes from "./routes/auth.routes.js";
import patientRoutes from "./routes/patients.routes.js";
import appointmentRoutes from "./routes/appointments.routes.js";

dotenv.config();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/users", usersRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API on http://localhost:${port}`));
