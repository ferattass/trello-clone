import { z } from "zod";

// Admin panelinden yeni hesap oluştururken gelen veriyi doğrular.
export const createAccountSchema = z.object({
  name: z.string().min(2, "Ad en az 2 karakter olmali"),
  email: z.string().email("Gecerli bir e-posta girin"),
  password: z.string().min(6, "Sifre en az 6 karakter olmali"),
  role: z.enum(["ADMIN", "USER"]).optional(),
  teamName: z.string().optional(),
});
