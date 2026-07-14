import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/client.js";


export default function Projects() {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");

  const load = async () => {
    const res = await api.get("/projects");
    setProjects(res.data.projects);
    setLoading(false);
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
        <h1>Projelerim</h1>
        <div className="user-box">
          <span>{user.name}</span>
          <Link to="/profil" className="ghost-link">
            Profil
          </Link>
          <button className="ghost" onClick={logout}>
            Çıkış
          </button>
        </div>
      </header>

      <div className="content">
        <form className="new-project" onSubmit={createProject}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Yeni proje adı..."
          />
          <button type="submit">Oluştur</button>
        </form>

        {loading ? (
          <p className="muted">Yükleniyor...</p>
        ) : projects.length === 0 ? (
          <p className="muted">Henüz projen yok. Yukarıdan bir tane oluştur.</p>
        ) : (
          <div className="project-grid">
            {projects.map((p) => (
              <Link key={p.id} to={`/projects/${p.id}`} className="project-card">
                <button
                  className="project-del"
                  onClick={(e) => deleteProject(e, p)}
                  title="Projeyi sil"
                >
                  ✕
                </button>
                <h3>{p.name}</h3>
                {p.description && <p>{p.description}</p>}
                {p.team && <span className="team-tag">👥 {p.team.name}</span>}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
