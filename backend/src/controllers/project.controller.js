import prisma from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";
import { requireProjectMember } from "../utils/access.js";
import { requireTeamMember } from "../utils/teamAccess.js";
import { logActivity } from "../utils/activityLog.js";

const DEFAULT_COLUMNS = ["To Do", "Doing", "Done"];

// Yeni proje olustur: sahibini uye yap + varsayilan sutunlari ac.
// teamId verilirse pano o takima ait olur (kullanici o takimin uyesi olmali).
export const createProject = asyncHandler(async (req, res) => {
  const { name, description, teamId } = req.body;
  const userId = req.user.id;

  if (teamId) {
    await requireTeamMember(teamId, userId);
  }

  const project = await prisma.project.create({
    data: {
      name,
      description,
      ownerId: userId,
      teamId: teamId ?? null,
      members: { create: { userId } },
      columns: {
        create: DEFAULT_COLUMNS.map((columnName, index) => ({
          name: columnName,
          position: index,
        })),
      },
    },
    include: { columns: { orderBy: { position: "asc" } } },
  });

  await logActivity(project.id, userId, `"${name}" panosunu olusturdu`);
  res.status(201).json({ project });
});

// Kullanicinin erisebildigi projeler: dogrudan uye oldugu VEYA takimi uzerinden
export const getProjects = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { members: { some: { userId } } },
        { team: { members: { some: { userId } } } },
      ],
    },
    include: { team: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json({ projects });
});

// Tek projenin tum panosu: sutunlar + gorevler + uyeler
export const getProject = asyncHandler(async (req, res) => {
  const projectId = Number(req.params.id);
  await requireProjectMember(projectId, req.user.id);

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      columns: {
        orderBy: { position: "asc" },
        include: {
          tasks: {
            orderBy: { position: "asc" },
            include: {
              assignee: { select: { id: true, name: true, email: true } },
              labels: { include: { label: true } },
              _count: { select: { comments: true, checklist: true } },
            },
          },
        },
      },
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
      team: {
        select: {
          id: true,
          name: true,
          members: {
            include: { user: { select: { id: true, name: true, email: true } } },
          },
        },
      },
      labels: true,
    },
  });

  res.json({ project });
});

export const updateProject = asyncHandler(async (req, res) => {
  const projectId = Number(req.params.id);
  const existing = await requireProjectMember(projectId, req.user.id);

  if (existing.ownerId !== req.user.id) {
    throw new HttpError(403, "Sadece proje sahibi duzenleyebilir");
  }

  const { name, description } = req.body;
  const project = await prisma.project.update({
    where: { id: projectId },
    data: { name, description },
  });
  res.json({ project });
});

// Sadece proje sahibi silebilir
export const deleteProject = asyncHandler(async (req, res) => {
  const projectId = Number(req.params.id);
  const project = await requireProjectMember(projectId, req.user.id);

  if (project.ownerId !== req.user.id) {
    throw new HttpError(403, "Sadece proje sahibi silebilir");
  }

  await prisma.project.delete({ where: { id: projectId } });
  res.json({ message: "Proje silindi" });
});

// Projeye e-posta ile uye ekle
export const addMember = asyncHandler(async (req, res) => {
  const projectId = Number(req.params.id);
  const project = await requireProjectMember(projectId, req.user.id);

  if (project.ownerId !== req.user.id) {
    throw new HttpError(403, "Sadece proje sahibi uye ekleyebilir");
  }

  const user = await prisma.user.findUnique({
    where: { email: req.body.email },
  });
  if (!user) {
    throw new HttpError(404, "Bu e-postali kullanici bulunamadi");
  }

  const existing = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: user.id } },
  });
  if (existing) {
    throw new HttpError(409, "Kullanici zaten uye");
  }

  await prisma.projectMember.create({
    data: { projectId, userId: user.id },
  });
  res.status(201).json({ message: "Uye eklendi" });
});
