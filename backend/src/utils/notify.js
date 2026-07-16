import prisma from "../lib/prisma.js";
import { sendTaskAssignedMail } from "./mail.js";

// Belirtilen kullaniciya bildirim olusturur. link opsiyonel. sendEmail true ise
// ayrica kullanicinin adresine bilgilendirme maili gonderir.
export async function notify(userId, text, link = null, { sendEmail = false } = {}) {
  const notification = await prisma.notification.create({
    data: { userId, text, link },
  });

  if (sendEmail) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true },
      });
      if (user) await sendTaskAssignedMail(user, text, link);
    } catch (err) {
      console.error("Bildirim maili gonderilemedi:", err.message);
    }
  }

  return notification;
}
