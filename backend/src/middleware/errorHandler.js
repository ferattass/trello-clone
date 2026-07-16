export function notFound(req, res) {
  res.status(404).json({ message: "Kaynak bulunamadi" });
}

export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  if (status >= 500) {
    console.error(err);
  }
  // 5xx'te ic hata detayini (Prisma/DB mesajlari vb.) istemciye sizdirma
  const message = status < 500 ? err.message || "Istek islenemedi" : "Sunucu hatasi";
  res.status(status).json({ message });
}
