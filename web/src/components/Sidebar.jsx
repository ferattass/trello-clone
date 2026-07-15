import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Icon from "./Icon.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

export default function Sidebar() {
  const { user, logout } = useAuth();

  const nav = [
    { to: "/", icon: "grid", label: "Projeler", end: true },
    { to: "/takimlar", icon: "users", label: "Takımlar" },
  ];
  if (user?.role === "ADMIN") {
    nav.push({ to: "/admin", icon: "shield", label: "Admin" });
  }

  const initial = user?.name?.trim()?.[0]?.toUpperCase() || "?";

  return (
    <aside className="sidebar">
      <div className="sidebar-head">
        <div className="workspace">
          <span className="workspace-badge">GY</span>
          <span className="workspace-name">Görev Yönetimi</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <p className="sidebar-label">Menü</p>
        {nav.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <Icon name={n.icon} size={18} />
            <span>{n.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-foot">
        <NavLink
          to="/profil"
          className={({ isActive }) =>
            isActive ? "nav-user active" : "nav-user"
          }
        >
          <span className="nav-avatar">{initial}</span>
          <span className="nav-user-info">
            <span className="nav-user-name">{user?.name}</span>
            <span className="nav-user-role">
              {user?.role === "ADMIN" ? "Yönetici" : "Üye"}
            </span>
          </span>
        </NavLink>
        <div className="sidebar-foot-actions">
          <ThemeToggle />
          <button
            type="button"
            className="icon-btn"
            onClick={logout}
            title="Çıkış yap"
            aria-label="Çıkış yap"
          >
            <Icon name="log-out" size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
