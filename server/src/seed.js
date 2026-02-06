import bcrypt from "bcrypt";
import { prisma } from "./prisma.js";

async function main() {
  const users = [
    {
      email: "admin@local.com",
      password: "admin123",
      role: "ADMIN",
      fullName: "Admin"
    },
    {
      email: "doctor@local.com",
      password: "doctor123",
      role: "DOCTOR",
      fullName: "Dr. Popescu"
    },
    {
      email: "reception@local.com",
      password: "reception123",
      role: "RECEPTION",
      fullName: "Recepție"
    }
  ];

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);

    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        passwordHash: hash,
        role: u.role,
        fullName: u.fullName
      }
    });

    console.log("Seeded:", u.email, "/", u.password);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
