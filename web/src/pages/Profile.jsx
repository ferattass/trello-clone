import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Profile() {
  const { user, updateUser } = useAuth();

  // --- Profil (ad) ---
  const [name, setName] = useState(user.name);
  const [profileMsg, setProfileMsg] = useState(null);

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileMsg(null);
    try {
      const res = await api.put("/auth/profile", { name: name.trim() });
      updateUser(res.data.user);
      setProfileMsg({ type: "success", text: "Profil güncellendi" });
    } catch (err) {
      setProfileMsg({
        type: "error",
        text: err.response?.data?.message || "İşlem başarısız",
      });
    }
  };

  // --- Sifre ---
  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNew] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pwMsg, setPwMsg] = useState(null);
  const [pwLoading, setPwLoading] = useState(false);

  const savePassword = async (e) => {
    e.preventDefault();
    setPwMsg(null);
    if (newPassword !== confirm) {
      setPwMsg({ type: "error", text: "Yeni şifreler eşleşmiyor" });
      return;
    }
    setPwLoading(true);
    try {
      await api.put("/auth/password", { currentPassword, newPassword });
      setPwMsg({ type: "success", text: "Şifren başarıyla değiştirildi" });
      setCurrent("");
      setNew("");
      setConfirm("");
    } catch (err) {
      setPwMsg({
        type: "error",
        text: err.response?.data?.message || "İşlem başarısız",
      });
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="page">
      <header className="topbar">
        <div className="board-title">
          <Link to="/" className="back">
            ← Projeler
          </Link>
          <h1>Profil</h1>
        </div>
      </header>

      <div className="content settings">
        {/* Profil bilgileri */}
        <form className="settings-card" onSubmit={saveProfile}>
          <h2>Profil Bilgileri</h2>
          {profileMsg && <div className={profileMsg.type}>{profileMsg.text}</div>}

          <label>E-posta</label>
          <input type="email" value={user.email} disabled />

          <label>Ad Soyad</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />

          <button type="submit">Kaydet</button>
        </form>

        {/* Sifre degistirme */}
        <form className="settings-card" onSubmit={savePassword}>
          <h2>Şifre Değiştir</h2>
          {pwMsg && <div className={pwMsg.type}>{pwMsg.text}</div>}

          <label>Mevcut Şifre</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrent(e.target.value)}
            required
          />

          <label>Yeni Şifre</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNew(e.target.value)}
            placeholder="En az 6 karakter"
            required
          />

          <label>Yeni Şifre (Tekrar)</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          <button type="submit" disabled={pwLoading}>
            {pwLoading ? "Değiştiriliyor..." : "Şifreyi Değiştir"}
          </button>
        </form>
      </div>
    </div>
  );
}
