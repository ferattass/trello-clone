import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Isim en az 2 karakter olmali"),
  email: z.string().email("Gecerli bir e-posta girin"),
  password: z.string().min(6, "Sifre en az 6 karakter olmali"),
});

export const loginSchema = z.object({
  email: z.string().email("Gecerli bir e-posta girin"),
  password: z.string().min(1, "Sifre gerekli"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Mevcut sifre gerekli"),
  newPassword: z.string().min(6, "Yeni sifre en az 6 karakter olmali"),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Isim en az 2 karakter olmali"),
});
