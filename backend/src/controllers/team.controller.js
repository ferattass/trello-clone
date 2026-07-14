import prisma from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";
import { requireTeamMember, requireTeamRole } from "../utils/teamAccess.js";

// Yeni takim olustur: kurucu ayni anda OWNER olarak uye yapilir
export const createTeam = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const team = await prisma.team.create({
    data: {
      name,
      description,
      ownerId: req.user.id,
      members: { create: { userId: req.user.id, role: "OWNER" } },
    },
    include: { members: true },
  });

  res.status(201).json({ team });
});

// Kullanicinin uyesi oldugu takimlar (uye ve proje sayilariyla birlikte)
export const getMyTeams = asyncHandler(async (req, res) => {
  const teams = await prisma.team.findMany({
    where: { members: { some: { userId: req.user.id } } },
    include: {
      _count: { select: { members: true, projects: true } },
      owner: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json({ teams });
});

// Tek takimin detayi: uyeler + projeler
export const getTeam = asyncHandler(async (req, res) => {
  const teamId = Number(req.params.id);
  await requireTeamMember(teamId, req.user.id);

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
      },
      projects: { select: { id: true, name: true, description: true } },
    },
  });

  res.json({ team });
});

// Takim bilgilerini guncelle (sahip veya yonetici)
export const updateTeam = asyncHandler(async (req, res) => {
  const teamId = Number(req.params.id);
  await requireTeamRole(teamId, req.user.id, ["OWNER", "ADMIN"]);

  const { name, description } = req.body;
  const team = await prisma.team.update({
    where: { id: teamId },
    data: { name, description },
  });
  res.json({ team });
});

// Takimi sil (sadece sahip)
export const deleteTeam = asyncHandler(async (req, res) => {
  const teamId = Number(req.params.id);
  await requireTeamRole(teamId, req.user.id, ["OWNER"]);

  await prisma.team.delete({ where: { id: teamId } });
  res.json({ message: "Takim silindi" });
});

// Takima e-posta ile uye davet et + davet edilene bildirim gonder
export const inviteMember = asyncHandler(async (req, res) => {
  const teamId = Number(req.params.id);
  await requireTeamRole(teamId, req.user.id, ["OWNER", "ADMIN"]);

  const { email, role } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new HttpError(404, "Bu e-postali kullanici bulunamadi");
  }

  const existing = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: user.id } },
  });
  if (existing) {
    throw new HttpError(409, "Kullanici zaten uye");
  }

  const team = await prisma.team.findUnique({ where: { id: teamId } });

  await prisma.teamMember.create({
    data: { teamId, userId: user.id, role: role ?? "MEMBER" },
  });

  await prisma.notification.create({
    data: {
      userId: user.id,
      text: `${team.name} takimina eklendiniz`,
      link: "/takimlar/" + teamId,
    },
  });

  res.status(201).json({ message: "Uye eklendi" });
});

// Bir uyenin rolunu degistir (sadece sahip). Sahibin rolu degistirilemez.
export const updateMemberRole = asyncHandler(async (req, res) => {
  const teamId = Number(req.params.id);
  const targetUserId = Number(req.params.userId);
  await requireTeamRole(teamId, req.user.id, ["OWNER"]);

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (team.ownerId === targetUserId) {
    throw new HttpError(400, "Sahibin rolu degistirilemez");
  }

  const membership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: targetUserId } },
  });
  if (!membership) {
    throw new HttpError(404, "Uye bulunamadi");
  }

  await prisma.teamMember.update({
    where: { teamId_userId: { teamId, userId: targetUserId } },
    data: { role: req.body.role },
  });

  res.json({ message: "Uye rolu guncellendi" });
});

// Uyeyi takimdan cikar (sahip veya yonetici). Takim sahibi cikarilamaz.
export const removeMember = asyncHandler(async (req, res) => {
  const teamId = Number(req.params.id);
  const targetUserId = Number(req.params.userId);
  await requireTeamRole(teamId, req.user.id, ["OWNER", "ADMIN"]);

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (team.ownerId === targetUserId) {
    throw new HttpError(400, "Takim sahibi cikarilamaz");
  }

  const membership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: targetUserId } },
  });
  if (!membership) {
    throw new HttpError(404, "Uye bulunamadi");
  }

  await prisma.teamMember.delete({
    where: { teamId_userId: { teamId, userId: targetUserId } },
  });

  res.json({ message: "Uye cikarildi" });
});

// Kullanici kendi istegiyle takimdan ayrilir. Sahip ayrilamaz.
export const leaveTeam = asyncHandler(async (req, res) => {
  const teamId = Number(req.params.id);
  await requireTeamMember(teamId, req.user.id);

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (team.ownerId === req.user.id) {
    throw new HttpError(400, "Sahip takimdan ayrilamaz, once takimi silin veya devredin");
  }

  await prisma.teamMember.delete({
    where: { teamId_userId: { teamId, userId: req.user.id } },
  });

  res.json({ message: "Takimdan ayrildiniz" });
});
