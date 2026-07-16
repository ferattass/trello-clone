import prisma from "../lib/prisma.js";
import bcrypt from "bcryptjs";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";
import { notify } from "../utils/notify.js";
import { sendTestMail } from "../utils/mail.js";

// Mail ayari satiri yoksa kullanilacak varsayilanlar
const MAIL_SETTING_DEFAULT = {
  enabled: false,
  host: "",
  port: 587,
  secure: false,
  username: "",
  password: "",
  fromName: "Flowboard",
  fromEmail: "no-reply@flowboard.local",
};

// Parolayi disari sizdirmadan ayarlari donusturur (parola yerine var/yok bilgisi)
const publicMailSetting = (setting) => {
  const { password, ...rest } = setting;
  return { ...rest, hasPassword: Boolean(password) };
};

// Genel istatistikleri döner: kullanıcı, takım, proje, görev sayıları.
export const getStats = asyncHandler(async (req, res) => {
  const [users, teams, projects, tasks] = await Promise.all([
    prisma.user.count(),
    prisma.team.count(),
    prisma.project.count(),
    prisma.task.count(),
  ]);
  res.json({ stats: { users, teams, projects, tasks } });
});

// Tüm kullanıcıları listeler; her birinin proje ve takım üyelik sayısını da getirir.
export const getUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          ownedProjects: true,
          teamMemberships: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json({ users });
});

// Tüm takımları, sahibi ve üye/proje sayısıyla birlikte listeler.
export const getTeams = asyncHandler(async (req, res) => {
  const teams = await prisma.team.findMany({
    include: {
      owner: { select: { id: true, name: true } },
      _count: { select: { members: true, projects: true } },
    },
  });
  res.json({ teams });
});

// Tüm projeleri, sahibi ve bağlı takımıyla birlikte listeler.
export const getProjects = asyncHandler(async (req, res) => {
  const projects = await prisma.project.findMany({
    include: {
      owner: { select: { id: true, name: true } },
      team: { select: { id: true, name: true } },
    },
  });
  res.json({ projects });
});

// Yeni bir kullanıcı hesabı oluşturur; isteğe bağlı olarak bir takım da açar.
export const createAccount = asyncHandler(async (req, res) => {
  const { name, email, password, role, teamName } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new HttpError(409, "Bu e-posta zaten kayitli");

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, role: role ?? "USER" },
  });

  let team = null;
  if (teamName) {
    // Takım oluşturulurken sahibi otomatik olarak OWNER rolüyle üye yapılır.
    team = await prisma.team.create({
      data: {
        name: teamName,
        ownerId: user.id,
        members: {
          create: { userId: user.id, role: "OWNER" },
        },
      },
    });
  }

  // Yeni kullanıcıya hoşgeldin bildirimi gönder.
  await notify(user.id, "Hesabiniz olusturuldu");

  const response = {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
  if (team) response.team = { id: team.id, name: team.name };

  res.status(201).json(response);
});

// Mevcut mail (SMTP) ayarlarini doner. Satir yoksa varsayilanla olusturur.
export const getMailSettings = asyncHandler(async (req, res) => {
  // upsert: eszamanli iki istekte unique-constraint yarisini onler
  const setting = await prisma.mailSetting.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, ...MAIL_SETTING_DEFAULT },
  });
  res.json({ settings: publicMailSetting(setting) });
});

// Mail ayarlarini gunceller. Parola sadece yeni bir deger girildiyse degisir.
export const updateMailSettings = asyncHandler(async (req, res) => {
  const { enabled, host, port, secure, username, password, fromName, fromEmail } =
    req.body;

  const data = { enabled, host, port, secure, username, fromName, fromEmail };
  if (typeof password === "string" && password.length > 0) {
    data.password = password;
  }

  const setting = await prisma.mailSetting.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, ...MAIL_SETTING_DEFAULT, ...data },
  });

  res.json({ settings: publicMailSetting(setting) });
});

// Kayitli ayarlarla bir test maili gonderir.
export const testMail = asyncHandler(async (req, res) => {
  try {
    const mode = await sendTestMail(req.body.to);
    const message =
      mode === "smtp"
        ? "Test maili SMTP uzerinden gonderildi."
        : "SMTP kapali oldugu icin test maili backend konsoluna yazildi.";
    res.json({ message, mode });
  } catch (err) {
    console.error("Test maili gonderilemedi:", err.message);
    throw new HttpError(400, "Mail gonderilemedi. SMTP ayarlarini kontrol edin.");
  }
});
