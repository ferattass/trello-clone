import prisma from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";
import { requireProjectMember } from "../utils/access.js";
import { emitBoardUpdate } from "../utils/realtime.js";

// Kullanıcı bilgilerinden sadece gerekli alanları çek
const userSelect = { select: { id: true, name: true, email: true } };

// Görevin yorumlarını listele
export const getComments = asyncHandler(async (req, res) => {
  const taskId = Number(req.params.taskId);

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    throw new HttpError(404, "Gorev bulunamadi");
  }
  await requireProjectMember(task.projectId, req.user.id);

  const comments = await prisma.comment.findMany({
    where: { taskId },
    include: { user: userSelect },
    orderBy: { createdAt: "asc" },
  });

  res.json({ comments });
});

// Göreve yeni yorum ekle
export const createComment = asyncHandler(async (req, res) => {
  const taskId = Number(req.params.taskId);

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    throw new HttpError(404, "Gorev bulunamadi");
  }
  await requireProjectMember(task.projectId, req.user.id);

  const { text } = req.body;

  const comment = await prisma.comment.create({
    data: {
      text,
      taskId,
      userId: req.user.id,
    },
    include: { user: userSelect },
  });

  emitBoardUpdate(req, task.projectId);
  res.status(201).json({ comment });
});

// Yorumu sil — sadece yazan kişi silebilir
export const deleteComment = asyncHandler(async (req, res) => {
  const commentId = Number(req.params.id);

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) {
    throw new HttpError(404, "Yorum bulunamadi");
  }

  if (comment.userId !== req.user.id) {
    throw new HttpError(403, "Sadece yazar silebilir");
  }

  await prisma.comment.delete({ where: { id: commentId } });

  res.json({ message: "Yorum silindi" });
});
