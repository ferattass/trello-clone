import Sidebar from "./Sidebar.jsx";

// Tum korumali sayfalari saran kabuk: solda sabit sidebar, sagda icerik.
export default function Layout({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main">{children}</main>
    </div>
  );
}
