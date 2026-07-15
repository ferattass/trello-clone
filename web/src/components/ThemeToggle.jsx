import { useState } from "react";
import Icon from "./Icon.jsx";

// Temayi <html data-theme="..."> uzerinden degistirir ve localStorage'a yazar.
// Baslangic degeri index.html icindeki script tarafindan zaten ayarlanmis olur.
export default function ThemeToggle() {
  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute("data-theme") || "light"
  );

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    setTheme(next);
  };

  return (
    <button
      type="button"
      className="icon-btn"
      onClick={toggle}
      title={theme === "dark" ? "Açık temaya geç" : "Koyu temaya geç"}
      aria-label="Temayı değiştir"
    >
      <Icon name={theme === "dark" ? "sun" : "moon"} size={18} />
    </button>
  );
}
