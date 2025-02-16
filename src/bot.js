require("dotenv").config();
const { Telegraf } = require("telegraf");
const connectDB = require("./db");
const checkMembership = require("./middlewares/checkMembership");
const User = require("./database/user");

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error("❌ خطا: متغیر محیطی BOT_TOKEN تنظیم نشده است.");
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);
connectDB();

bot.start(async (ctx) => {
  const isMember = await checkMembership(ctx);
  if (!isMember) {
    return ctx.reply("لطفاً ابتدا در کانال عضو شوید:", {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "📢 ورود به کانال",
              url: `https://t.me/${process.env.CHANNEL_USERNAME}`,
            },
          ],
          [{ text: "✅ بررسی عضویت", callback_data: "check_membership" }],
        ],
      },
    });
  }

  const existingUser = await User.findOne({ telegramId: ctx.from.id });
  if (!existingUser) {
    return ctx.reply("🚀 برای استفاده از ربات، لطفاً ابتدا ثبت‌نام کنید.", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "📝 ایجاد حساب کاربری", callback_data: "register_user" }],
        ],
      },
    });
  }

  ctx.reply("🎉 خوش آمدید! شما در حال حاضر ثبت‌نام شده‌اید.");
});

bot.launch();
