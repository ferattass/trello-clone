import prisma from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";
import { requireProjectMember } from "../utils/access.js";
import { emitBoardUpdate } from "../utils/realtime.js";

// Görevin checklist maddelerini sıraya göre getir
export const getChecklist = asyncHandler(async (req, res) => {
  const taskId = Number(req.params.taskId);

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    throw new HttpError(404, "Gorev bulunamadi");
  }
  await requireProjectMember(task.projectId, req.user.id);

  const items = await prisma.checklistItem.findMany({
    where: { taskId },
    orderBy: { position: "asc" },
  });

  res.json({ items });
});

// Göreve checklist maddesi ekle
export const createItem = asyncHandler(async (req, res) => {
  const taskId = Number(req.params.taskId);

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    throw new HttpError(404, "Gorev bulunamadi");
  }
  await requireProjectMember(task.projectId, req.user.id);

  const { text } = req.body;

  // Yeni maddeyi listenin sonuna ekle
  const count = await prisma.checklistItem.count({ where: { taskId } });

  const item = await prisma.checklistItem.create({
    data: {
      text,
      taskId,
      position: count,
    },
  });

  emitBoardUpdate(req, task.projectId);
  res.status(201).json({ item });
});

// Checklist maddesini güncelle (metin veya tamamlandı durumu)
export const updateItem = asyncHandler(async (req, res) => {
  const itemId = Number(req.params.id);

  const item = await prisma.checklistItem.findUnique({ where: { id: itemId } });
  if (!item) {
    throw new HttpError(404, "Madde bulunamadi");
  }

  // Maddenin ait olduğu görev üzerinden proje erişimi kontrol et
  const task = await prisma.task.findUnique({ where: { id: item.taskId } });
  if (!task) {
    throw new HttpError(404, "Gorev bulunamadi");
  }
  await requireProjectMember(task.projectId, req.user.id);

  const { text, done } = req.body;

  const updated = await prisma.checklistItem.update({
    where: { id: itemId },
    data: { text, done },
  });

  emitBoardUpdate(req, task.projectId);
  res.json({ item: updated });
});

// Checklist maddesini sil
export const deleteItem = asyncHandler(async (req, res) => {
  const itemId = Number(req.params.id);

  const item = await prisma.checklistItem.findUnique({ where: { id: itemId } });
  if (!item) {
    throw new HttpError(404, "Madde bulunamadi");
  }

  const task = await prisma.task.findUnique({ where: { id: item.taskId } });
  if (!task) {
    throw new HttpError(404, "Gorev bulunamadi");
  }
  await requireProjectMember(task.projectId, req.user.id);

  await prisma.checklistItem.delete({ where: { id: itemId } });

  emitBoardUpdate(req, task.projectId);
  res.json({ message: "Madde silindi" });
});
