import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import Icon from "../components/Icon.jsx";
import "../styles/teams.css";

const ROLE_LABELS = {
  OWNER: "Sahip",
  ADMIN: "Yönetici",
  MEMBER: "Üye",
};

export default function TeamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // --- Uye davet ---
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [inviteError, setInviteError] = useState(null);
  const [inviting, setInviting] = useState(false);

  // --- Yeni pano ---
  const [projectName, setProjectName] = useState("");
  const [projectError, setProjectError] = useState(null);
  const [creatingProject, setCreatingProject] = useState(false);

  const load = async () => {
    try {
      const res = await api.get(`/teams/${id}`);
      setTeam(res.data.team);
    } catch (err) {
      setLoadError(err.response?.data?.message || "Takım yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  if (loading) {
    return <div className="center">Yükleniyor...</div>;
  }

  if (loadError || !team) {
    return (
      <div className="page">
        <header className="topbar">
          <div className="board-title">
            <Link to="/takimlar" className="back">
              ← Takımlar
            </Link>
            <h1>Takım</h1>
          </div>
        </header>
        <div className="content">
          <div className="error">{loadError || "Takım bulunamadı"}</div>
        </div>
      </div>
    );
  }

  const myMembership = team.members.find((m) => m.userId === user.id);
  const myRole = myMembership?.role;
  const isManager = myRole === "OWNER" || myRole === "ADMIN";
  const isOwner = team.ownerId === user.id;

  const changeRole = async (userId, role) => {
    await api.put(`/teams/${id}/members/${userId}/role`, { role });
    load();
  };

  const removeMember = async (userId) => {
    await api.delete(`/teams/${id}/members/${userId}`);
    load();
  };

  const inviteMember = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviteError(null);
    setInviting(true);
    try {
      await api.post(`/teams/${id}/members`, {
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      setInviteEmail("");
      setInviteRole("MEMBER");
      load();
    } catch (err) {
      setInviteError(err.response?.data?.message || "Üye eklenemedi");
    } finally {
      setInviting(false);
    }
  };

  const createProject = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    setProjectError(null);
    setCreatingProject(true);
    try {
      const res = await api.post("/projects", {
        name: projectName.trim(),
        teamId: id,
      });
      navigate(`/projects/${res.data.project.id}`);
    } catch (err) {
      setProjectError(err.response?.data?.message || "Pano oluşturulamadı");
      setCreatingProject(false);
    }
  };

  const deleteTeam = async () => {
    if (!window.confirm(`"${team.name}" takımı ve tüm bağlantıları silinsin mi?`)) return;
    await api.delete(`/teams/${id}`);
    navigate("/takimlar");
  };

  const leaveTeam = async () => {
    if (!window.confirm("Bu takımdan ayrılmak istediğine emin misin?")) return;
    await api.post(`/teams/${id}/leave`);
    navigate("/takimlar");
  };

  return (
    <div className="page">
      <header className="topbar">
        <div className="board-title">
          <Link to="/takimlar" className="back">
            ← Takımlar
          </Link>
          <h1>{team.name}</h1>
        </div>
      </header>

      <div className="content team-detail">
        {team.description && <p className="team-desc">{team.description}</p>}

        <section className="team-section">
          <h2>Üyeler</h2>
          <div className="member-list">
            {team.members.map((m) => (
              <div key={m.id} className="member-row">
                <div className="member-info">
                  <span className="member-name">{m.user.name}</span>
                  <span className="member-email">{m.user.email}</span>
                </div>

                <span className={`role-badge role-${m.role.toLowerCase()}`}>
                  {ROLE_LABELS[m.role] || m.role}
                </span>

                {isManager && m.userId !== team.ownerId && (
                  <div className="member-actions">
                    <select
                      value={m.role}
                      onChange={(e) => changeRole(m.userId, e.target.value)}
                    >
                      <option value="MEMBER">Üye</option>
                      <option value="ADMIN">Yönetici</option>
                    </select>
                    <button
                      className="member-remove"
                      onClick={() => removeMember(m.userId)}
                      title="Üyeyi çıkar"
                      aria-label="Üyeyi çıkar"
                    >
                      <Icon name="x" size={13} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {isManager && (
            <form className="invite-form" onSubmit={inviteMember}>
              {inviteError && <div className="error">{inviteError}</div>}
              <div className="invite-row">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="E-posta adresi..."
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                >
                  <option value="MEMBER">Üye</option>
                  <option value="ADMIN">Yönetici</option>
                </select>
                <button type="submit" disabled={inviting}>
                  {inviting ? "Ekleniyor..." : "Davet Et"}
                </button>
              </div>
            </form>
          )}
        </section>

        <section className="team-section">
          <h2>Panolar</h2>

          {team.projects.length === 0 ? (
            <p className="muted">Bu takımın henüz panosu yok.</p>
          ) : (
            <div className="project-grid">
              {team.projects.map((p) => (
                <Link key={p.id} to={`/projects/${p.id}`} className="project-card">
                  <h3>{p.name}</h3>
                  {p.description && <p>{p.description}</p>}
                </Link>
              ))}
            </div>
          )}

          <form className="new-project" onSubmit={createProject}>
            {projectError && <div className="error">{projectError}</div>}
            <input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Yeni pano adı..."
            />
            <button type="submit" disabled={creatingProject}>
              {creatingProject ? "Oluşturuluyor..." : "+ Yeni Pano"}
            </button>
          </form>
        </section>

        <div className="team-danger">
          {isOwner ? (
            <button className="danger-btn" onClick={deleteTeam}>
              Takımı Sil
            </button>
          ) : (
            <button className="danger-btn" onClick={leaveTeam}>
              Takımdan Ayrıl
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
