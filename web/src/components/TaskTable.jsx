import { useState } from "react";
import Icon from "./Icon.jsx";

const PRIORITY = {
  LOW: { label: "Düşük", cls: "low", order: 1 },
  MEDIUM: { label: "Orta", cls: "medium", order: 2 },
  HIGH: { label: "Yüksek", cls: "high", order: 3 },
};

function formatDate(value) {
  return new Date(value).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Panodaki tum gorevleri tek bir tabloda listeler (Notion database gorunumu gibi).
export default function TaskTable({ columns, onOpenTask }) {
  const [sortKey, setSortKey] = useState("status");
  const [sortDir, setSortDir] = useState("asc");

  // Tum gorevleri, ait olduklari sutun adiyla birlikte tek listeye ac
  const rows = [];
  columns.forEach((col, ci) => {
    col.tasks.forEach((task) => {
      rows.push({ task, status: col.name, statusOrder: ci });
    });
  });

  const valueOf = (row, key) => {
    const t = row.task;
    if (key === "title") return t.title.toLowerCase();
    if (key === "priority") return PRIORITY[t.priority]?.order || 0;
    if (key === "due") return t.dueDate ? new Date(t.dueDate).getTime() : Infinity;
    if (key === "assignee") return t.assignee ? t.assignee.name.toLowerCase() : "￿";
    return row.statusOrder;
  };

  const sorted = [...rows].sort((a, b) => {
    const av = valueOf(a, sortKey);
    const bv = valueOf(b, sortKey);
    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const Th = ({ sortId, children }) => (
    <th
      className={sortKey === sortId ? "th-sortable sorted" : "th-sortable"}
      onClick={() => toggleSort(sortId)}
    >
      <span className="th-inner">
        {children}
        {sortKey === sortId && (
          <Icon name={sortDir === "asc" ? "chevron-down" : "chevron-right"} size={13} />
        )}
      </span>
    </th>
  );

  if (rows.length === 0) {
    return (
      <div className="content">
        <div className="empty-state">
          <span className="empty-icon">
            <Icon name="table" size={26} />
          </span>
          <h3>Bu panoda görev yok</h3>
          <p>Pano görünümünden kart ekleyerek başla.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="content">
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <Th sortId="title">Başlık</Th>
              <Th sortId="status">Durum</Th>
              <Th sortId="priority">Öncelik</Th>
              <Th sortId="assignee">Atanan</Th>
              <Th sortId="due">Son Tarih</Th>
              <th>Etiketler</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => {
              const t = row.task;
              const pr = PRIORITY[t.priority] || PRIORITY.MEDIUM;
              return (
                <tr key={t.id} onClick={() => onOpenTask(t)}>
                  <td className="cell-title">{t.title}</td>
                  <td>
                    <span className="status-pill">{row.status}</span>
                  </td>
                  <td>
                    <span className={`badge prio-${pr.cls}`}>{pr.label}</span>
                  </td>
                  <td>
                    {t.assignee ? (
                      <span className="assignee-cell">
                        <span className="assignee">
                          {t.assignee.name[0].toUpperCase()}
                        </span>
                        {t.assignee.name}
                      </span>
                    ) : (
                      <span className="cell-empty">—</span>
                    )}
                  </td>
                  <td>
                    {t.dueDate ? (
                      <span className="due-cell">
                        <Icon name="calendar" size={13} /> {formatDate(t.dueDate)}
                      </span>
                    ) : (
                      <span className="cell-empty">—</span>
                    )}
                  </td>
                  <td>
                    {t.labels && t.labels.length > 0 ? (
                      <span className="table-labels">
                        {t.labels.map((tl) => (
                          <span
                            key={tl.id}
                            className="table-label-dot"
                            style={{ background: tl.label.color }}
                            title={tl.label.name}
                          />
                        ))}
                      </span>
                    ) : (
                      <span className="cell-empty">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
