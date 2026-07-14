import prisma from "../lib/prisma.js";

// Belirtilen kullanıcıya bildirim oluşturur. link opsiyonel.
export async function notify(userId, text, link = null) {
  return prisma.notification.create({ data: { userId, text, link } });
}
