import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Once tum verileri temizle (yabanci anahtar sirasina gore: cocuklar once)
  await prisma.authToken.deleteMany();
  await prisma.taskLabel.deleteMany();
  await prisma.checklistItem.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.task.deleteMany();
  await prisma.label.deleteMany();
  await prisma.column.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();

  // Tum demo hesaplar icin ortak sifre
  const password = await bcrypt.hash("Sifre123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Sistem Yoneticisi",
      email: "admin@flowboard.com",
      password,
      role: "ADMIN",
      emailVerified: true,
    },
  });
  const mustafa = await prisma.user.create({
    data: {
      name: "Mustafa Yilmaz",
      email: "mustafa@flowboard.com",
      password,
      emailVerified: true,
    },
  });
  const ayse = await prisma.user.create({
    data: {
      name: "Ayse Demir",
      email: "ayse@flowboard.com",
      password,
      emailVerified: true,
    },
  });
  const mehmet = await prisma.user.create({
    data: {
      name: "Mehmet Kaya",
      email: "mehmet@flowboard.com",
      password,
      emailVerified: true,
    },
  });

  // Ornek takim
  const team = await prisma.team.create({
    data: {
      name: "Yazilim Ekibi",
      description: "Ornek proje ekibi",
      ownerId: admin.id,
      members: {
        create: [
          { userId: admin.id, role: "OWNER" },
          { userId: mustafa.id, role: "MEMBER" },
          { userId: ayse.id, role: "MEMBER" },
          { userId: mehmet.id, role: "MEMBER" },
        ],
      },
    },
  });

  // Ornek proje + uyeleri
  const project = await prisma.project.create({
    data: {
      name: "Ornek Pano",
      description: "Baslangic icin hazir bir kanban panosu",
      ownerId: admin.id,
      teamId: team.id,
      members: {
        create: [
          { userId: admin.id },
          { userId: mustafa.id },
          { userId: ayse.id },
          { userId: mehmet.id },
        ],
      },
    },
  });

  // Sutunlar
  const todo = await prisma.column.create({
    data: { name: "Yapilacak", position: 0, projectId: project.id },
  });
  const doing = await prisma.column.create({
    data: { name: "Devam Ediyor", position: 1, projectId: project.id },
  });
  const done = await prisma.column.create({
    data: { name: "Tamamlandi", position: 2, projectId: project.id },
  });

  // Ornek gorevler
  await prisma.task.createMany({
    data: [
      { title: "Giris ekranini tasarla", position: 0, columnId: todo.id, projectId: project.id, assigneeId: mustafa.id, priority: "HIGH" },
      { title: "Veritabani semasini olustur", position: 1, columnId: todo.id, projectId: project.id, assigneeId: ayse.id, priority: "MEDIUM" },
      { title: "API uc noktalarini yaz", position: 0, columnId: doing.id, projectId: project.id, assigneeId: mehmet.id, priority: "MEDIUM" },
      { title: "Proje kurulumu", position: 0, columnId: done.id, projectId: project.id, assigneeId: admin.id, priority: "LOW" },
    ],
  });

  console.log("Seed tamamlandi. Hesaplar:");
  console.log("  admin@flowboard.com   (ADMIN)");
  console.log("  mustafa@flowboard.com");
  console.log("  ayse@flowboard.com");
  console.log("  mehmet@flowboard.com");
  console.log("  Tum sifreler: Sifre123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
