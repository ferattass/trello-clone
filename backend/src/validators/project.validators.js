import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1, "Proje adi gerekli"),
  description: z.string().optional(),
  teamId: z.number().int().optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1, "Proje adi bos olamaz").optional(),
  description: z.string().optional(),
});

export const addMemberSchema = z.object({
  email: z.string().email("Gecerli bir e-posta girin"),
});
