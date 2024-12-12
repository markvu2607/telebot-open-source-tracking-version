import { Telegraf } from "telegraf";
import { Following } from "./schemas/following-schema.js";
import { Package } from "./schemas/package-schema.js";
// import trackingVersion from "./tracking-version.js";
import { formatListResponse, getRepoInfo } from "./utils.js";

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

const listCommands = [
  { command: "help", description: "See the list of commands" },
  { command: "ls", description: "See the list of following packages" },
  { command: "sub", description: "Subscribe a package" },
  { command: "unsub", description: "Unsubscribe a package" },
  { command: "s", description: "Search a package" },
];

bot.start((ctx) => {
  ctx.reply(`Hello! 👋. I'm a bot that can help you track open source version.\nYou can send me a message with the format:\n${listCommands.map((command, index) => `${index + 1}. /${command.command} - ${command.description}`).join("\n")}`);
});

bot.help((ctx) => {
  ctx.reply(`You can send me a message with the format:\n${listCommands.map((command, index) => `${index + 1}. /${command.command} - ${command.description}`).join("\n")}`);
});

bot.command("ls", async (ctx) => {
  const username = ctx.message.from.username;
  const chatId = ctx.message.chat.id;

  const following = await Following.find({ chatId });
  if (following.length === 0) {
    ctx.reply(`User ${username} are not following any packages`);
    return;
  }

  const packages = await Package.find({ name: { $in: following.map(item => item.packageName) } });
  ctx.reply(`List of following packages: \n\n${formatListResponse(packages)}`);
});

bot.command("sub", async (ctx) => {
  const username = ctx.message.from.username;
  const chatId = ctx.message.chat.id;
  const packageName = ctx.message.text.split(" ")[1];

  if (!packageName) {
    ctx.reply("Please provide a package name");
    return;
  }

  const isFollowing = await Following.findOne({ packageName, chatId });
  if (isFollowing) {
    ctx.reply(`Package ${packageName} is already being followed by ${isFollowing.username}`);
    return;
  }

  const hasPackage = await Package.findOne({ name: packageName });
  if (!hasPackage) {
    // TODO: handle short description
    const { version, description } = await getRepoInfo(packageName);
    if (!version || version === 'unknown') {
      ctx.reply(`Package ${packageName} not found`);
      return;
    }

    await Package.create({ name: packageName, version, description: "" });
  }

  await Following.create({ chatId, packageName });
  ctx.reply(`Package ${packageName} added to following by ${username}`);
});

bot.command("unsub", async (ctx) => {
  const username = ctx.message.from.username;
  const chatId = ctx.message.chat.id;
  const packageName = ctx.message.text.split(" ")[1];

  if (!packageName) {
    ctx.reply("Please provide a package name");
    return;
  }

  const isFollowing = await Following.findOne({ packageName, chatId });
  if (!isFollowing) {
    ctx.reply(`Package ${packageName} is not being followed`);
    return;
  }

  await Following.deleteOne({ chatId, packageName });
  ctx.reply(`Package ${packageName} removed from following by ${username}`);
});

bot.command("s", async (ctx) => {
  const q = ctx.message.text.split(" ")[1];

  if (!q) {
    ctx.reply("Please provide a query");
    return;
  }

  const packages = await Package.find({ name: { $regex: q, $options: 'i' } });
  if (packages.length === 0) {
    ctx.reply(`No packages found`);
    return;
  }

  ctx.reply(`List of packages: \n\n${formatListResponse(packages)}`);
});

export default bot;
