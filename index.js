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

bot.on("message", (ctx) => {
  ctx.reply(
    `${ctx.message.from.username} đã gửi: ${ctx.message.text} in ${ctx.message.chat.id} in ${ctx.message.chat.type}`
  );
});

bot.startWebhook("/TrackingOpenSourceVersionBot", null, port);
