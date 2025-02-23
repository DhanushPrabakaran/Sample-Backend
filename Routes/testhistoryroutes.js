const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const { Worker } = require("worker_threads");
const simpleGit = require("simple-git");
const TestHistory = require("../Models/TestHistory");

router.post("/scan", async (req, res) => {
  const { url, user } = req.body;
  if (!url || !user)
    return res.status(400).json({ error: "URL and user are required" });

  const worker = new Worker(path.join(__dirname, "workers", "scanWorker.js"), {
    workerData: { url, user },
  });

  worker.on("message", async (result) => {
    console.log("Scan Completed:", result);
  });
  worker.on("error", (err) => console.error("Worker Error:", err));
  worker.on("exit", (code) => console.log(`Worker exited with code ${code}`));

  res.json({ message: "Scan started in background", url });
});

router.post("/git-scan", async (req, res) => {
  const { repoUrl, user } = req.body;
  if (!repoUrl || !user)
    return res
      .status(400)
      .json({ error: "Repository URL and user are required" });

  const repoPath = path.join(__dirname, "repos", path.basename(repoUrl));
  if (fs.existsSync(repoPath))
    await fs.promises.rm(repoPath, { recursive: true, force: true });

  simpleGit().clone(repoUrl, repoPath, (err) => {
    if (err)
      return res.status(500).json({ error: "Failed to clone repository" });

    const worker = new Worker(
      path.join(__dirname, "workers", "gitScanWorker.js"),
      {
        workerData: { repoPath, user },
      }
    );

    worker.on("message", async (result) => {
      console.log("Git Scan Completed:", result);
    });
    worker.on("error", (err) => console.error("Worker Error:", err));
    worker.on("exit", (code) => console.log(`Worker exited with code ${code}`));

    res.json({ message: "Repository scan started in background", repoUrl });
  });
});

module.exports = router;
