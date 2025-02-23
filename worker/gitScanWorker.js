const { parentPort, workerData } = require("worker_threads");
const { exec } = require("child_process");
const fs = require("fs");
const TestHistory = require("../Models/TestHistory");

// Connect to MongoDB

async function scanRepository(repoPath) {
  try {
    if (!fs.existsSync(repoPath)) {
      throw new Error("Repository path does not exist");
    }

    exec(`trivy fs "${repoPath}"`, async (error, stdout, stderr) => {
      const vulnerabilities = error ? stderr : stdout;

      // Save to MongoDB
      const scanResult = new TestHistory({
        user: workerData.userId, // Pass userId from main thread
        website: repoPath,
        techStack: {}, // Not applicable here
        vulnerabilities,
      });

      await scanResult.save();
      parentPort.postMessage({ repoPath, vulnerabilities });
    });
  } catch (err) {
    parentPort.postMessage({ error: err.message });
  }
}

scanRepository(workerData.repoPath);
