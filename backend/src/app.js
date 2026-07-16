import express from "express";
import cors from "cors";
import helmet from "helmet";
import { clientOrigins } from "./utils/clientOrigins.js";
import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import columnRoutes from "./routes/column.routes.js";
import taskRoutes from "./routes/task.routes.js";
import teamRoutes from "./routes/team.routes.js";
import labelRoutes from "./routes/label.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import checklistRoutes from "./routes/checklist.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import activityRoutes from "./routes/activity.routes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();

// Render/Vercel gibi ters vekil arkasinda dogru IP icin (rate-limit'e gerekli)
app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({ origin: clientOrigins }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/columns", columnRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/labels", labelRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/checklist", checklistRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/activity", activityRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
