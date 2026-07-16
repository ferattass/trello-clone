import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import prisma from "./lib/prisma.js";
import { clientOrigins } from "./utils/clientOrigins.js";

// Kritik env kontrolu — eksikse en basta net hata ver (sessiz cokme yerine)
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET tanimli degil. backend/.env dosyasini kontrol et.");
}

const PORT = process.env.PORT || 4000;

// Express uygulamasini HTTP sunucusuna sarip Socket.io'yu ekliyoruz
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: clientOrigins } });

// Controller'lardan erisebilmek icin io'yu app'e bagla
app.set("io", io);

io.on("connection", (socket) => {
  // Istemci bir projenin panosunu acinca o projenin "odasina" katilir
  socket.on("join-project", (projectId) => {
    socket.join(`project:${projectId}`);
  });
  socket.on("leave-project", (projectId) => {
    socket.leave(`project:${projectId}`);
  });
});

server.listen(PORT, async () => {
  try {
    await prisma.$connect();
  } catch (err) {
    console.error("Veritabanina baglanilamadi:", err.message);
  }
  console.log(`Sunucu ${PORT} portunda calisiyor`);
});

// Kapatma sinyallerinde istekleri bitir + DB baglantisini duzgun kapat
for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, () => {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  });
}
