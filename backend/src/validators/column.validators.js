import { z } from "zod";

export const createColumnSchema = z.object({
  name: z.string().min(1, "Sutun adi gerekli"),
});

export const updateColumnSchema = z.object({
  name: z.string().min(1, "Sutun adi gerekli"),
});

export const moveColumnSchema = z.object({
  position: z.number().int().min(0, "Pozisyon 0 veya daha buyuk olmali"),
});

export const reorderColumnSchema = z.object({
  taskIds: z.array(z.number().int()),
});
