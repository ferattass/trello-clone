import { useState, useEffect } from "react";
import api from "../api/client.js";
import "../styles/card-detail.css";

export default function TaskComments({ taskId, onChange }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api
      .get(`/comments/task/${taskId}`)
      .then((res) => {
        if (active) {
          setComments(res.data.comments || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [taskId]);

  const deleteComment = async (id) => {
    setError("");
    try {
      await api.delete(`/comments/${id}`);
      setComments((prev) => prev.filter((c) => c.id !== id));
      onChange && onChange();
    } catch (err) {
      setError(err.response?.data?.message || "Yorum silinemedi.");
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await api.post(`/comments/task/${taskId}`, { text: text.trim() });
      setComments((prev) => [...prev, res.data.comment]);
      setText("");
      onChange && onChange();
    } catch (err) {
      setError(err.response?.data?.message || "Yorum gönderilemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cd-section">
      <div className="cd-section-title">Yorumlar</div>

      {error && <div className="cd-error">{error}</div>}

      {loading ? (
        <p className="cd-muted">Yükleniyor...</p>
      ) : (
        <>
          {comments.length > 0 ? (
            <div className="comment-list">
              {comments.map((c) => (
                <div key={c.id} className="comment-item">
                  <div className="comment-header">
                    <span className="comment-author">{c.user?.name || "Kullanıcı"}</span>
                    <span className="comment-date">
                      {new Date(c.createdAt).toLocaleString("tr-TR")}
                    </span>
                  </div>
                  <p className="comment-text">{c.text}</p>
                  <button
                    className="comment-remove"
                    onClick={() => deleteComment(c.id)}
                    title="Yorumu sil"
                  >
                    &#x2715;
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="cd-muted" style={{ marginBottom: "12px" }}>
              Henüz yorum yapılmamış.
            </p>
          )}

          <form className="comment-form" onSubmit={submitComment}>
            <textarea
              placeholder="Bir yorum yaz..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
            />
            <div>
              <button
                type="submit"
                className="cd-btn-primary"
                disabled={submitting || !text.trim()}
              >
                {submitting ? "Gönderiliyor..." : "Yorum Yap"}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
