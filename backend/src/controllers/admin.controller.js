import prisma from "../lib/prisma.js";
import bcrypt from "bcryptjs";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";
import { notify } from "../utils/notify.js";

// Genel istatistikleri döner: kullanıcı, takım, proje, görev sayıları.
export const getStats = asyncHandler(async (req, res) => {
  const [users, teams, projects, tasks] = await Promise.all([
    prisma.user.count(),
    prisma.team.count(),
    prisma.project.count(),
    prisma.task.count(),
  ]);
  res.json({ stats: { users, teams, projects, tasks } });
});

// Tüm kullanıcıları listeler; her birinin proje ve takım üyelik sayısını da getirir.
export const getUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          ownedProjects: true,
          teamMemberships: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json({ users });
});

// Tüm takımları, sahibi ve üye/proje sayısıyla birlikte listeler.
export const getTeams = asyncHandler(async (req, res) => {
  const teams = await prisma.team.findMany({
    include: {
      owner: { select: { id: true, name: true } },
      _count: { select: { members: true, projects: true } },
    },
  });
  res.json({ teams });
});

// Tüm projeleri, sahibi ve bağlı takımıyla birlikte listeler.
export const getProjects = asyncHandler(async (req, res) => {
  const projects = await prisma.project.findMany({
    include: {
      owner: { select: { id: true, name: true } },
      team: { select: { id: true, name: true } },
    },
  });
  res.json({ projects });
});

// Yeni bir kullanıcı hesabı oluşturur; isteğe bağlı olarak bir takım da açar.
export const createAccount = asyncHandler(async (req, res) => {
  const { name, email, password, role, teamName } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new HttpError(409, "Bu e-posta zaten kayitli");

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, role: role ?? "USER" },
  });

  let team = null;
  if (teamName) {
    // Takım oluşturulurken sahibi otomatik olarak OWNER rolüyle üye yapılır.
    team = await prisma.team.create({
      data: {
        name: teamName,
        ownerId: user.id,
        members: {
          create: { userId: user.id, role: "OWNER" },
        },
      },
    });
  }

  // Yeni kullanıcıya hoşgeldin bildirimi gönder.
  await notify(user.id, "Hesabiniz olusturuldu");

  const response = {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
  if (team) response.team = { id: team.id, name: team.name };

  res.status(201).json(response);
});
