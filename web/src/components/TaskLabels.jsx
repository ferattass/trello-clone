import { useState } from "react";
import api from "../api/client.js";
import "../styles/card-detail.css";

const PRESET_COLORS = ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7", "#64748b"];

export default function TaskLabels({ task, projectLabels, onChange }) {
  const [labels, setLabels] = useState(task.labels || []);
  const [mode, setMode] = useState(null); // null | "pick" | "create"
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const addedIds = labels.map((tl) => tl.labelId);
  const available = (projectLabels || []).filter((pl) => !addedIds.includes(pl.id));

  const removeLabel = async (tl) => {
    setError("");
    try {
      await api.delete(`/labels/task/${task.id}/${tl.labelId}`);
      setLabels((prev) => prev.filter((l) => l.labelId !== tl.labelId));
      onChange && onChange();
    } catch (err) {
      setError(err.response?.data?.message || "Etiket kaldırılırken bir hata oluştu.");
    }
  };

  const pickLabel = async (labelId) => {
    setError("");
    try {
      await api.post(`/labels/task/${task.id}`, { labelId });
      const picked = (projectLabels || []).find((pl) => pl.id === labelId);
      if (picked) {
        setLabels((prev) => [
          ...prev,
          { id: Date.now(), labelId: picked.id, label: picked },
        ]);
      }
      setMode(null);
      onChange && onChange();
    } catch (err) {
      setError(err.response?.data?.message || "Etiket eklenemedi.");
    }
  };

  const createLabel = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setError("");
    setCreating(true);
    try {
      const { data: labelData } = await api.post(`/labels/project/${task.projectId}`, {
        name: newName.trim(),
        color: newColor,
      });
      const label = labelData.label;
      await api.post(`/labels/task/${task.id}`, { labelId: label.id });
      setLabels((prev) => [
        ...prev,
        { id: Date.now(), labelId: label.id, label },
      ]);
      setNewName("");
      setNewColor(PRESET_COLORS[0]);
      setMode(null);
      onChange && onChange();
    } catch (err) {
      setError(err.response?.data?.message || "Etiket oluşturulamadı.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="cd-section">
      <div className="cd-section-title">Etiketler</div>

      {error && <div className="cd-error">{error}</div>}

      <div className="label-chips">
        {labels.map((tl) => (
          <span
            key={tl.labelId}
            className="label-chip"
            style={{ backgroundColor: tl.label?.color || "#64748b" }}
          >
            {tl.label?.name}
            <button
              className="label-chip-remove"
              onClick={() => removeLabel(tl)}
              title="Kaldır"
            >
              &#x2715;
            </button>
          </span>
        ))}

        {mode === null && (
          <button className="label-add-btn" onClick={() => setMode("pick")}>
            + Etiket ekle
          </button>
        )}
      </div>

      {mode === "pick" && (
        <div className="label-add-dropdown">
          {available.length > 0 ? (
            <ul className="label-select-list">
              {available.map((pl) => (
                <li
                  key={pl.id}
                  className="label-select-item"
                  onClick={() => pickLabel(pl.id)}
                >
                  <span
                    className="label-color-dot"
                    style={{ backgroundColor: pl.color }}
                  />
                  {pl.name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="cd-muted">Eklenecek başka etiket kalmadı.</p>
          )}
          <div className="label-dropdown-actions">
            <button className="cd-link-btn" onClick={() => setMode("create")}>
              Yeni etiket oluştur
            </button>
            <button className="cd-link-btn muted" onClick={() => setMode(null)}>
              Kapat
            </button>
          </div>
        </div>
      )}

      {mode === "create" && (
        <form className="cd-create-form" onSubmit={createLabel}>
          <input
            className="cd-input"
            type="text"
            placeholder="Etiket adı"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
          />
          <div className="color-picker">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className={`color-swatch${newColor === c ? " selected" : ""}`}
                style={{ backgroundColor: c }}
                onClick={() => setNewColor(c)}
                title={c}
              />
            ))}
          </div>
          <div className="cd-form-actions">
            <button type="submit" className="cd-btn-primary" disabled={creating}>
              {creating ? "Oluşturuluyor..." : "Oluştur ve Ekle"}
            </button>
            <button
              type="button"
              className="cd-btn-ghost"
              onClick={() => setMode(null)}
            >
              İptal
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
