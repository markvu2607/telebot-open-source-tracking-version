import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Telegraf } from "telegraf";
dotenv.config();
const port = process.env.PORT || 9999;

const app = express();
app.use(cors());
app.use(express.json());

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.start((ctx) => {
  ctx.reply(`
    Hello! 👋). I'm a bot that can help you track open source version.
    You can send me a message with the format:
    <code>
    /help to see the list of commands
    /list to see the list of following packages
    /add to add a package
    /remove to remove a package
    /tracking to tracking all packages
    </code>
    `);
});

bot.help((ctx) => {
  ctx.reply(`
  I can help you with tracking open source version.
  You can send me a message with the format:
  <code>
  /help
  /list
  /add
  /remove
  /tracking
  </code>
  `);
});

bot.command("list", (ctx) => {
  ctx.reply("List of packages");
});

bot.command("add", (ctx) => {
  ctx.reply("Add a package");
});

bot.command("remove", (ctx) => {
  ctx.reply("Remove a package");
});

bot.command("tracking", (ctx) => {
  ctx.reply("Tracking all packages");
});

bot.startWebhook("/TrackingOpenSourceVersionBot", null, port);
