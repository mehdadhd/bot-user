const { Telegraf } = require("telegraf");
const mongoose = require("mongoose");
require("dotenv").config();

// اتصال به MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Error connecting to MongoDB:", err));

// مدل کاربر
const User = mongoose.model(
  "User",
  new mongoose.Schema({
    name: String,
    phone: String,
    nationalCode: String,
  })
);

// تنظیمات ربات تلگرام
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => ctx.reply("سلام! لطفا اطلاعات خود را وارد کنید."));

// دریافت اطلاعات کاربران
bot.hears("ثبت نام", async (ctx) => {
  const message = "لطفا نام خود را وارد کنید:";
  ctx.reply(message);
  // در اینجا می‌توانی مراحل دریافت نام، کد ملی و شماره تماس رو اضافه کنی.
});

bot.launch();
