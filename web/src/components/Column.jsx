import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import TaskCard from "./TaskCard.jsx";

export default function Column({ column, onAddTask }) {
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

  return (
    <div className="column">
      <div className="column-head">
        <h3>{column.name}</h3>
        <span className="count">{column.tasks.length}</span>
      </div>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="task-list" ref={setNodeRef}>
          {column.tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
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
