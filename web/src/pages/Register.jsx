import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import AuthShell from "../components/AuthShell.jsx";
import PasswordInput from "../components/PasswordInput.jsx";
import PasswordStrength from "../components/PasswordStrength.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Backend ile ayni kural: en az 8 karakter, en az bir harf ve bir rakam
  const passwordOk =
    password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);
  const mismatch = confirm.length > 0 && password !== confirm;
  const canSubmit =
    name.trim().length >= 2 && email.length > 0 && passwordOk && password === confirm;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Şifreler eşleşmiyor");
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
      navigate("/");
    } catch (err) {
      const data = err.response?.data;
      setError(data?.errors?.[0]?.message || data?.message || "Kayıt başarısız");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Hesap oluştur"
      subtitle="Birkaç saniyede ücretsiz hesabını oluştur"
      footer={
        <>
          Zaten hesabın var mı? <Link to="/login">Giriş yap</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        {error && <div className="error">{error}</div>}

        <label>Ad Soyad</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Adın Soyadın"
          autoComplete="name"
          required
          autoFocus
        />

        <label>E-posta</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ornek@mail.com"
          autoComplete="email"
          required
        />

        <label>Şifre</label>
        <PasswordInput
          value={password}
          onChange={setPassword}
          placeholder="En az 8 karakter"
          autoComplete="new-password"
          required
        />
        <PasswordStrength password={password} />

        <label>Şifre (tekrar)</label>
        <PasswordInput
          value={confirm}
          onChange={setConfirm}
          placeholder="Şifreni tekrar gir"
          autoComplete="new-password"
          required
        />
        {mismatch && (
          <p className="field-hint field-hint-error">Şifreler eşleşmiyor</p>
        )}

        <button type="submit" disabled={loading || !canSubmit}>
          {loading ? "Kayıt olunuyor..." : "Kayıt Ol"}
        </button>
      </form>
    </AuthShell>
  );
}
