import { useState } from "react";

export default function TaskModal({ task, members, onClose, onSave, onDelete }) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [priority, setPriority] = useState(task.priority || "MEDIUM");
  const [dueDate, setDueDate] = useState(task.dueDate ? task.dueDate.slice(0, 10) : "");
  const [assigneeId, setAssigneeId] = useState(task.assignee ? String(task.assignee.id) : "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onSave(task.id, {
        title: title.trim(),
        description: description ? description : null,
        priority,
        dueDate: dueDate ? dueDate : null,
        assigneeId: assigneeId ? Number(assigneeId) : null,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <input
            className="modal-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <label>Açıklama</label>
        <textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Görev detayı..."
        />

        <div className="modal-row">
          <div>
            <label>Öncelik</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="LOW">Düşük</option>
              <option value="MEDIUM">Orta</option>
              <option value="HIGH">Yüksek</option>
            </select>
          </div>
          <div>
            <label>Son Tarih</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <label>Atanan Kişi</label>
        <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
          <option value="">— Atanmadı —</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>

        <div className="modal-actions">
          <button className="danger" onClick={() => onDelete(task.id)}>
            Sil
          </button>
          <div className="spacer" />
          <button className="ghost" onClick={onClose}>
            İptal
          </button>
          <button onClick={save} disabled={saving}>
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}
