import { useState } from "react";

export default function AddColumn({ onAdd }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onAdd(name.trim());
    setName("");
    setAdding(false);
  };

  if (!adding) {
    return (
      <button className="add-column-btn" onClick={() => setAdding(true)}>
        + Sütun ekle
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="add-column-form">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Sütun adı..."
      />
      <div className="add-actions">
        <button type="submit">Ekle</button>
        <button type="button" className="ghost" onClick={() => setAdding(false)}>
          İptal
        </button>
      </div>
    </form>
  );
}
