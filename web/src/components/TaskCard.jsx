import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function TaskCard({ task }) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="task-card"
    >
      <span>{task.title}</span>
      {task.assignee && (
        <span className="assignee" title={task.assignee.name}>
          {task.assignee.name[0].toUpperCase()}
        </span>
      )}
    </div>
  );
}
