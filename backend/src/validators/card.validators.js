import { z } from "zod";

// Etiket oluştururken kullanılır
export const createLabelSchema = z.object({
  name: z.string().min(1, "Etiket adi bos olamaz"),
  color: z.string().min(1, "Renk bos olamaz"),
});

// Etiket güncellemede alanlar isteğe bağlı
export const updateLabelSchema = z.object({
  name: z.string().min(1, "Etiket adi bos olamaz").optional(),
  color: z.string().min(1, "Renk bos olamaz").optional(),
});

// Göreve etiket eklerken sadece labelId yeterli
export const attachLabelSchema = z.object({
  labelId: z.number().int(),
});

// Yorum oluştururken text zorunlu
export const createCommentSchema = z.object({
  text: z.string().min(1, "Yorum bos olamaz"),
});

// Checklist maddesi oluştururken text zorunlu
export const createChecklistSchema = z.object({
  text: z.string().min(1, "Madde metni bos olamaz"),
});

// Checklist maddesi güncellemede her şey isteğe bağlı
export const updateChecklistSchema = z.object({
  text: z.string().min(1, "Madde metni bos olamaz").optional(),
  done: z.boolean().optional(),
});
