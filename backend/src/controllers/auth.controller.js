import crypto from "crypto";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";
import { signToken } from "../utils/jwt.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendVerificationMail, sendResetMail } from "../utils/mail.js";

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000; // 24 saat
const RESET_TTL_MS = 60 * 60 * 1000; // 1 saat

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  emailVerified: user.emailVerified,
});

// Rastgele, tahmin edilemez bir jeton uretir
function randomToken() {
  return crypto.randomBytes(32).toString("hex");
}

// Kullanici icin belirtilen turde dogrulama/sifirlama jetonu olusturur
async function createAuthToken(userId, type, ttlMs) {
  // Ayni kullanicinin ayni turdeki kullanilmamis eski jetonlarini gecersiz kil
  await prisma.authToken.deleteMany({ where: { userId, type, usedAt: null } });
  const token = randomToken();
  const expiresAt = new Date(Date.now() + ttlMs);
  await prisma.authToken.create({ data: { token, type, userId, expiresAt } });
  return token;
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: "Bu e-posta zaten kayitli" });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashed },
  });

  // Kayittan sonra dogrulama maili gonder (mail hatasi kaydi engellemesin)
  try {
    const token = await createAuthToken(user.id, "EMAIL_VERIFY", VERIFY_TTL_MS);
    await sendVerificationMail(user, token);
  } catch (err) {
    console.error("Dogrulama maili gonderilemedi:", err.message);
  }

  const token = signToken({ id: user.id, role: user.role });
  res.status(201).json({ user: publicUser(user), token });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: "E-posta veya sifre hatali" });
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(401).json({ message: "E-posta veya sifre hatali" });
  }

  const token = signToken({ id: user.id, role: user.role });
  res.json({ user: publicUser(user), token });
});

export const me = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) {
    return res.status(404).json({ message: "Kullanici bulunamadi" });
  }
  res.json({ user: publicUser(user) });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { name: req.body.name },
  });
  res.json({ user: publicUser(user) });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) {
    return res.status(404).json({ message: "Kullanici bulunamadi" });
  }

  // Once mevcut sifre dogru mu diye kontrol et
  const ok = await bcrypt.compare(currentPassword, user.password);
  if (!ok) {
    return res.status(401).json({ message: "Mevcut sifre hatali" });
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed },
  });

  res.json({ message: "Sifre guncellendi" });
});

// E-posta dogrulama: maildeki jeton ile hesabi aktif eder
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;

  const record = await prisma.authToken.findUnique({ where: { token } });
  if (
    !record ||
    record.type !== "EMAIL_VERIFY" ||
    record.usedAt ||
    record.expiresAt < new Date()
  ) {
    return res.status(400).json({ message: "Baglanti gecersiz veya suresi dolmus" });
  }

  // Ikisi tek transaction'da — biri basarisiz olursa jeton tekrar kullanilamaz
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { emailVerified: true } }),
    prisma.authToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);

  res.json({ message: "E-posta dogrulandi" });
});

// Dogrulama mailini tekrar gonder
export const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (user && !user.emailVerified) {
    try {
      const token = await createAuthToken(user.id, "EMAIL_VERIFY", VERIFY_TTL_MS);
      await sendVerificationMail(user, token);
    } catch (err) {
      console.error("Dogrulama maili gonderilemedi:", err.message);
    }
  }

  // Hesap olmasa/dogrulanmis olsa bile ayni yaniti don
  res.json({ message: "Dogrulama baglantisi gonderildi" });
});

// Sifremi unuttum: maile sifirlama baglantisi gonderir
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    try {
      const token = await createAuthToken(user.id, "PASSWORD_RESET", RESET_TTL_MS);
      await sendResetMail(user, token);
    } catch (err) {
      console.error("Sifirlama maili gonderilemedi:", err.message);
    }
  }

  // Guvenlik: e-posta kayitli olmasa bile ayni yaniti don
  res.json({ message: "Sifirlama baglantisi gonderildi" });
});

// Sifre sifirlama: maildeki jeton ile yeni sifre belirler
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  const record = await prisma.authToken.findUnique({ where: { token } });
  if (
    !record ||
    record.type !== "PASSWORD_RESET" ||
    record.usedAt ||
    record.expiresAt < new Date()
  ) {
    return res.status(400).json({ message: "Baglanti gecersiz veya suresi dolmus" });
  }

  const hashed = await bcrypt.hash(password, 10);
  // Ikisi tek transaction'da — biri basarisiz olursa jeton tekrar kullanilamaz
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { password: hashed } }),
    prisma.authToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);

  res.json({ message: "Sifre guncellendi" });
});
