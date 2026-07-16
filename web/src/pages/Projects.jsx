import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";
import NotificationBell from "../components/NotificationBell.jsx";
import Icon from "../components/Icon.jsx";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");

  const load = async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data.projects);
    } catch (err) {
      setError(err.response?.data?.message || "Projeler yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createProject = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await api.post("/projects", { name: name.trim() });
    setName("");
    load();
  };

  const deleteProject = async (e, p) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`"${p.name}" projesi ve tüm içeriği silinsin mi?`)) return;
    await api.delete(`/projects/${p.id}`);
    load();
  };

  return (
    <div className="page">
      <header className="topbar">
        <div className="page-title">
          <h1>Projeler</h1>
          <p className="page-sub">Tüm panolarını buradan yönet.</p>
        </div>
        <div className="user-box">
          <NotificationBell />
        </div>
      </header>

      <div className="content">
        <form className="new-project" onSubmit={createProject}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Yeni proje adı..."
          />
          <button type="submit">
            <Icon name="plus" size={16} /> Oluştur
          </button>
        </form>

        {loading ? (
          <p className="muted">Yükleniyor...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">
              <Icon name="grid" size={26} />
            </span>
            <h3>Henüz projen yok</h3>
            <p>Yukarıdaki kutudan ilk projeni oluşturarak başla.</p>
          </div>
        ) : (
          <div className="project-grid">
            {projects.map((p) => (
              <Link key={p.id} to={`/projects/${p.id}`} className="project-card">
                <button
                  className="project-del"
                  onClick={(e) => deleteProject(e, p)}
                  title="Projeyi sil"
                  aria-label="Projeyi sil"
                >
                  <Icon name="x" size={14} />
                </button>
                <span className="project-card-icon">
                  <Icon name="folder" size={18} />
                </span>
                <h3>{p.name}</h3>
                {p.description ? (
                  <p>{p.description}</p>
                ) : (
                  <p className="card-empty">Açıklama eklenmemiş</p>
                )}
                {p.team && (
                  <span className="team-tag">
                    <Icon name="users" size={13} /> {p.team.name}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
