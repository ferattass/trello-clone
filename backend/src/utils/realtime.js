// Bir projedeki degisikliki, o projeye bagli (odaya katilmis) tum
// istemcilere anlik olarak bildirir. Istemciler bunu alinca panoyu tazeler.
export function emitBoardUpdate(req, projectId) {
  const io = req.app.get("io");
  if (io) {
    io.to(`project:${projectId}`).emit("board:updated", { projectId });
  }
}
