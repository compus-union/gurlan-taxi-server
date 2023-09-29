require("dotenv").config();
const { Telegraf } = require("telegraf");
const {
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID,
} = require("../../configs/other.config");

const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

/**
 *
 * @param {string[]} urls
 * @param {Object} details
 * @returns
 */

const sendPictures = async (urls, details) => {
  try {
    const result = await bot.telegram.sendMediaGroup(TELEGRAM_CHAT_ID, [
      {
        parse_mode: "HTML",
        caption: `
        <b>#haydovchi</b>
        <b>🆔${details.oneId}</b>
        <b>🪪${details.fullname}</b>
        <b>📞${details.phone}</b>
        <span class="tg-spoiler">🔐${details.password}</span>
        <b>🚗${details.carName}</b>
        <b>🔢${details.carNumber}</b>
        <b>🎨${details.carColor}</b>
        <b>⌚${details.date}</b>
        `,
        media: `../../uploads/${urls[0]}`,
        type: "photo",
      },
      {
        parse_mode: "HTML",
        media: `../../uploads/${urls[1]}`,
        type: "photo",
      },
      {
        parse_mode: "HTML",
        media: `../../uploads/${urls[2]}`,
        type: "photo",
      },
      {
        parse_mode: "HTML",
        media: `../../uploads/${urls[3]}`,
        type: "photo",
      },
    ]);

    return result;
  } catch (error) {
    console.log(error);
  }
};

module.exports = { sendPictures };
