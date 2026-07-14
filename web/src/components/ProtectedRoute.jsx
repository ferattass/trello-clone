import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

// Giris yapmamis kullaniciyi login sayfasina yonlendirir
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="center">Yukleniyor...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
