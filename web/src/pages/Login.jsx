import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import AuthShell from "../components/AuthShell.jsx";
import PasswordInput from "../components/PasswordInput.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Giriş başarısız");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Tekrar hoş geldin"
      subtitle="Hesabına giriş yaparak panolarına devam et"
      footer={
        <>
          Hesabın yok mu? <Link to="/register">Kayıt ol</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        {error && <div className="error">{error}</div>}

        <label>E-posta</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ornek@mail.com"
          autoComplete="email"
          required
          autoFocus
        />

        <div className="label-row">
          <label>Şifre</label>
          <Link className="label-link" to="/forgot-password">
            Şifremi unuttum
          </Link>
        </div>
        <PasswordInput
          value={password}
          onChange={setPassword}
          placeholder="Şifreni gir"
          autoComplete="current-password"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
      </form>
    </AuthShell>
  );
}
