import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client.js";
import "../styles/notifications.css";

export default function NotificationBell() {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  useEffect(() => {
    api
      .get("/notifications/unread-count")
      .then((res) => setUnreadCount(res.data.count))
      .catch(() => {});
  }, []);

  const openDropdown = async () => {
    setOpen(true);
    setListLoading(true);
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications);
    } catch {
      // sessizce geç
    } finally {
      setListLoading(false);
    }
  };

  const closeDropdown = () => setOpen(false);

  const handleBellClick = () => {
    if (open) {
      closeDropdown();
    } else {
      openDropdown();
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      try {
        await api.put(`/notifications/${notif.id}/read`);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // yoksay
      }
    }
    closeDropdown();
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // yoksay
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="notif-wrapper">
      {open && <div className="notif-overlay" onClick={closeDropdown} />}
      <button
        className="notif-bell"
        onClick={handleBellClick}
        title="Bildirimler"
      >
        🔔
        {unreadCount > 0 && (
          <span className="notif-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <span>Bildirimler</span>
            {unreadCount > 0 && (
              <button className="notif-mark-all" onClick={handleMarkAllRead}>
                Tümünü okundu işaretle
              </button>
            )}
          </div>
          {listLoading ? (
            <p className="notif-empty">Yükleniyor...</p>
          ) : notifications.length === 0 ? (
            <p className="notif-empty">Henüz bildirim yok.</p>
          ) : (
            <ul className="notif-list">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={`notif-item${n.read ? "" : " notif-unread"}`}
                  onClick={() => handleNotificationClick(n)}
                >
                  <p className="notif-text">{n.text}</p>
                  <span className="notif-date">{formatDate(n.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
