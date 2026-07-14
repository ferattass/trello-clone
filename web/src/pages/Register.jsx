import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(name, email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Kayıt başarısız");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Kayıt Ol</h1>
        {error && <div className="error">{error}</div>}

        <label>Ad Soyad</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Adın"
          required
        />

        <label>E-posta</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ornek@mail.com"
          required
        />

        <label>Şifre</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="En az 6 karakter"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Kayıt olunuyor..." : "Kayıt Ol"}
        </button>

        <p className="switch">
          Zaten hesabın var mı? <Link to="/login">Giriş yap</Link>
        </p>
      </form>
    </div>
  );
}
