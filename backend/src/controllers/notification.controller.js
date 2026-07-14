import prisma from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";

// Giriş yapan kullanıcının son 50 bildirimini döner.
export const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  res.json({ notifications });
});

// Kullanıcının okunmamış bildirim sayısını döner.
export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await prisma.notification.count({
    where: { userId: req.user.id, read: false },
  });
  res.json({ count });
});

// Belirli bir bildirimi okundu olarak işaretler.
export const markRead = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification) throw new HttpError(404, "Bildirim bulunamadi");
  if (notification.userId !== req.user.id) {
    throw new HttpError(403, "Bu bildirimi okuma yetkiniz yok");
  }

  const updated = await prisma.notification.update({
    where: { id },
    data: { read: true },
  });
  res.json({ notification: updated });
});

// Kullanıcının tüm okunmamış bildirimlerini tek seferde okundu yapar.
export const markAllRead = asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.user.id, read: false },
    data: { read: true },
  });
  res.json({ message: "Tumu okundu" });
});

// Kullanıcının kendi bildirimine ait kaydı siler.
export const deleteNotification = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification) throw new HttpError(404, "Bildirim bulunamadi");
  if (notification.userId !== req.user.id) {
    throw new HttpError(403, "Bu bildirimi silme yetkiniz yok");
  }

  await prisma.notification.delete({ where: { id } });
  res.json({ message: "Silindi" });
});
