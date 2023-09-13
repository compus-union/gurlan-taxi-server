require("dotenv").config();
const { Telegraf } = require("telegraf");
const { TELEGRAM_BOT_TOKEN } = require("../../configs/other.config");
const { Telegraf } = require("telegraf");

const bot = new Telegraf(TELEGRAM_BOT_TOKEN)
