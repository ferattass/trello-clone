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
import socket from "../api/socket.js";
import Column from "../components/Column.jsx";
import AddColumn from "../components/AddColumn.jsx";
import TaskModal from "../components/TaskModal.jsx";
import TaskTable from "../components/TaskTable.jsx";
import Icon from "../components/Icon.jsx";

export default function Board() {
  const { id } = useParams();
  const [projectName, setProjectName] = useState("");
  const [columns, setColumns] = useState([]);
  const [members, setMembers] = useState([]);
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTask, setActiveTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [view, setView] = useState("board");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const load = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      const project = res.data.project;
      setProjectName(project.name);
      setColumns(project.columns);
      setLabels(project.labels || []);

      // Atanabilir kisiler: proje uyeleri + (varsa) takim uyeleri, tekillestirilmis
      const projectUsers = project.members.map((m) => m.user);
      const teamUsers = project.team ? project.team.members.map((m) => m.user) : [];
      const unique = Array.from(
        new Map([...projectUsers, ...teamUsers].map((u) => [u.id, u])).values()
      );
      setMembers(unique);
    } catch (err) {
      setError(err.response?.data?.message || "Pano yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  // Gerçek zamanlı: bu projenin odasına katıl; değişiklik gelince panoyu tazele
  useEffect(() => {
    socket.emit("join-project", id);
    const onUpdate = () => load();
    socket.on("board:updated", onUpdate);
    return () => {
      socket.emit("leave-project", id);
      socket.off("board:updated", onUpdate);
    };
  }, [id]);

  const addTask = async (columnId, title) => {
    await api.post(`/columns/${columnId}/tasks`, { title });
    load();
  };

  const addColumn = async (name) => {
    await api.post(`/projects/${id}/columns`, { name });
    load();
  };

  const deleteColumn = async (columnId) => {
    await api.delete(`/columns/${columnId}`);
    load();
  };

  const saveTask = async (taskId, data) => {
    await api.put(`/tasks/${taskId}`, data);
    setSelectedTask(null);
    load();
  };

  const removeTask = async (taskId) => {
    await api.delete(`/tasks/${taskId}`);
    setSelectedTask(null);
    load();
  };

  // ---- Sürükle-bırak yardımcıları ----
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

    if (sourceCol.id === destCol.id && activeIndex === overIndex) return;

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
      load();
    }
  };

  if (loading) {
    return <div className="center">Yükleniyor...</div>;
  }

  if (error) {
    return (
      <div className="center">
        <div style={{ textAlign: "center" }}>
          <p className="muted" style={{ marginBottom: 12 }}>{error}</p>
          <Link to="/" className="back">
            <Icon name="arrow-left" size={16} /> Projelere dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="board-page">
      <header className="topbar">
        <div className="board-title">
          <Link to="/" className="back">
            <Icon name="arrow-left" size={16} /> Projeler
          </Link>
          <h1>{projectName}</h1>
        </div>
        <div className="view-switch">
          <button
            type="button"
            className={view === "board" ? "active" : ""}
            onClick={() => setView("board")}
          >
            <Icon name="board" size={15} /> Pano
          </button>
          <button
            type="button"
            className={view === "table" ? "active" : ""}
            onClick={() => setView("table")}
          >
            <Icon name="table" size={15} /> Tablo
          </button>
        </div>
      </header>

      {view === "board" ? (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="board">
          {columns.map((column) => (
            <Column
              key={column.id}
              column={column}
              onAddTask={addTask}
              onOpenTask={setSelectedTask}
              onDeleteColumn={deleteColumn}
            />
          ))}
          <AddColumn onAdd={addColumn} />
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="task-card dragging">
              <div className="task-title">{activeTask.title}</div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      ) : (
        <TaskTable columns={columns} onOpenTask={setSelectedTask} />
      )}

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          members={members}
          projectLabels={labels}
          onClose={() => setSelectedTask(null)}
          onSave={saveTask}
          onDelete={removeTask}
          onChange={load}
        />
      )}
    </div>
  );
}
