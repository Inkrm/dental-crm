import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "./prisma.js";

const doctorsSeed = [
  { email: "dr.ionescu@local.com", password: "doctor123", fullName: "Dr. Andrei Ionescu" },
  { email: "dr.popa@local.com", password: "doctor123", fullName: "Dr. Elena Popa" },
  { email: "dr.radu@local.com", password: "doctor123", fullName: "Dr. Mihai Radu" },
  { email: "dr.marin@local.com", password: "doctor123", fullName: "Dr. Cristina Marin" },
  { email: "dr.stan@local.com", password: "doctor123", fullName: "Dr. Vlad Stan" }
];

const patientsSeed = [
  {
    firstName: "Ion",
    lastName: "Popescu",
    phone: "+37360000001",
    email: "ion.popescu@mail.com",
    dob: new Date("1990-04-12"),
    notes: "Control de rutina"
  },
  {
    firstName: "Maria",
    lastName: "Istrate",
    phone: "+37360000002",
    email: "maria.istrate@mail.com",
    dob: new Date("1988-09-03"),
    notes: "Sensibilitate la rece"
  },
  {
    firstName: "Alex",
    lastName: "Rusu",
    phone: "+37360000003",
    email: "alex.rusu@mail.com",
    dob: new Date("2001-01-19"),
    notes: "Consult ortodontic"
  },
  {
    firstName: "Ana",
    lastName: "Munteanu",
    phone: "+37360000004",
    email: "ana.munteanu@mail.com",
    dob: new Date("1995-06-27"),
    notes: "Profilaxie"
  },
  {
    firstName: "Victor",
    lastName: "Ceban",
    phone: "+37360000005",
    email: "victor.ceban@mail.com",
    dob: new Date("1979-11-08"),
    notes: "Durere molar stanga"
  },
  {
    firstName: "Sergiu",
    lastName: "Balan",
    phone: "+37360000006",
    email: "sergiu.balan@mail.com",
    dob: new Date("1985-03-15"),
    notes: "Control semestrial"
  },
  {
    firstName: "Irina",
    lastName: "Nistor",
    phone: "+37360000007",
    email: "irina.nistor@mail.com",
    dob: new Date("1992-12-01"),
    notes: "Albire dentara"
  },
  {
    firstName: "Mihai",
    lastName: "Dumitru",
    phone: "+37360000008",
    email: "mihai.dumitru@mail.com",
    dob: new Date("1976-05-22"),
    notes: "Punte dentara"
  },
  {
    firstName: "Larisa",
    lastName: "Toma",
    phone: "+37360000009",
    email: "larisa.toma@mail.com",
    dob: new Date("1999-02-18"),
    notes: "Consultatie initiala"
  },
  {
    firstName: "Denis",
    lastName: "Gaina",
    phone: "+37360000010",
    email: "denis.gaina@mail.com",
    dob: new Date("2003-10-10"),
    notes: "Durere acuta"
  },
  {
    firstName: "Tatiana",
    lastName: "Luca",
    phone: "+37360000011",
    email: "tatiana.luca@mail.com",
    dob: new Date("1983-07-07"),
    notes: "Control post-tratament"
  },
  {
    firstName: "Gheorghe",
    lastName: "Pascu",
    phone: "+37360000012",
    email: "gheorghe.pascu@mail.com",
    dob: new Date("1969-01-29"),
    notes: "Implant consult"
  },
  {
    firstName: "Bianca",
    lastName: "Cojocaru",
    phone: "+37360000013",
    email: "bianca.cojocaru@mail.com",
    dob: new Date("1997-11-14"),
    notes: "Detartraj si periaj"
  },
  {
    firstName: "Oleg",
    lastName: "Melnic",
    phone: "+37360000014",
    email: "oleg.melnic@mail.com",
    dob: new Date("1981-08-31"),
    notes: "Plomba veche de inlocuit"
  },
  {
    firstName: "Nicoleta",
    lastName: "Rusu",
    phone: "+37360000015",
    email: "nicoleta.rusu@mail.com",
    dob: new Date("1994-09-25"),
    notes: "Evaluare gingivala"
  }
];

function atDateTime(date, hour, minute = 0) {
  const iso = `${date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
  return new Date(iso);
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

async function seedDoctors() {
  const doctorsByEmail = new Map();

  for (const doctor of doctorsSeed) {
    const passwordHash = await bcrypt.hash(doctor.password, 10);

    const savedDoctor = await prisma.user.upsert({
      where: { email: doctor.email },
      update: {
        fullName: doctor.fullName,
        role: "DOCTOR",
        passwordHash
      },
      create: {
        email: doctor.email,
        fullName: doctor.fullName,
        role: "DOCTOR",
        passwordHash
      }
    });

    doctorsByEmail.set(doctor.email, savedDoctor);
    console.log("Doctor:", doctor.email);
  }

  return doctorsByEmail;
}

async function seedPatients() {
  const patientsByEmail = new Map();

  for (const patient of patientsSeed) {
    const existing = await prisma.patient.findFirst({
      where: {
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        phone: patient.phone
      }
    });

    let savedPatient;
    if (existing) {
      savedPatient = await prisma.patient.update({
        where: { id: existing.id },
        data: {
          dob: patient.dob,
          notes: patient.notes
        }
      });
    } else {
      savedPatient = await prisma.patient.create({ data: patient });
    }

    patientsByEmail.set(patient.email, savedPatient);
    console.log("Patient:", `${patient.firstName} ${patient.lastName}`);
  }

  return patientsByEmail;
}

async function seedAppointments(doctorsByEmail, patientsByEmail) {
  const appointmentsSeed = [
    { doctorEmail: "dr.ionescu@local.com", patientEmail: "ion.popescu@mail.com", date: "2026-03-01", startHour: 9, startMinute: 0, durationMin: 45, status: "CONFIRMED", reason: "Control general" },
    { doctorEmail: "dr.ionescu@local.com", patientEmail: "maria.istrate@mail.com", date: "2026-03-01", startHour: 10, startMinute: 0, durationMin: 45, status: "DONE", reason: "Tratament carie" },
    { doctorEmail: "dr.ionescu@local.com", patientEmail: "victor.ceban@mail.com", date: "2026-03-01", startHour: 11, startMinute: 0, durationMin: 60, status: "DONE", reason: "Durere molar" },
    { doctorEmail: "dr.ionescu@local.com", patientEmail: "sergiu.balan@mail.com", date: "2026-03-03", startHour: 14, startMinute: 0, durationMin: 30, status: "DONE", reason: "Control periodic" },
    { doctorEmail: "dr.ionescu@local.com", patientEmail: "bianca.cojocaru@mail.com", date: "2026-03-05", startHour: 9, startMinute: 30, durationMin: 45, status: "CONFIRMED", reason: "Profilaxie" },
    { doctorEmail: "dr.ionescu@local.com", patientEmail: "tatiana.luca@mail.com", date: "2026-03-06", startHour: 10, startMinute: 30, durationMin: 30, status: "PLANNED", reason: "Control post-tratament" },
    { doctorEmail: "dr.ionescu@local.com", patientEmail: "oleg.melnic@mail.com", date: "2026-03-08", startHour: 9, startMinute: 0, durationMin: 45, status: "PLANNED", reason: "Inlocuire plomba" },
    { doctorEmail: "dr.ionescu@local.com", patientEmail: "nicoleta.rusu@mail.com", date: "2026-03-10", startHour: 11, startMinute: 0, durationMin: 30, status: "PLANNED", reason: "Evaluare gingivala" },

    { doctorEmail: "dr.popa@local.com", patientEmail: "alex.rusu@mail.com", date: "2026-03-02", startHour: 9, startMinute: 0, durationMin: 30, status: "DONE", reason: "Consult ortodontic" },
    { doctorEmail: "dr.popa@local.com", patientEmail: "ana.munteanu@mail.com", date: "2026-03-02", startHour: 9, startMinute: 45, durationMin: 30, status: "DONE", reason: "Detartraj" },
    { doctorEmail: "dr.popa@local.com", patientEmail: "larisa.toma@mail.com", date: "2026-03-02", startHour: 10, startMinute: 30, durationMin: 45, status: "CONFIRMED", reason: "Consultatie initiala" },
    { doctorEmail: "dr.popa@local.com", patientEmail: "denis.gaina@mail.com", date: "2026-03-04", startHour: 12, startMinute: 0, durationMin: 45, status: "CONFIRMED", reason: "Urgenta durere" },
    { doctorEmail: "dr.popa@local.com", patientEmail: "nicoleta.rusu@mail.com", date: "2026-03-06", startHour: 15, startMinute: 0, durationMin: 30, status: "PLANNED", reason: "Consult gingival" },
    { doctorEmail: "dr.popa@local.com", patientEmail: "ion.popescu@mail.com", date: "2026-03-09", startHour: 13, startMinute: 0, durationMin: 45, status: "PLANNED", reason: "Control ocluzie" },
    { doctorEmail: "dr.popa@local.com", patientEmail: "mihai.dumitru@mail.com", date: "2026-03-11", startHour: 9, startMinute: 30, durationMin: 60, status: "PLANNED", reason: "Consult protetic" },
    { doctorEmail: "dr.popa@local.com", patientEmail: "gheorghe.pascu@mail.com", date: "2026-03-13", startHour: 16, startMinute: 0, durationMin: 30, status: "PLANNED", reason: "Control implant" },

    { doctorEmail: "dr.radu@local.com", patientEmail: "irina.nistor@mail.com", date: "2026-03-01", startHour: 13, startMinute: 0, durationMin: 60, status: "DONE", reason: "Albire dentara" },
    { doctorEmail: "dr.radu@local.com", patientEmail: "mihai.dumitru@mail.com", date: "2026-03-03", startHour: 10, startMinute: 0, durationMin: 60, status: "DONE", reason: "Consult protetic" },
    { doctorEmail: "dr.radu@local.com", patientEmail: "oleg.melnic@mail.com", date: "2026-03-03", startHour: 11, startMinute: 30, durationMin: 45, status: "CONFIRMED", reason: "Inlocuire plomba" },
    { doctorEmail: "dr.radu@local.com", patientEmail: "gheorghe.pascu@mail.com", date: "2026-03-05", startHour: 16, startMinute: 0, durationMin: 45, status: "CONFIRMED", reason: "Evaluare implant" },
    { doctorEmail: "dr.radu@local.com", patientEmail: "tatiana.luca@mail.com", date: "2026-03-07", startHour: 9, startMinute: 0, durationMin: 30, status: "CONFIRMED", reason: "Control post-tratament" },
    { doctorEmail: "dr.radu@local.com", patientEmail: "bianca.cojocaru@mail.com", date: "2026-03-10", startHour: 14, startMinute: 0, durationMin: 45, status: "PLANNED", reason: "Igienizare completa" },
    { doctorEmail: "dr.radu@local.com", patientEmail: "denis.gaina@mail.com", date: "2026-03-12", startHour: 10, startMinute: 30, durationMin: 30, status: "PLANNED", reason: "Evaluare urgenta" },
    { doctorEmail: "dr.radu@local.com", patientEmail: "larisa.toma@mail.com", date: "2026-03-14", startHour: 11, startMinute: 0, durationMin: 45, status: "PLANNED", reason: "Control estetic" },

    { doctorEmail: "dr.marin@local.com", patientEmail: "bianca.cojocaru@mail.com", date: "2026-03-02", startHour: 14, startMinute: 0, durationMin: 30, status: "DONE", reason: "Periaj profesional" },
    { doctorEmail: "dr.marin@local.com", patientEmail: "maria.istrate@mail.com", date: "2026-03-04", startHour: 9, startMinute: 0, durationMin: 45, status: "DONE", reason: "Tratare sensibilitate" },
    { doctorEmail: "dr.marin@local.com", patientEmail: "ana.munteanu@mail.com", date: "2026-03-04", startHour: 10, startMinute: 0, durationMin: 45, status: "CONFIRMED", reason: "Control parodontal" },
    { doctorEmail: "dr.marin@local.com", patientEmail: "ion.popescu@mail.com", date: "2026-03-06", startHour: 11, startMinute: 0, durationMin: 30, status: "CONFIRMED", reason: "Fluorizare" },
    { doctorEmail: "dr.marin@local.com", patientEmail: "larisa.toma@mail.com", date: "2026-03-08", startHour: 15, startMinute: 30, durationMin: 45, status: "PLANNED", reason: "Evaluare estetica" },
    { doctorEmail: "dr.marin@local.com", patientEmail: "sergiu.balan@mail.com", date: "2026-03-09", startHour: 12, startMinute: 0, durationMin: 30, status: "PLANNED", reason: "Control semestrial" },
    { doctorEmail: "dr.marin@local.com", patientEmail: "nicoleta.rusu@mail.com", date: "2026-03-11", startHour: 14, startMinute: 30, durationMin: 30, status: "PLANNED", reason: "Consult gingival" },
    { doctorEmail: "dr.marin@local.com", patientEmail: "victor.ceban@mail.com", date: "2026-03-13", startHour: 10, startMinute: 0, durationMin: 60, status: "PLANNED", reason: "Evaluare chirurgie" },

    { doctorEmail: "dr.stan@local.com", patientEmail: "victor.ceban@mail.com", date: "2026-03-02", startHour: 16, startMinute: 0, durationMin: 60, status: "DONE", reason: "Consult chirurgie" },
    { doctorEmail: "dr.stan@local.com", patientEmail: "gheorghe.pascu@mail.com", date: "2026-03-05", startHour: 13, startMinute: 0, durationMin: 60, status: "CONFIRMED", reason: "Plan implant" },
    { doctorEmail: "dr.stan@local.com", patientEmail: "denis.gaina@mail.com", date: "2026-03-06", startHour: 9, startMinute: 30, durationMin: 45, status: "CONFIRMED", reason: "Extractie molar" },
    { doctorEmail: "dr.stan@local.com", patientEmail: "sergiu.balan@mail.com", date: "2026-03-07", startHour: 12, startMinute: 0, durationMin: 30, status: "PLANNED", reason: "Reevaluare" },
    { doctorEmail: "dr.stan@local.com", patientEmail: "alex.rusu@mail.com", date: "2026-03-09", startHour: 10, startMinute: 0, durationMin: 45, status: "CONFIRMED", reason: "Control final ortodontic" },
    { doctorEmail: "dr.stan@local.com", patientEmail: "irina.nistor@mail.com", date: "2026-03-10", startHour: 15, startMinute: 0, durationMin: 45, status: "PLANNED", reason: "Consult estetic" },
    { doctorEmail: "dr.stan@local.com", patientEmail: "mihai.dumitru@mail.com", date: "2026-03-12", startHour: 11, startMinute: 0, durationMin: 60, status: "PLANNED", reason: "Plan protezare" },
    { doctorEmail: "dr.stan@local.com", patientEmail: "ana.munteanu@mail.com", date: "2026-03-14", startHour: 9, startMinute: 0, durationMin: 30, status: "PLANNED", reason: "Control final" }
  ];

  for (const a of appointmentsSeed) {
    const doctor = doctorsByEmail.get(a.doctorEmail);
    const patient = patientsByEmail.get(a.patientEmail);

    if (!doctor || !patient) {
      throw new Error(`missing relation for appointment: ${a.doctorEmail} / ${a.patientEmail}`);
    }

    const startTime = atDateTime(a.date, a.startHour, a.startMinute);
    const endTime = addMinutes(startTime, a.durationMin);

    const exists = await prisma.appointment.findFirst({
      where: {
        doctorId: doctor.id,
        patientId: patient.id,
        startTime,
        endTime
      }
    });

    if (exists) {
      await prisma.appointment.update({
        where: { id: exists.id },
        data: {
          status: a.status,
          reason: a.reason
        }
      });
      console.log("Appointment updated:", a.doctorEmail, "->", a.patientEmail);
      continue;
    }

    await prisma.appointment.create({
      data: {
        doctorId: doctor.id,
        patientId: patient.id,
        startTime,
        endTime,
        status: a.status,
        reason: a.reason
      }
    });

    console.log("Appointment created:", a.doctorEmail, "->", a.patientEmail);
  }
}

async function main() {
  const doctorsByEmail = await seedDoctors();
  const patientsByEmail = await seedPatients();
  await seedAppointments(doctorsByEmail, patientsByEmail);

  console.log("Demo seed completed.");
}

main()
  .catch((error) => {
    console.error("Demo seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
