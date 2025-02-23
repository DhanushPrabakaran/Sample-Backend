const mongoose = require("mongoose");

const TestHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  website: { type: String, required: true },
  techStack: { type: Object },
  vulnerabilities: { type: Object },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("TestHistory", TestHistorySchema);
