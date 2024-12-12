import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import trackingVersion from "./lib/tracking-version.js";
import { connectDB } from "./lib/db.js";
import bot from "./lib/bot.js";

dotenv.config();
await connectDB();
const port = process.env.PORT || 9999;

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/tracking", async (req, res) => {
  try {
    await trackingVersion();
    res.status(200).json({ message: 'Tracking completed' });
  } catch (error) {
    console.error('Tracking error:', error);
    res.status(500).json({ error: 'Tracking failed' });
  }
});

app.use(bot.webhookCallback("/bot"));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

