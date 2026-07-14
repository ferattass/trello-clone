import { z } from "zod";

export const createTeamSchema = z.object({
  name: z.string().min(1, "Takim adi gerekli"),
  description: z.string().optional(),
});

export const updateTeamSchema = z.object({
  name: z.string().min(1, "Takim adi bos olamaz").optional(),
  description: z.string().optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email("Gecerli e-posta girin"),
  role: z.enum(["ADMIN", "MEMBER"]).optional(),
});

export const updateRoleSchema = z.object({
  role: z.enum(["ADMIN", "MEMBER"]),
});
