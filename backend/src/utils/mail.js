import nodemailer from "nodemailer";
import prisma from "../lib/prisma.js";

const APP_URL = process.env.APP_URL || "http://localhost:5173";

// Uygulama icindeki bir yolu tam adrese cevirir (mail baglantilari icin)
export function appUrl(path = "") {
  return `${APP_URL}${path}`;
}

// Aktif mail yapilandirmasini belirler.
// Oncelik: admin panelinden kaydedilen ayar (enabled) > .env SMTP_* > gelistirme
// modu (mail gonderilmez, icerik konsola yazilir).
async function resolveConfig() {
  let setting = null;
  try {
    setting = await prisma.mailSetting.findUnique({ where: { id: 1 } });
  } catch {
    // Tablo henuz yoksa veya DB'ye ulasilamiyorsa gelistirme moduna dus
    setting = null;
  }

  if (setting && setting.enabled && setting.host) {
    return {
      mode: "smtp",
      from: `${setting.fromName} <${setting.fromEmail}>`,
      transport: {
        host: setting.host,
        port: setting.port,
        secure: setting.secure,
        auth: setting.username
          ? { user: setting.username, pass: setting.password }
          : undefined,
      },
    };
  }

  if (process.env.SMTP_HOST) {
    return {
      mode: "smtp",
      from: process.env.MAIL_FROM || "Flowboard <no-reply@flowboard.local>",
      transport: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
      },
    };
  }

  return {
    mode: "dev",
    from: process.env.MAIL_FROM || "Flowboard <no-reply@flowboard.local>",
  };
}

// Tum mailler icin ortak HTML cerceve
function layout(title, bodyHtml) {
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1b1f24">
  <h2 style="margin:0 0 16px;font-size:20px">${title}</h2>
  <div style="font-size:14px;line-height:1.6">${bodyHtml}</div>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0" />
  <p style="font-size:12px;color:#9ca3af">Flowboard - Gorev &amp; Proje Yonetim Sistemi</p>
</div>`;
}

function button(link, label) {
  return `<a href="${link}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:11px 20px;border-radius:8px;font-weight:600">${label}</a>`;
}

// Dusuk seviyeli gonderim. Aktif yapilandirmaya gore gercek SMTP veya gelistirme
// modu kullanilir. Kullanilan modu (smtp/dev) geri dondurur.
async function sendMail({ to, subject, html, text }) {
  const cfg = await resolveConfig();
  const transporter = nodemailer.createTransport(
    cfg.mode === "smtp" ? cfg.transport : { jsonTransport: true }
  );
  await transporter.sendMail({ from: cfg.from, to, subject, html, text });

  if (cfg.mode === "dev") {
    console.log("\n========== MAIL (gelistirme modu) ==========");
    console.log("Kime :", to);
    console.log("Konu :", subject);
    console.log("Metin:\n" + (text || "").trim());
    console.log("============================================\n");
  }
  return cfg.mode;
}

export async function sendVerificationMail(user, token) {
  const link = appUrl(`/verify-email?token=${token}`);
  const text = `Merhaba ${user.name},\n\nHesabini dogrulamak icin asagidaki baglantiya tikla:\n${link}\n\nBaglanti 24 saat gecerlidir.`;
  await sendMail({
    to: user.email,
    subject: "E-posta adresini dogrula",
    text,
    html: layout(
      "E-posta Dogrulama",
      `<p>Merhaba <b>${user.name}</b>,</p>
       <p>Hesabini aktif etmek icin asagidaki butona tikla.</p>
       <p style="margin:20px 0">${button(link, "Hesabimi Dogrula")}</p>
       <p style="color:#9ca3af">Baglanti 24 saat gecerlidir.</p>`
    ),
  });
}

export async function sendResetMail(user, token) {
  const link = appUrl(`/reset-password?token=${token}`);
  const text = `Merhaba ${user.name},\n\nSifreni sifirlamak icin asagidaki baglantiya tikla:\n${link}\n\nBu istegi sen yapmadiysan bu maili yok sayabilirsin. Baglanti 1 saat gecerlidir.`;
  await sendMail({
    to: user.email,
    subject: "Sifre sifirlama istegi",
    text,
    html: layout(
      "Sifre Sifirlama",
      `<p>Merhaba <b>${user.name}</b>,</p>
       <p>Sifreni sifirlamak icin asagidaki butona tikla.</p>
       <p style="margin:20px 0">${button(link, "Sifremi Sifirla")}</p>
       <p style="color:#9ca3af">Bu istegi sen yapmadiysan bu maili yok sayabilirsin. Baglanti 1 saat gecerlidir.</p>`
    ),
  });
}

export async function sendTaskAssignedMail(user, message, link) {
  const full = link ? appUrl(link) : appUrl();
  const text = `Merhaba ${user.name},\n\n${message}\n\nGoruntulemek icin: ${full}`;
  await sendMail({
    to: user.email,
    subject: "Yeni gorev atamasi",
    text,
    html: layout(
      "Yeni Gorev Atamasi",
      `<p>Merhaba <b>${user.name}</b>,</p>
       <p>${message}</p>
       <p style="margin:20px 0">${button(full, "Gorevi Goruntule")}</p>`
    ),
  });
}

// Admin panelindeki "test maili gonder" icin. Kullanilan modu (smtp/dev) doner.
export async function sendTestMail(to) {
  return sendMail({
    to,
    subject: "Test maili",
    text: "Bu bir test mailidir. Mail (SMTP) ayarlarin dogru calisiyor.",
    html: layout(
      "Test Maili",
      `<p>Bu bir <b>test mailidir</b>.</p>
       <p>Bu maili gorebiliyorsan mail (SMTP) ayarlarin dogru calisiyor demektir.</p>`
    ),
  });
}
