import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";
import Icon from "../components/Icon.jsx";
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

  // Mail (SMTP) ayarlari
  const [mailForm, setMailForm] = useState({
    enabled: false,
    host: "",
    port: 587,
    secure: false,
    username: "",
    password: "",
    fromName: "",
    fromEmail: "",
  });
  const [hasPassword, setHasPassword] = useState(false);
  const [mailMsg, setMailMsg] = useState(null);
  const [savingMail, setSavingMail] = useState(false);
  const [testTo, setTestTo] = useState("");
  const [testMsg, setTestMsg] = useState(null);
  const [testingMail, setTestingMail] = useState(false);

  const loadAll = async () => {
    try {
      const [statsRes, usersRes, teamsRes, mailRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
        api.get("/admin/teams"),
        api.get("/admin/mail-settings"),
      ]);
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
      setTeams(teamsRes.data.teams);
      applyMailSettings(mailRes.data.settings);
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

  // Backend'den gelen ayarlari forma yerlestirir (parola hep bos baslar)
  const applyMailSettings = (s) => {
    setMailForm({
      enabled: s.enabled,
      host: s.host,
      port: s.port,
      secure: s.secure,
      username: s.username,
      password: "",
      fromName: s.fromName,
      fromEmail: s.fromEmail,
    });
    setHasPassword(s.hasPassword);
  };

  const handleMailChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMailForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleMailSave = async (e) => {
    e.preventDefault();
    setMailMsg(null);
    setSavingMail(true);
    try {
      const payload = { ...mailForm, port: Number(mailForm.port) };
      // Parola bos ise gonderme; backend mevcut parolayi korur
      if (!payload.password) delete payload.password;
      const res = await api.put("/admin/mail-settings", payload);
      applyMailSettings(res.data.settings);
      setMailMsg({ type: "success", text: "Mail ayarları kaydedildi." });
    } catch (err) {
      setMailMsg({
        type: "error",
        text: err.response?.data?.message || "Ayarlar kaydedilemedi.",
      });
    } finally {
      setSavingMail(false);
    }
  };

  const handleTestMail = async () => {
    setTestMsg(null);
    setTestingMail(true);
    try {
      const res = await api.post("/admin/mail-settings/test", {
        to: testTo.trim(),
      });
      setTestMsg({ type: "success", text: res.data.message });
    } catch (err) {
      setTestMsg({
        type: "error",
        text: err.response?.data?.message || "Test maili gönderilemedi.",
      });
    } finally {
      setTestingMail(false);
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
            <div className="admin-stat-card sc-users">
              <span className="admin-stat-icon"><Icon name="user" size={22} /></span>
              <div className="admin-stat-body">
                <span className="admin-stat-num">{stats.users}</span>
                <span className="admin-stat-label">Kullanıcı</span>
              </div>
            </div>
            <div className="admin-stat-card sc-teams">
              <span className="admin-stat-icon"><Icon name="users" size={22} /></span>
              <div className="admin-stat-body">
                <span className="admin-stat-num">{stats.teams}</span>
                <span className="admin-stat-label">Takım</span>
              </div>
            </div>
            <div className="admin-stat-card sc-projects">
              <span className="admin-stat-icon"><Icon name="clipboard" size={22} /></span>
              <div className="admin-stat-body">
                <span className="admin-stat-num">{stats.projects}</span>
                <span className="admin-stat-label">Proje</span>
              </div>
            </div>
            <div className="admin-stat-card sc-tasks">
              <span className="admin-stat-icon"><Icon name="check" size={22} /></span>
              <div className="admin-stat-body">
                <span className="admin-stat-num">{stats.tasks}</span>
                <span className="admin-stat-label">Görev</span>
              </div>
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

        {/* Mail (SMTP) ayarları */}
        <section className="admin-section">
          <h2>Mail Ayarları (SMTP)</h2>
          <p className="admin-field-hint" style={{ marginTop: "-8px", marginBottom: "16px" }}>
            "SMTP aktif" işaretli ve sunucu bilgileri doluysa mailler gerçekten
            gönderilir. Kapalıysa mailler backend konsoluna yazılır (geliştirme modu).
          </p>
          {mailMsg && (
            <p
              className={mailMsg.type === "success" ? "success" : "error"}
              style={{ marginBottom: "12px" }}
            >
              {mailMsg.text}
            </p>
          )}
          <form className="admin-form" onSubmit={handleMailSave}>
            <label className="admin-check">
              <input
                type="checkbox"
                name="enabled"
                checked={mailForm.enabled}
                onChange={handleMailChange}
              />
              <span>SMTP aktif — gerçek mail gönder</span>
            </label>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label htmlFor="m-host">SMTP Sunucu (host)</label>
                <input
                  id="m-host"
                  name="host"
                  value={mailForm.host}
                  onChange={handleMailChange}
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div className="admin-form-group">
                <label htmlFor="m-port">Port</label>
                <input
                  id="m-port"
                  name="port"
                  type="number"
                  value={mailForm.port}
                  onChange={handleMailChange}
                  placeholder="587"
                />
              </div>
            </div>

            <label className="admin-check">
              <input
                type="checkbox"
                name="secure"
                checked={mailForm.secure}
                onChange={handleMailChange}
              />
              <span>SSL/TLS — port 465 için işaretle, 587 için boş bırak</span>
            </label>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label htmlFor="m-username">Kullanıcı adı</label>
                <input
                  id="m-username"
                  name="username"
                  value={mailForm.username}
                  onChange={handleMailChange}
                  placeholder="senin.adresin@gmail.com"
                  autoComplete="off"
                />
              </div>
              <div className="admin-form-group">
                <label htmlFor="m-password">Şifre</label>
                <input
                  id="m-password"
                  name="password"
                  type="password"
                  value={mailForm.password}
                  onChange={handleMailChange}
                  placeholder={hasPassword ? "•••••••• (kayıtlı)" : "Uygulama şifresi"}
                  autoComplete="new-password"
                />
                <span className="admin-field-hint">
                  {hasPassword
                    ? "Kayıtlı bir şifre var. Değiştirmek istemiyorsan boş bırak."
                    : "SMTP için uygulama şifresi (ör. Gmail uygulama şifresi)."}
                </span>
              </div>
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label htmlFor="m-fromName">Gönderen adı</label>
                <input
                  id="m-fromName"
                  name="fromName"
                  value={mailForm.fromName}
                  onChange={handleMailChange}
                  placeholder="Flowboard"
                />
              </div>
              <div className="admin-form-group">
                <label htmlFor="m-fromEmail">Gönderen e-posta</label>
                <input
                  id="m-fromEmail"
                  type="email"
                  name="fromEmail"
                  value={mailForm.fromEmail}
                  onChange={handleMailChange}
                  placeholder="no-reply@domain.com"
                />
              </div>
            </div>

            <button type="submit" disabled={savingMail}>
              {savingMail ? "Kaydediliyor..." : "Ayarları Kaydet"}
            </button>
          </form>

          <div className="admin-mail-test">
            <h3>Test Maili Gönder</h3>
            {testMsg && (
              <p
                className={testMsg.type === "success" ? "success" : "error"}
                style={{ marginBottom: "10px" }}
              >
                {testMsg.text}
              </p>
            )}
            <div className="admin-form-row" style={{ alignItems: "flex-end" }}>
              <div className="admin-form-group">
                <label htmlFor="m-testto">Alıcı e-posta</label>
                <input
                  id="m-testto"
                  type="email"
                  value={testTo}
                  onChange={(e) => setTestTo(e.target.value)}
                  placeholder="deneme@mail.com"
                />
              </div>
              <div className="admin-form-group">
                <button
                  type="button"
                  className="admin-btn"
                  onClick={handleTestMail}
                  disabled={testingMail || !testTo.trim()}
                >
                  {testingMail ? "Gönderiliyor..." : "Test Maili Gönder"}
                </button>
              </div>
            </div>
            <span className="admin-field-hint">Önce ayarları kaydet, sonra test et.</span>
          </div>
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
