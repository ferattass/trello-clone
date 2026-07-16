import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import AuthShell from "../components/AuthShell.jsx";
import Icon from "../components/Icon.jsx";

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Şifreni mi unuttun?"
      subtitle="E-posta adresini gir, sana sıfırlama bağlantısı gönderelim"
      footer={
        <Link to="/login" className="back-link">
          <Icon name="arrow-left" size={16} /> Girişe dön
        </Link>
      }
    >
      {sent ? (
        <div className="success">
          Eğer bu e-posta kayıtlıysa, sıfırlama bağlantısı gönderildi. Lütfen
          gelen kutunu kontrol et.
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
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
          <button type="submit" disabled={loading}>
            {loading ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
