import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";
import Icon from "../components/Icon.jsx";
import "../styles/teams.css";

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    const res = await api.get("/teams");
    setTeams(res.data.teams);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const createTeam = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    setCreating(true);
    try {
      await api.post("/teams", { name: name.trim() });
      setName("");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Takım oluşturulamadı");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="page">
      <header className="topbar">
        <div className="board-title">
          <Link to="/" className="back">
            ← Projeler
          </Link>
          <h1>Takımlarım</h1>
        </div>
      </header>

      <div className="content">
        {error && <div className="error">{error}</div>}

        <form className="new-team" onSubmit={createTeam}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Yeni takım adı..."
          />
          <button type="submit" disabled={creating}>
            {creating ? "Oluşturuluyor..." : "Oluştur"}
          </button>
        </form>

        {loading ? (
          <p className="muted">Yükleniyor...</p>
        ) : teams.length === 0 ? (
          <p className="muted">Henüz takımın yok. Yukarıdan bir tane oluştur.</p>
        ) : (
          <div className="team-grid">
            {teams.map((team) => (
              <Link key={team.id} to={`/takimlar/${team.id}`} className="team-card">
                <h3>{team.name}</h3>
                {team.description && <p>{team.description}</p>}
                <div className="team-card-stats">
                  <span><Icon name="user" size={13} /> {team._count?.members ?? 0} üye</span>
                  <span><Icon name="clipboard" size={13} /> {team._count?.projects ?? 0} pano</span>
                </div>
                <span className="team-owner">Sahibi: {team.owner?.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
