require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./Config/db");

const authRoutes = require("./Routes/authroutes");
const scanRoutes = require("./Routes/testhistoryroutes");

const app = express();

// ✅ Enable CORS for Frontend
app.use(cors());

app.use(express.json());

// ✅ Connect to MongoDB
connectDB();

// ✅ Define Routes
app.use("/api/auth", authRoutes);
app.use("/api/scan", scanRoutes);

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
