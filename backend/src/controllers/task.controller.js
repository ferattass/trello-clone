import prisma from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";
import { requireProjectMember } from "../utils/access.js";
import { emitBoardUpdate } from "../utils/realtime.js";
import { logActivity } from "../utils/activityLog.js";
import { notify } from "../utils/notify.js";

const assigneeSelect = { assignee: { select: { id: true, name: true, email: true } } };

// Gorevi bul + kullanicinin o projeye yetkisini dogrula
async function getTaskWithAccess(taskId, userId) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    throw new HttpError(404, "Gorev bulunamadi");
  }
  await requireProjectMember(task.projectId, userId);
  return task;
}

// Atanan kisi projeye erisebiliyor mu? (dogrudan uye ya da takim uyesi)
async function assertAssigneeIsMember(projectId, assigneeId) {
  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: assigneeId } },
  });
  if (membership) return;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { teamId: true },
  });
  if (project?.teamId) {
    const teamMember = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: project.teamId, userId: assigneeId } },
    });
    if (teamMember) return;
  }

  throw new HttpError(400, "Atanan kisi projenin uyesi degil");
}

export const getTasks = asyncHandler(async (req, res) => {
  const projectId = Number(req.params.id);
  await requireProjectMember(projectId, req.user.id);

  const tasks = await prisma.task.findMany({
    where: { projectId },
    orderBy: [{ columnId: "asc" }, { position: "asc" }],
  });
  res.json({ tasks });
});

// Bir sutuna gorev ekle (en sona)
export const createTask = asyncHandler(async (req, res) => {
  const columnId = Number(req.params.id);
  const column = await prisma.column.findUnique({ where: { id: columnId } });
  if (!column) {
    throw new HttpError(404, "Sutun bulunamadi");
  }
  await requireProjectMember(column.projectId, req.user.id);

  const { title, description, assigneeId, priority, dueDate } = req.body;
  if (assigneeId) {
    await assertAssigneeIsMember(column.projectId, assigneeId);
  }

  const count = await prisma.task.count({ where: { columnId } });
  const task = await prisma.task.create({
    data: {
      title,
      description,
      priority,
      dueDate,
      assigneeId: assigneeId ?? null,
      columnId,
      projectId: column.projectId,
      position: count,
    },
    include: assigneeSelect,
  });

  await logActivity(column.projectId, req.user.id, `"${title}" gorevini olusturdu`, task.id);
  if (assigneeId && assigneeId !== req.user.id) {
    await notify(assigneeId, `Size bir gorev atandi: ${title}`, `/projects/${column.projectId}`, { sendEmail: true });
  }

  emitBoardUpdate(req, column.projectId);
  res.status(201).json({ task });
});

export const updateTask = asyncHandler(async (req, res) => {
  const taskId = Number(req.params.id);
  const task = await getTaskWithAccess(taskId, req.user.id);

  const { title, description, assigneeId, priority, dueDate } = req.body;
  if (assigneeId) {
    await assertAssigneeIsMember(task.projectId, assigneeId);
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: { title, description, assigneeId, priority, dueDate },
    include: assigneeSelect,
  });

  // Yeni biri atandiysa ona bildirim gonder
  if (assigneeId && assigneeId !== task.assigneeId && assigneeId !== req.user.id) {
    await notify(assigneeId, `Size bir gorev atandi: ${updated.title}`, `/projects/${task.projectId}`, { sendEmail: true });
  }

  emitBoardUpdate(req, task.projectId);
  res.json({ task: updated });
});

// Surukle-birak: gorevi baska sutuna/pozisyona tasi
export const moveTask = asyncHandler(async (req, res) => {
  const taskId = Number(req.params.id);
  const task = await getTaskWithAccess(taskId, req.user.id);

  const { columnId, position } = req.body;
  const targetColumn = await prisma.column.findUnique({
    where: { id: columnId },
  });
  if (!targetColumn || targetColumn.projectId !== task.projectId) {
    throw new HttpError(400, "Gecersiz hedef sutun");
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: { columnId, position },
  });

  emitBoardUpdate(req, task.projectId);
  res.json({ task: updated });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const taskId = Number(req.params.id);
  const task = await getTaskWithAccess(taskId, req.user.id);

  await prisma.task.delete({ where: { id: taskId } });

  await logActivity(task.projectId, req.user.id, `"${task.title}" gorevini sildi`);
  emitBoardUpdate(req, task.projectId);
  res.json({ message: "Gorev silindi" });
});
