import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1, "Baslik gerekli"),
  description: z.string().optional(),
  assigneeId: z.number().int().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, "Baslik bos olamaz").optional(),
  description: z.string().optional(),
  assigneeId: z.number().int().nullable().optional(),
});

export const moveTaskSchema = z.object({
  columnId: z.number().int(),
  position: z.number().int().min(0, "Pozisyon 0 veya daha buyuk olmali"),
});
