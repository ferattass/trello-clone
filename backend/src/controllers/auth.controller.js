import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";
import { signToken } from "../utils/jwt.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

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
