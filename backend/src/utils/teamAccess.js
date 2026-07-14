import prisma from "../lib/prisma.js";
import { HttpError } from "./httpError.js";

// Kullanici takimin uyesi mi? Degilse hata firlatir, uyeyse uyelik kaydini (rol dahil) doner.
export async function requireTeamMember(teamId, userId) {
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) {
    throw new HttpError(404, "Takim bulunamadi");
  }

  const membership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } },
  });
  if (!membership) {
    throw new HttpError(403, "Bu takima erisim yetkiniz yok");
  }

  return membership;
}

// Uyeligi dogrula, ardindan rolun izin verilenler arasinda olup olmadigina bak.
export async function requireTeamRole(teamId, userId, roles) {
  const membership = await requireTeamMember(teamId, userId);
  if (!roles.includes(membership.role)) {
    throw new HttpError(403, "Bu islem icin yetkiniz yok");
  }
  return membership;
}
