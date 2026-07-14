// Sadece admin rolüne sahip kullanıcıların geçmesine izin verir.
// authenticate middleware'inden sonra kullanılmalı.
export function requireAdmin(req, res, next) {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Bu islem icin admin yetkisi gerekli" });
  }
  next();
}
