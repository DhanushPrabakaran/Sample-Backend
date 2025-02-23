const { parentPort, workerData } = require("worker_threads");
const puppeteer = require("puppeteer");
const { exec } = require("child_process");
const connectDB = require("../Config/db");
const TestHistory = require("../Models/Testhistory");
connectDB();
async function scanWebsite(url) {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    const techStack = {}; // Placeholder for tech detection
    await browser.close();

    exec(`nikto -h ${url}`, async (error, stdout, stderr) => {
      const vulnerabilities = error ? stderr : stdout;

      // Save to MongoDB
      const scanResult = new TestHistory({
        user: workerData.user, // Pass user from the main thread
        website: url,
        techStack,
        vulnerabilities,
      });
      console.log(scanResult);
      await scanResult.save();
      parentPort.postMessage({ url, techStack, vulnerabilities });
    });
  } catch (err) {
    parentPort.postMessage({ error: err.message });
  }
}

// const TestHistorySchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   website: { type: String, required: true },
//   techStack: { type: Object },
//   vulnerabilities: { type: Object },
//   createdAt: { type: Date, default: Date.now },
// });
scanWebsite(workerData.url);
