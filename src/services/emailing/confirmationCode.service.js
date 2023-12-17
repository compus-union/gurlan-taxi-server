require("dotenv").config();
const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  host: "smtp.mail.ru",
  service: "mail.ru",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SERVER_EMAIL,
    pass: process.env.SERVER_EMAIL_PASS,
  },
});

async function sendConfirmationCode(email, code) {
  try {
    const template = `
    <div style="
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: Arial, Helvetica, sans-serif;
    "
  >
    <div style="width: 600px">
      <h3>Novda Union</h3>
      <h1>Tasdiqlash kodi</h1>
      <p>
        Diqqat! Sizning emailingiz orqali <b>Novda Taxi</b> ilovasiga
        ro'yxatdan o'tishyabdi
      </p>
      <h1 style="background: #f4f4f4; text-align: center">${code}</h1>
      <p style="margin-bottom: 20px">Bu kodni hech kimga ko'rsatmang!</p>
      <b>Bundan xabaringiz yo'qmi?</b>
      <p>Agar siz ro'yxatdan o'tmayotgan bo'lsangiz, <b>kodni hech kimga ko'rsatmang</b></p>
    </div>
  </div>
    `;

    let info = await transporter.sendMail({
      from: "Novda Union <novda@internet.ru>",
      to: email,
      subject: `${code} - bu kodni hech kimga bermang`,
      html: template,
    });

    return info;
  } catch (error) {
    console.log(error);
    return {
      code: 500,
      status: error.stack,
      message: error.message,
    };
  }
}

module.exports = { sendConfirmationCode };
