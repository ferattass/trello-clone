import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import TaskCard from "./TaskCard.jsx";
import Icon from "./Icon.jsx";

export default function Column({ column, onAddTask, onOpenTask, onDeleteColumn }) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");

  // Sutunun govdesi "birakma alani" (bos sutuna da kart birakilabilsin)
  const { setNodeRef } = useDroppable({ id: `column:${column.id}` });
  const taskIds = column.tasks.map((t) => t.id);

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await onAddTask(column.id, title.trim());
    setTitle("");
    setAdding(false);
  };

  const handleDelete = () => {
    const msg =
      column.tasks.length > 0
        ? `"${column.name}" sütunu ve içindeki ${column.tasks.length} kart silinsin mi?`
        : `"${column.name}" sütunu silinsin mi?`;
    if (window.confirm(msg)) {
      onDeleteColumn(column.id);
    }
  };

  return (
    <div className="column">
      <div className="column-head">
        <h3>{column.name}</h3>
        <span className="count">{column.tasks.length}</span>
        <button
          className="col-del"
          onClick={handleDelete}
          title="Sütunu sil"
          aria-label="Sütunu sil"
        >
          <Icon name="x" size={13} />
        </button>
      </div>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="task-list" ref={setNodeRef}>
          {column.tasks.map((task) => (
            <TaskCard key={task.id} task={task} onOpen={onOpenTask} />
          ))}
        </div>
      </SortableContext>

      {adding ? (
        <form onSubmit={submit} className="add-form">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Kart başlığı..."
          />
          <div className="add-actions">
            <button type="submit">Ekle</button>
            <button type="button" className="ghost" onClick={() => setAdding(false)}>
              İptal
            </button>
          </div>
        </form>
      ) : (
        <button className="add-card-btn" onClick={() => setAdding(true)}>
          + Kart ekle
        </button>
      )}
    </div>
  );
}
