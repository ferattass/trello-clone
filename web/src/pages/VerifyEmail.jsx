import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import AuthShell from "../components/AuthShell.jsx";
import Icon from "../components/Icon.jsx";

export default function VerifyEmail() {
  const { verifyEmail } = useAuth();
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [status, setStatus] = useState("loading"); // loading | success | error
  const ran = useRef(false);

  useEffect(() => {
    // StrictMode gelistirmede effect'i iki kez calistirir; jeton bir kez
    // kullanildiginda ikinci cagri hata verir. Bu yuzden tek sefer calistir.
    if (ran.current) return;
    ran.current = true;

    if (!token) {
      setStatus("error");
      return;
    }
    verifyEmail(token)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [token, verifyEmail]);

  return (
    <AuthShell
      title="E-posta Doğrulama"
      footer={
        <Link to="/login" className="back-link">
          <Icon name="arrow-left" size={16} /> Girişe dön
        </Link>
      }
    >
      {status === "loading" && (
        <p className="muted auth-center-text">Doğrulanıyor, lütfen bekle...</p>
      )}
      {status === "success" && (
        <div className="success">
          E-posta adresin başarıyla doğrulandı. Artık tüm özellikleri
          kullanabilirsin.
        </div>
      )}
      {status === "error" && (
        <div className="error">
          Doğrulama bağlantısı geçersiz veya süresi dolmuş.
        </div>
      )}
    </AuthShell>
  );
}
