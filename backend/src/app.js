import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import columnRoutes from "./routes/column.routes.js";
import taskRoutes from "./routes/task.routes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/columns", columnRoutes);
app.use("/api/tasks", taskRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
