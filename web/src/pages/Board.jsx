import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import api from "../api/client.js";
import Column from "../components/Column.jsx";
import AddColumn from "../components/AddColumn.jsx";

export default function Board() {
  const { id } = useParams();
  const [projectName, setProjectName] = useState("");
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState(null);

  // Kart en az 6px surukleninde tutulmus sayilir (yoksa tiklamayla karisir)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const load = async () => {
    const res = await api.get(`/projects/${id}`);
    setProjectName(res.data.project.name);
    setColumns(res.data.project.columns);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [id]);

  const addTask = async (columnId, title) => {
    await api.post(`/columns/${columnId}/tasks`, { title });
    load();
  };

  const addColumn = async (name) => {
    await api.post(`/projects/${id}/columns`, { name });
    load();
  };

  // ---- Surukle-birak yardimcilari ----
  const isColumnDroppable = (overId) =>
    typeof overId === "string" && overId.startsWith("column:");

  const columnOfTask = (taskId) =>
    columns.find((c) => c.tasks.some((t) => t.id === taskId));

  const columnFromOverId = (overId) => {
    if (isColumnDroppable(overId)) {
      const cid = Number(overId.split(":")[1]);
      return columns.find((c) => c.id === cid);
    }
    return columnOfTask(overId);
  };

  const handleDragStart = (event) => {
    const task = columns
      .flatMap((c) => c.tasks)
      .find((t) => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const sourceCol = columnOfTask(activeId);
    const destCol = columnFromOverId(overId);
    if (!sourceCol || !destCol) return;

    const activeIndex = sourceCol.tasks.findIndex((t) => t.id === activeId);
    let overIndex;
    if (isColumnDroppable(overId)) {
      overIndex = destCol.tasks.length;
    } else {
      overIndex = destCol.tasks.findIndex((t) => t.id === overId);
      if (overIndex === -1) overIndex = destCol.tasks.length;
    }

    // Ayni yerde birakildiysa bir sey yapma
    if (sourceCol.id === destCol.id && activeIndex === overIndex) return;

    // Yeni durumu hesapla (ekrani aninda guncelle - iyimser guncelleme)
    const next = columns.map((c) => ({ ...c, tasks: [...c.tasks] }));
    const nSource = next.find((c) => c.id === sourceCol.id);
    const nDest = next.find((c) => c.id === destCol.id);

    if (sourceCol.id === destCol.id) {
      const to = Math.min(overIndex, nDest.tasks.length - 1);
      nDest.tasks = arrayMove(nDest.tasks, activeIndex, to);
    } else {
      const [moved] = nSource.tasks.splice(activeIndex, 1);
      nDest.tasks.splice(overIndex, 0, moved);
    }

    setColumns(next);

    // Backend'e kalici kaydet: hedef (ve farkliysa kaynak) sutun sirasi
    try {
      await api.put(`/columns/${nDest.id}/reorder`, {
        taskIds: nDest.tasks.map((t) => t.id),
      });
      if (nSource.id !== nDest.id) {
        await api.put(`/columns/${nSource.id}/reorder`, {
          taskIds: nSource.tasks.map((t) => t.id),
        });
      }
    } catch {
      load(); // hata olursa backend'den tazele
    }
  };

  if (loading) {
    return <div className="center">Yükleniyor...</div>;
  }

  return (
    <div className="board-page">
      <header className="topbar">
        <div className="board-title">
          <Link to="/" className="back">
            ← Projeler
          </Link>
          <h1>{projectName}</h1>
        </div>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="board">
          {columns.map((column) => (
            <Column key={column.id} column={column} onAddTask={addTask} />
          ))}
          <AddColumn onAdd={addColumn} />
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="task-card dragging">
              <span>{activeTask.title}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
