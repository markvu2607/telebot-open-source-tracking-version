import { Telegraf } from "telegraf";
import { connectDB } from "../../lib/db.js";
import Following from "../../lib/schemas/following.js";
import Package from "../../lib/schemas/package.js";
import { formatNewVersionResponse, getRepoInfo } from "../../lib/utils.js";

const trackingVersion = async () => {
  const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
  await connectDB();

  const oldPackages = await Package.find({});
  const promises1 = oldPackages.map(async (pkg) => {
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
      await Package.updateOne({ name: pkg.name }, { version, description });
      return {
        name: pkg.name,
        prevVersion: pkg.version,
        newVersion: version,
        description,
        status: 'Tracking success'
      }
    }
  });

  const results = await Promise.all(promises1);
  const packagesHasNewVersion = results
    .filter(result => result.newVersion !== "unknown")
    .filter(result => result.newVersion !== result.prevVersion);

  const promises2 = packagesHasNewVersion.map(async (pkg) => {
    const following = await Following.find({ packageName: pkg.name });
    const promises3 = following.map(async ({chatId}) => {
      await bot.telegram.sendMessage(chatId, formatNewVersionResponse(pkg));
    });

    await Promise.all(promises3);
  });
  await Promise.all(promises2);
}

export default trackingVersion;
