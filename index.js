import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Telegraf } from "telegraf";
import { formatListResponse, formatRowResponse, getRepoInfo } from "./lib/utils.js";
import { Package } from "./lib/schemas/package-schema.js";
import { Following } from "./lib/schemas/following-schema.js";
import { connectDB } from "./lib/db.js";

dotenv.config();
await connectDB();
const port = process.env.PORT || 9999;

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.start((ctx) => {
  ctx.reply(`
    Hello! 👋. I'm a bot that can help you track open source version.

    You can send me a message with the format:
      /help to see the list of commands
      /list to see the list of following packages
      /add to add a package
      /remove to remove a package
      /tracking to tracking all packages
    `);
});

bot.help((ctx) => {
  ctx.reply(`
  You can send me a message with the format:
    /help to see the list of commands
    /list to see the list of following packages
    /add to add a package
    /remove to remove a package
    /tracking to tracking all packages
  `);
});

bot.command("list", async (ctx) => {
  const following = await Following.find({ username: ctx.message.from.username });
  const packages = await Package.find({ name: { $in: following.map(item => item.packageName) } });

  if (packages.length === 0) {
    ctx.reply("You are not following any packages");
    return;
  }

  ctx.reply(`List of following packages:
    ${packages.map(formatListResponse).join("\n")}
  `);
});

bot.command("add", async (ctx) => {
  const packageName = ctx.message.text.split(" ")[1];
  await Following.create({ username: ctx.message.from.username, packageName });
  const pkg = await Package.findOne({ name: packageName });
  if (!pkg) {
    const { version, description } = await getRepoInfo(packageName);
    await Package.create({ name: packageName, version, description });
  }
  ctx.reply(`Package ${packageName} added to following`);
});

bot.command("remove", async (ctx) => {
  const packageName = ctx.message.text.split(" ")[1];
  await Following.deleteOne({ username: ctx.message.from.username, packageName });
  ctx.reply(`Package ${packageName} removed from following`);
});

bot.command("tracking", async (ctx) => {
  const following = await Following.find({ username: ctx.message.from.username });
  const promises = following.map(async (row) => {
    const { version, description } = await getRepoInfo(row.packageName);
    await Package.updateOne({ name: row.packageName }, { version, description });
    return {
      name: row.packageName,
      version,
      description
    }
  });
  Promise.all(promises).then((results) => {
    ctx.reply(`Tracking all packages:
      ${results.map(formatRowResponse).join("\n")}
    `);
  });
});

bot.startWebhook("/bot", null, port);

