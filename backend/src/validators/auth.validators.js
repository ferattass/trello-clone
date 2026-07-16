import { z } from "zod";

// E-posta her yerde ayni sekilde ele alinsin: bosluklari at, kucuk harfe cevir
const email = z
  .string()
  .trim()
  .toLowerCase()
  .email("Gecerli bir e-posta girin");

// En az 8 karakter, en az bir harf ve bir rakam
const strongPassword = z
  .string()
  .min(8, "Sifre en az 8 karakter olmali")
  .regex(/[A-Za-z]/, "Sifre en az bir harf icermeli")
  .regex(/[0-9]/, "Sifre en az bir rakam icermeli");

const name = z
  .string()
  .trim()
  .min(2, "Isim en az 2 karakter olmali")
  .max(60, "Isim cok uzun");

export const registerSchema = z.object({
  name,
  email,
  password: strongPassword,
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Sifre gerekli"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Mevcut sifre gerekli"),
  newPassword: strongPassword,
});

export const updateProfileSchema = z.object({
  name,
});

export const forgotPasswordSchema = z.object({
  email,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Gecersiz baglanti"),
  password: strongPassword,
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Gecersiz baglanti"),
});

export const resendVerificationSchema = z.object({
  email,
});
