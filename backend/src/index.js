import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";

const PORT = process.env.PORT || 4000;

// Express uygulamasini HTTP sunucusuna sarip Socket.io'yu ekliyoruz
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

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

server.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda calisiyor`);
});
