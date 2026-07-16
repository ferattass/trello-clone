import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Icon from "./Icon.jsx";

const PRIORITY = {
  LOW: { label: "Düşük", cls: "low" },
  MEDIUM: { label: "Orta", cls: "medium" },
  HIGH: { label: "Yüksek", cls: "high" },
};

function formatDate(value) {
  return new Date(value).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
  });
}

export default function TaskCard({ task, onOpen }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const pr = PRIORITY[task.priority] || PRIORITY.MEDIUM;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="task-card"
      onClick={() => {
        // Surukleme bittiginde click tetiklenmesin (yanlislikla modal acmasin)
        if (!isDragging) onOpen(task);
      }}
    >
      {task.labels && task.labels.length > 0 && (
        <div className="card-labels">
          {task.labels.map((tl) => (
            <span
              key={tl.id}
              className="card-label"
              style={{ background: tl.label.color }}
              title={tl.label.name}
            />
          ))}
        </div>
      )}
      <div className="task-title">{task.title}</div>
      <div className="task-meta">
        <span className={`badge prio-${pr.cls}`}>{pr.label}</span>
        {task.dueDate && (
          <span className="badge due">
            <Icon name="calendar" size={12} /> {formatDate(task.dueDate)}
          </span>
        )}
        {task.assignee && (
          <span className="assignee" title={task.assignee.name}>
            {task.assignee.name[0].toUpperCase()}
          </span>
        )}
      </div>
    </div>
  );
}
