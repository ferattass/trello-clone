export function notFound(req, res) {
  res.status(404).json({ message: "Kaynak bulunamadi" });
}

export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  if (status >= 500) {
    console.error(err);
  }
  res.status(status).json({ message: err.message || "Sunucu hatasi" });
}
