const { parentPort, workerData } = require("worker_threads");
const puppeteer = require("puppeteer");
const { exec } = require("child_process");

const TestHistory = require("../Models/TestHistory");

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
        user: workerData.userId, // Pass userId from the main thread
        website: url,
        techStack,
        vulnerabilities,
      });

      await scanResult.save();
      parentPort.postMessage({ url, techStack, vulnerabilities });
    });
  } catch (err) {
    parentPort.postMessage({ error: err.message });
  }
}

scanWebsite(workerData.url);
