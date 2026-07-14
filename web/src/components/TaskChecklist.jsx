import { useState, useEffect } from "react";
import api from "../api/client.js";
import "../styles/card-detail.css";

export default function TaskChecklist({ taskId, onChange }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newText, setNewText] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api
      .get(`/checklist/task/${taskId}`)
      .then((res) => {
        if (active) {
          setItems(res.data.items || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [taskId]);

  const total = items.length;
  const doneCount = items.filter((i) => i.done).length;
  const pct = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  const toggleItem = async (item) => {
    setError("");
    try {
      const res = await api.put(`/checklist/${item.id}`, { done: !item.done });
      setItems((prev) => prev.map((i) => (i.id === item.id ? res.data.item : i)));
      onChange && onChange();
    } catch (err) {
      setError(err.response?.data?.message || "Durum güncellenemedi.");
    }
  };

  const deleteItem = async (id) => {
    setError("");
    try {
      await api.delete(`/checklist/${id}`);
      setItems((prev) => prev.filter((i) => i.id !== id));
      onChange && onChange();
    } catch (err) {
      setError(err.response?.data?.message || "Madde silinemedi.");
    }
  };

  const addItem = async (e) => {
    e.preventDefault();
    if (!newText.trim()) return;
    setAdding(true);
    setError("");
    try {
      const res = await api.post(`/checklist/task/${taskId}`, { text: newText.trim() });
      setItems((prev) => [...prev, res.data.item]);
      setNewText("");
      onChange && onChange();
    } catch (err) {
      setError(err.response?.data?.message || "Madde eklenemedi.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="cd-section">
      <div className="cd-section-title">Yapılacaklar</div>

      {error && <div className="cd-error">{error}</div>}

      {loading ? (
        <p className="cd-muted">Yükleniyor...</p>
      ) : (
        <>
          {total > 0 && (
            <div className="checklist-progress">
              <span className="checklist-progress-label">{pct}%</span>
              <div className="checklist-progress-track">
                <div
                  className={`checklist-progress-fill${pct === 100 ? " complete" : ""}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="checklist-progress-label" style={{ textAlign: "right" }}>
                {doneCount}/{total}
              </span>
            </div>
          )}

          {items.length > 0 && (
            <div className="checklist-list">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`checklist-item${item.done ? " done" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => toggleItem(item)}
                  />
                  <span className="checklist-text">{item.text}</span>
                  <button
                    className="checklist-remove"
                    onClick={() => deleteItem(item.id)}
                    title="Kaldır"
                  >
                    &#x2715;
                  </button>
                </div>
              ))}
            </div>
          )}

          <form className="checklist-add-form" onSubmit={addItem}>
            <input
              type="text"
              placeholder="Yeni madde ekle..."
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
            />
            <button
              type="submit"
              className="cd-btn-primary"
              disabled={adding || !newText.trim()}
            >
              {adding ? "Ekleniyor..." : "Ekle"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
