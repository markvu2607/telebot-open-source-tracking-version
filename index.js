import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import bot from "./lib/bot.js";
import { connectDB } from "./lib/db.js";
import { Following } from "./lib/schemas/following-schema.js";
import { Package } from "./lib/schemas/package-schema.js";
import { formatNewVersionResponse, getRepoInfo } from "./lib/utils.js";

dotenv.config();
await connectDB();
const port = process.env.PORT || 9999;

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/tracking", async (req, res) => {
  try {
    // Get all packages
    const oldPackages = await Package.find({});

    // Get latest version of packages
    const newPackages = await Promise.all(oldPackages.map(async (pkg) => {
      // TODO: handle short description
      const { version, description } = await getRepoInfo(pkg.name);
      if (version === 'unknown') {
        return {
          name: pkg.name,
          prevVersion: pkg.version,
          newVersion: "unknown",
          description: pkg.description,
          status: 'Tracking failed'
        }
      }else {
        await Package.updateOne({ name: pkg.name }, { version, description: "" });
        return {
          name: pkg.name,
          prevVersion: pkg.version,
          newVersion: version,
          description: "",
          status: 'Tracking success'
        }
      }
    }));

    // Filter packages that have new version
    const packagesHasNewVersion = newPackages
      .filter(pkg => pkg.newVersion !== "unknown")
      .filter(pkg => pkg.newVersion !== pkg.prevVersion);

    // Send message to all users who follow the package
    await Promise.all(packagesHasNewVersion.map(async (pkg) => {
      const following = await Following.find({ packageName: pkg.name });
      await Promise.all(following.map(async ({chatId}) => {
        await bot.telegram.sendMessage(chatId, formatNewVersionResponse(pkg));
      }));
    }));

    res.status(200).json({ message: 'Tracking completed' });
  } catch (error) {
    res.status(500).json({ error: 'Tracking failed' });
  }
});

app.use(bot.webhookCallback("/bot"));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

