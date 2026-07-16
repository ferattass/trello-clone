import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sayfa yenilenince: token varsa kullaniciyi backend'den geri getir
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
  };

  const register = async (name, email, password) => {
    const res = await api.post("/auth/register", { name, email, password });
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  // Profil guncellenince (orn. ad degisince) kullaniciyi tazele
  const updateUser = (updated) => setUser(updated);

  // Sifremi unuttum: maile sifirlama baglantisi istenir
  const forgotPassword = (email) =>
    api.post("/auth/forgot-password", { email }).then((res) => res.data);

  // Maildeki jeton ile yeni sifre belirlenir
  const resetPassword = (token, password) =>
    api.post("/auth/reset-password", { token, password }).then((res) => res.data);

  // Maildeki jeton ile e-posta dogrulanir
  const verifyEmail = (token) =>
    api.post("/auth/verify-email", { token }).then((res) => res.data);

  // Dogrulama maili tekrar istenir
  const resendVerification = (email) =>
    api.post("/auth/resend-verification", { email }).then((res) => res.data);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        forgotPassword,
        resetPassword,
        verifyEmail,
        resendVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
