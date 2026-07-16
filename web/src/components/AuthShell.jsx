import ThemeToggle from "./ThemeToggle.jsx";
import Icon from "./Icon.jsx";

// Tum giris/kayit/sifre ekranlarinin ortak kabugu: marka basligi, tema dugmesi
// ve ortadaki kart. Icerik (form vs.) children olarak gelir.
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="auth-page">
      <ThemeToggle />
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-logo">
            <Icon name="board" size={20} />
          </span>
          <span className="auth-brand-name">Flowboard</span>
        </div>

        <h1>{title}</h1>
        {subtitle && <p className="auth-subtitle">{subtitle}</p>}

        {children}

        {footer && <div className="auth-footer">{footer}</div>}
      </div>
    </div>
  );
}
