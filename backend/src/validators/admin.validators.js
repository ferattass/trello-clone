import { z } from "zod";

// Admin panelinden yeni hesap oluştururken gelen veriyi doğrular.
export const createAccountSchema = z.object({
  name: z.string().min(2, "Ad en az 2 karakter olmali"),
  email: z.string().email("Gecerli bir e-posta girin"),
  password: z.string().min(6, "Sifre en az 6 karakter olmali"),
  role: z.enum(["ADMIN", "USER"]).optional(),
  teamName: z.string().optional(),
});

// Mail (SMTP) ayarlarini dogrular. Parola bos gelebilir (mevcut korunur).
export const mailSettingsSchema = z.object({
  enabled: z.boolean(),
  host: z.string().trim().max(255),
  port: z.coerce.number().int().min(1).max(65535),
  secure: z.boolean(),
  username: z.string().trim().max(255),
  password: z.string().max(255).optional().default(""),
  fromName: z.string().trim().min(1, "Gonderen adi gerekli").max(120),
  fromEmail: z.string().trim().email("Gecerli bir gonderen e-postasi girin"),
});

// Test maili icin alici adresi
export const testMailSchema = z.object({
  to: z.string().trim().toLowerCase().email("Gecerli bir e-posta girin"),
});
