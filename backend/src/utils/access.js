import prisma from "../lib/prisma.js";
import { HttpError } from "./httpError.js";

// Kullanici projenin uyesi mi? Degilse hata firlatir, uyeyse projeyi doner.
export async function requireProjectMember(projectId, userId) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    throw new HttpError(404, "Proje bulunamadi");
  }

  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
  if (!membership) {
    throw new HttpError(403, "Bu projeye erisim yetkiniz yok");
  }

  return project;
}
