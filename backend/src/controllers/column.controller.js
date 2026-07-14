import prisma from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";
import { requireProjectMember } from "../utils/access.js";

// Sutunu bul + kullanicinin o projeye yetkisini dogrula
async function getColumnWithAccess(columnId, userId) {
  const column = await prisma.column.findUnique({ where: { id: columnId } });
  if (!column) {
    throw new HttpError(404, "Sutun bulunamadi");
  }
  await requireProjectMember(column.projectId, userId);
  return column;
}

export const getColumns = asyncHandler(async (req, res) => {
  const projectId = Number(req.params.id);
  await requireProjectMember(projectId, req.user.id);

  const columns = await prisma.column.findMany({
    where: { projectId },
    orderBy: { position: "asc" },
  });
  res.json({ columns });
});

// Yeni sutunu en sona ekle
export const createColumn = asyncHandler(async (req, res) => {
  const projectId = Number(req.params.id);
  await requireProjectMember(projectId, req.user.id);

  const count = await prisma.column.count({ where: { projectId } });
  const column = await prisma.column.create({
    data: { name: req.body.name, projectId, position: count },
  });
  res.status(201).json({ column });
});

export const updateColumn = asyncHandler(async (req, res) => {
  const columnId = Number(req.params.id);
  await getColumnWithAccess(columnId, req.user.id);

  const column = await prisma.column.update({
    where: { id: columnId },
    data: { name: req.body.name },
  });
  res.json({ column });
});

export const moveColumn = asyncHandler(async (req, res) => {
  const columnId = Number(req.params.id);
  await getColumnWithAccess(columnId, req.user.id);

  const column = await prisma.column.update({
    where: { id: columnId },
    data: { position: req.body.position },
  });
  res.json({ column });
});

export const deleteColumn = asyncHandler(async (req, res) => {
  const columnId = Number(req.params.id);
  await getColumnWithAccess(columnId, req.user.id);

  await prisma.column.delete({ where: { id: columnId } });
  res.json({ message: "Sutun silindi" });
});

// Surukle-birak sonrasi: gorevleri verilen sirayla bu sutuna yerlestir.
// Gonderilen sirdaki her gorevin columnId'si bu sutun, position'i index olur.
export const reorderColumn = asyncHandler(async (req, res) => {
  const columnId = Number(req.params.id);
  const column = await getColumnWithAccess(columnId, req.user.id);
  const { taskIds } = req.body;

  // Guvenlik: bu gorevlerin hepsi gercekten ayni projeye mi ait?
  const owned = await prisma.task.findMany({
    where: { id: { in: taskIds }, projectId: column.projectId },
    select: { id: true },
  });
  if (owned.length !== taskIds.length) {
    throw new HttpError(400, "Gecersiz gorev listesi");
  }

  // Tek islemde (transaction) hepsini guncelle: ya hepsi olur ya hicbiri
  await prisma.$transaction(
    taskIds.map((taskId, index) =>
      prisma.task.update({
        where: { id: taskId },
        data: { columnId, position: index },
      })
    )
  );

  res.json({ message: "Siralama guncellendi" });
});
