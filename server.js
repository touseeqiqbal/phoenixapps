const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const formsRouter = require("./routes/forms");
const workspacesRouter = require("./routes/workspaces");
const publicRouter = require("./routes/public");
const authRouter = require("./routes/auth");
const packagesRouter = require("./routes/packages");
const submissionsRouter = require("./routes/submissions");
const { authRequired } = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRouter);
app.use("/api/packages", packagesRouter);
app.use("/api/forms", authRequired, formsRouter);
app.use("/api/workspaces", authRequired, workspacesRouter);
app.use("/api/submissions", authRequired, submissionsRouter);
app.use("/api/public", publicRouter);

// Serve static files from public/dist in production, or public in development
const publicDir = path.join(__dirname, "public");
const distDir = path.join(publicDir, "dist");

// Check if dist directory exists (production build)
const staticDir = require("fs").existsSync(distDir) ? distDir : publicDir;
app.use(express.static(staticDir));

// Serve index.html for all non-API routes (SPA routing)
app.use((req, res, next) => {
  if (req.method === "GET" && !req.path.startsWith("/api")) {
    const indexPath = require("fs").existsSync(distDir) 
      ? path.join(distDir, "index.html")
      : path.join(publicDir, "index.html");
    return res.sendFile(indexPath);
  }
  return next();
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
