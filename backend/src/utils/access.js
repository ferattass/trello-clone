import prisma from "../lib/prisma.js";
import { HttpError } from "./httpError.js";

// Kullanici projeye erisebilir mi? Iki yoldan erisim var:
//  1) Projenin dogrudan uyesi (ProjectMember)
//  2) Proje bir takima aitse, o takimin uyesi (TeamMember)
// Erisim varsa projeyi doner, yoksa hata firlatir.
export async function requireProjectMember(projectId, userId) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    throw new HttpError(404, "Proje bulunamadi");
  }

  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
  if (membership) {
    return project;
  }

  if (project.teamId) {
    const teamMember = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: project.teamId, userId } },
    });
    if (teamMember) {
      return project;
    }
  }

  throw new HttpError(403, "Bu projeye erisim yetkiniz yok");
}
