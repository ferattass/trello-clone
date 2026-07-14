import prisma from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";
import { requireProjectMember } from "../utils/access.js";
import { emitBoardUpdate } from "../utils/realtime.js";

// Projedeki tüm etiketleri getir
export const getProjectLabels = asyncHandler(async (req, res) => {
  const projectId = Number(req.params.projectId);
  await requireProjectMember(projectId, req.user.id);

  const labels = await prisma.label.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
  });

  res.json({ labels });
});

// Projeye yeni etiket oluştur
export const createLabel = asyncHandler(async (req, res) => {
  const projectId = Number(req.params.projectId);
  await requireProjectMember(projectId, req.user.id);

  const { name, color } = req.body;

  const label = await prisma.label.create({
    data: { name, color, projectId },
  });

  emitBoardUpdate(req, projectId);
  res.status(201).json({ label });
});

// Etiketi güncelle
export const updateLabel = asyncHandler(async (req, res) => {
  const labelId = Number(req.params.id);

  const label = await prisma.label.findUnique({ where: { id: labelId } });
  if (!label) {
    throw new HttpError(404, "Etiket bulunamadi");
  }

  await requireProjectMember(label.projectId, req.user.id);

  const { name, color } = req.body;

  const updated = await prisma.label.update({
    where: { id: labelId },
    data: { name, color },
  });

  emitBoardUpdate(req, label.projectId);
  res.json({ label: updated });
});

// Etiketi sil — bağlı TaskLabel kayıtları cascade ile gider
export const deleteLabel = asyncHandler(async (req, res) => {
  const labelId = Number(req.params.id);

  const label = await prisma.label.findUnique({ where: { id: labelId } });
  if (!label) {
    throw new HttpError(404, "Etiket bulunamadi");
  }

  await requireProjectMember(label.projectId, req.user.id);

  await prisma.label.delete({ where: { id: labelId } });

  emitBoardUpdate(req, label.projectId);
  res.json({ message: "Etiket silindi" });
});

// Göreve etiket ekle
export const attachLabel = asyncHandler(async (req, res) => {
  const taskId = Number(req.params.taskId);
  const { labelId } = req.body;

  // Görev ve proje erişim kontrolü
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    throw new HttpError(404, "Gorev bulunamadi");
  }
  await requireProjectMember(task.projectId, req.user.id);

  // Etiketin aynı projeye ait olup olmadığını kontrol et
  const label = await prisma.label.findUnique({ where: { id: labelId } });
  if (!label) {
    throw new HttpError(404, "Etiket bulunamadi");
  }
  if (label.projectId !== task.projectId) {
    throw new HttpError(400, "Etiket bu projeye ait degil");
  }

  // Daha önce eklenmiş mi?
  const existing = await prisma.taskLabel.findUnique({
    where: { taskId_labelId: { taskId, labelId } },
  });
  if (existing) {
    throw new HttpError(409, "Etiket zaten ekli");
  }

  await prisma.taskLabel.create({
    data: { taskId, labelId },
  });

  emitBoardUpdate(req, task.projectId);
  res.status(201).json({ message: "Etiket eklendi" });
});

// Görevden etiket kaldır
export const detachLabel = asyncHandler(async (req, res) => {
  const taskId = Number(req.params.taskId);
  const labelId = Number(req.params.labelId);

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    throw new HttpError(404, "Gorev bulunamadi");
  }
  await requireProjectMember(task.projectId, req.user.id);

  await prisma.taskLabel.deleteMany({
    where: { taskId, labelId },
  });

  emitBoardUpdate(req, task.projectId);
  res.json({ message: "Etiket kaldirildi" });
});
