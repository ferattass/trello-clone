// Izin verilen frontend kaynaklari (CORS icin).
// CLIENT_URL bos ise tum kaynaklara izin verilir (gelistirme kolayligi).
// Production'da virgulle ayrilmis adres listesi verilir, orn:
//   CLIENT_URL="https://uygulaman.vercel.app"
export const clientOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((o) => o.trim())
  : "*";
