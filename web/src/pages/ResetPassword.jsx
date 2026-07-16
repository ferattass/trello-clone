import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import AuthShell from "../components/AuthShell.jsx";
import PasswordInput from "../components/PasswordInput.jsx";
import PasswordStrength from "../components/PasswordStrength.jsx";
import Icon from "../components/Icon.jsx";

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordOk =
    password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);
  const mismatch = confirm.length > 0 && password !== confirm;

  const backLink = (
    <Link to="/login" className="back-link">
      <Icon name="arrow-left" size={16} /> Girişe dön
    </Link>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Şifreler eşleşmiyor");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, password);
      setDone(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(
        err.response?.data?.message || "Bağlantı geçersiz veya süresi dolmuş"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthShell
        title="Geçersiz bağlantı"
        subtitle="Sıfırlama bağlantısı eksik ya da hatalı"
        footer={backLink}
      >
        <div className="error">
          Bağlantı geçerli değil. Lütfen yeniden şifre sıfırlama isteğinde bulun.
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Yeni şifre belirle"
      subtitle="Hesabın için yeni bir şifre oluştur"
      footer={backLink}
    >
      {done ? (
        <div className="success">
          Şifren güncellendi. Giriş sayfasına yönlendiriliyorsun...
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && <div className="error">{error}</div>}

          <label>Yeni şifre</label>
          <PasswordInput
            value={password}
            onChange={setPassword}
            placeholder="En az 8 karakter"
            autoComplete="new-password"
            required
            autoFocus
          />
          <PasswordStrength password={password} />

          <label>Yeni şifre (tekrar)</label>
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

          <button
            type="submit"
            disabled={loading || !passwordOk || password !== confirm}
          >
            {loading ? "Kaydediliyor..." : "Şifreyi Güncelle"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
