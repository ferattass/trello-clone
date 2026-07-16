// Sifre gucunu 0-4 arasi puanlar ve renkli bir cubukla gosterir.
function score(pw) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Za-z]/.test(pw) && /[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
}

const LABELS = ["", "Zayıf", "Orta", "İyi", "Güçlü"];

export default function PasswordStrength({ password }) {
  if (!password) return null;
  const s = score(password);

  return (
    <div className={`pw-strength pw-strength-${s}`}>
      <div className="pw-bars">
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className={i <= s ? "on" : ""} />
        ))}
      </div>
      <span className="pw-label">{LABELS[s]}</span>
    </div>
  );
}
