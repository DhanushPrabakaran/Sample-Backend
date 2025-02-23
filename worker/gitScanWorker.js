const { parentPort, workerData } = require("worker_threads");
const { exec } = require("child_process");
const fs = require("fs");
const connectDB = require("../Config/db");
const TestHistory = require("../Models/Testhistory");

// Connect to MongoDB
connectDB();
async function scanRepository(repoPath) {
  try {
    if (!fs.existsSync(repoPath)) {
      throw new Error("Repository path does not exist");
    }

    exec(`trivy fs "${repoPath}"`, async (error, stdout, stderr) => {
      const vulnerabilities = error ? stderr : stdout;

      // Save to MongoDB
      const scanResult = new TestHistory({
        user: workerData.user, // Pass user from main thread
        website: repoPath,
        techStack: {},
        vulnerabilities: vulnerabilities || {},
      });

      await scanResult.save();
      parentPort.postMessage({ repoPath, vulnerabilities });
    });
  } catch (err) {
    parentPort.postMessage({ error: err.message });
  }
}

scanRepository(workerData.repoPath);
