import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Telegraf } from "telegraf";
import { formatListResponse, trackingVersion, getRepoInfo } from "./lib/utils.js";
import { Package } from "./lib/schemas/package-schema.js";
import { Following } from "./lib/schemas/following-schema.js";
import { connectDB } from "./lib/db.js";

dotenv.config();
await connectDB();
const port = process.env.PORT || 9999;

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

const listCommands = [
  { command: "help", description: "See the list of commands" },
  { command: "list", description: "See the list of following packages" },
  { command: "add", description: "Add a package" },
  { command: "remove", description: "Remove a package" },
  { command: "tracking", description: "Tracking all packages" },
];

bot.start((ctx) => {
  ctx.reply(`Hello! 👋. I'm a bot that can help you track open source version.\nYou can send me a message with the format:\n${listCommands.map((command, index) => `${index + 1}. /${command.command} - ${command.description}`).join("\n")}`);
});

bot.help((ctx) => {
  ctx.reply(`You can send me a message with the format:\n${listCommands.map((command, index) => `${index + 1}. /${command.command} - ${command.description}`).join("\n")}`);
});

bot.command("list", async (ctx) => {
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

bot.command("add", async (ctx) => {
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
    const { version, description } = await getRepoInfo(packageName);
    if (!version || version === 'unknown') {
      ctx.reply(`Package ${packageName} not found`);
      return;
    }

    await Package.create({ name: packageName, version, description });
  }

  await Following.create({ chatId, packageName });
  ctx.reply(`Package ${packageName} added to following by ${username}`);
});

bot.command("remove", async (ctx) => {
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

bot.command("tracking", async (ctx) => {
  trackingVersion();
  ctx.reply("Tracking all packages");
});

bot.startWebhook("/bot", null, port);

