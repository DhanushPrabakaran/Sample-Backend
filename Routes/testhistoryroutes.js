const express = require('express');
const router = express.Router();
const authMiddleware = require('../Middlewares/authMiddleware');
const TestHistory = require('../Models/testhistory');
const { exec } = require('child_process');
const axios = require('axios');
const cheerio = require('cheerio');

router.post('/scan', authMiddleware, async (req, res) => {
    const { website } = req.body;
    if (!website) return res.status(400).json({ message: "Website URL required" });

    try {
        // Crawling website
        const response = await axios.get(website);
        const $ = cheerio.load(response.data);
        let techStack = [];

        $('script').each((i, script) => {
            if (script.attribs.src) techStack.push(script.attribs.src);
        });

        // Run vulnerability scan (example using a shell script)
        exec(`nikto -h ${website}`, (error, stdout, stderr) => {
            if (error) {
                return res.status(500).json({ message: "Scanning Error", error });
            }

            const vulnerabilities = stdout.split("\n").filter(line => line.includes("OSVDB"));

            // Save scan result
            const newScan = new TestHistory({ user: req.user.id, website, techStack, vulnerabilities });
            newScan.save();

            res.json({ website, techStack, vulnerabilities });
        });

    } catch (err) {
        res.status(500).json({ message: "Website Crawling Failed", error: err.message });
    }
});

module.exports = router;
