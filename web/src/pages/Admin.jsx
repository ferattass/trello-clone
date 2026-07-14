import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";
import "../styles/admin.css";

const BOSH_FORM = { name: "", email: "", password: "", role: "USER", teamName: "" };

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState(BOSH_FORM);
  const [formMsg, setFormMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadAll = async () => {
    try {
      const [statsRes, usersRes, teamsRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
        api.get("/admin/teams"),
      ]);
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
      setTeams(teamsRes.data.teams);
    } catch {
      // yönetici değilse 403 döner; sayfayı boş bırakabiliriz
    } finally {
      setLoading(false);
    }
  };

  const refreshUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data.users);
    } catch {
      // yoksay
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormMsg(null);
    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      };
      if (form.teamName.trim()) {
        payload.teamName = form.teamName.trim();
      }
      await api.post("/admin/accounts", payload);
      setFormMsg({ type: "success", text: "Hesap başarıyla oluşturuldu." });
      setForm(BOSH_FORM);
      await refreshUsers();
    } catch (err) {
      setFormMsg({
        type: "error",
        text: err.response?.data?.message || "Bir hata oluştu, tekrar deneyin.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  if (loading) {
    return (
      <div className="page">
        <header className="topbar">
          <div className="board-title">
            <Link to="/" className="back">
              ← Projeler
            </Link>
            <h1>Admin Paneli</h1>
          </div>
        </header>
        <div className="content">
          <p className="muted">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="topbar">
        <div className="board-title">
          <Link to="/" className="back">
            ← Projeler
          </Link>
          <h1>Admin Paneli</h1>
        </div>
      </header>

      <div className="content">
        {/* İstatistik kartları */}
        {stats && (
          <div className="admin-stats">
            <div className="admin-stat-card">
              <span className="admin-stat-num">{stats.users}</span>
              <span className="admin-stat-label">Kullanıcı</span>
            </div>
            <div className="admin-stat-card">
              <span className="admin-stat-num">{stats.teams}</span>
              <span className="admin-stat-label">Takım</span>
            </div>
            <div className="admin-stat-card">
              <span className="admin-stat-num">{stats.projects}</span>
              <span className="admin-stat-label">Proje</span>
            </div>
            <div className="admin-stat-card">
              <span className="admin-stat-num">{stats.tasks}</span>
              <span className="admin-stat-label">Görev</span>
            </div>
          </div>
        )}

        {/* Yeni hesap formu */}
        <section className="admin-section">
          <h2>Yeni Hesap Oluştur</h2>
          {formMsg && (
            <p className={formMsg.type === "success" ? "success" : "error"} style={{ marginBottom: "12px" }}>
              {formMsg.text}
            </p>
          )}
          <form className="admin-form" onSubmit={handleCreate}>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label htmlFor="ac-name">Ad Soyad</label>
                <input
                  id="ac-name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Örn: Ahmet Yılmaz"
                  required
                />
              </div>
              <div className="admin-form-group">
                <label htmlFor="ac-email">E-posta</label>
                <input
                  id="ac-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="ornek@domain.com"
                  required
                />
              </div>
            </div>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label htmlFor="ac-password">Şifre</label>
                <input
                  id="ac-password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="En az 6 karakter"
                  required
                />
              </div>
              <div className="admin-form-group">
                <label htmlFor="ac-role">Rol</label>
                <select
                  id="ac-role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                >
                  <option value="USER">Kullanıcı</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>
            <div className="admin-form-group">
              <label htmlFor="ac-team">Takım Adı (opsiyonel)</label>
              <input
                id="ac-team"
                name="teamName"
                value={form.teamName}
                onChange={handleChange}
                placeholder="Boş bırakılırsa bireysel hesap oluşturulur"
              />
              <span className="admin-field-hint">
                Takım adı girilirse bu kişi, belirtilen isimde bir takımın sahibi olarak oluşturulur.
              </span>
            </div>
            <button type="submit" disabled={submitting}>
              {submitting ? "Oluşturuluyor..." : "Hesap Oluştur"}
            </button>
          </form>
        </section>

        {/* Kullanıcılar tablosu */}
        <section className="admin-section">
          <h2>Kullanıcılar ({users.length})</h2>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ad</th>
                  <th>E-posta</th>
                  <th>Rol</th>
                  <th>Proje</th>
                  <th>Takım</th>
                  <th>Kayıt Tarihi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td className="admin-email">{u.email}</td>
                    <td>
                      <span
                        className={`admin-role-badge ${
                          u.role === "ADMIN" ? "role-admin" : "role-user"
                        }`}
                      >
                        {u.role === "ADMIN" ? "Admin" : "Kullanıcı"}
                      </span>
                    </td>
                    <td>{u._count?.ownedProjects ?? 0}</td>
                    <td>{u._count?.teamMemberships ?? 0}</td>
                    <td>{formatDate(u.createdAt)}</td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", color: "var(--muted)" }}>
                      Henüz kullanıcı yok.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Takımlar tablosu */}
        <section className="admin-section">
          <h2>Takımlar ({teams.length})</h2>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ad</th>
                  <th>Sahip</th>
                  <th>Üye Sayısı</th>
                  <th>Pano Sayısı</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((t) => (
                  <tr key={t.id}>
                    <td>{t.name}</td>
                    <td>{t.owner?.name ?? "-"}</td>
                    <td>{t._count?.members ?? 0}</td>
                    <td>{t._count?.projects ?? 0}</td>
                  </tr>
                ))}
                {teams.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", color: "var(--muted)" }}>
                      Henüz takım yok.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
