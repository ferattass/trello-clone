import prisma from "../lib/prisma.js";

// Projede gerçekleşen işlemleri aktivite tablosuna kaydeder.
export async function logActivity(projectId, userId, action, taskId = null) {
  return prisma.activity.create({ data: { projectId, userId, action, taskId } });
}
