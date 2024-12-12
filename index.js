import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Telegraf } from "telegraf";
import db from "./lib/db.js";

dotenv.config();
const port = process.env.PORT || 9999;

const app = express();
app.use(cors());
app.use(express.json());

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

bot.command("list", (ctx) => {
  db.all("SELECT * FROM following WHERE username = ?", [ctx.message.from.username], (err, rows) => {
    if (err) {
      ctx.reply("Error: " + err.message);
    } else {
        ctx.reply(`List of following packages:
          ${formatListResponse(rows)}
        `);
      }
    }
  );
});

bot.command("add", (ctx) => {
  db.exec("INSERT INTO following (username, package_name) VALUES (?, ?)", [ctx.message.from.username, ctx.message.text]);
  ctx.reply(`Package ${ctx.message.text} added to following`);
});

bot.command("remove", (ctx) => {
  db.exec("DELETE FROM following WHERE username = ? AND package_name = ?", [ctx.message.from.username, ctx.message.text]);
  ctx.reply(`Package ${ctx.message.text} removed from following`);
});

bot.command("tracking", (ctx) => {
  ctx.reply("Tracking all packages");
});

bot.startWebhook("/TrackingOpenSourceVersionBot", null, port);
