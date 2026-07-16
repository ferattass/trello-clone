import rateLimit from "express-rate-limit";

// Giris/kayit/token gibi hassas uclar icin siki limit (brute-force'a karsi)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Cok fazla deneme yapildi, lutfen biraz sonra tekrar deneyin." },
});

// Mail tetikleyen uclar (sifremi unuttum / dogrulama tekrar) icin daha siki
// limit — hedef adrese mail bombardimanini onler.
export const mailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 saat
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Cok fazla istek gonderildi, lutfen daha sonra tekrar deneyin." },
});
