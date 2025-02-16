require("dotenv").config();
const { Telegraf } = require("telegraf");
const mongoose = require("mongoose");
const User = require("./database/user");

const BOT_TOKEN = process.env.BOT_TOKEN;
const MONGO_URI = process.env.MONGO_URI;
const CHANNEL_USERNAME = process.env.CHANNEL_USERNAME;

if (!BOT_TOKEN) {
  console.error("❌ خطا: متغیر محیطی BOT_TOKEN تنظیم نشده است.");
  process.exit(1);
}
if (!MONGO_URI) {
  console.error("❌ خطا: متغیر محیطی MONGO_URI تنظیم نشده است.");
  process.exit(1);
}
if (!CHANNEL_USERNAME) {
  console.error("❌ خطا: متغیر محیطی CHANNEL_USERNAME تنظیم نشده است.");
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

// اتصال به دیتابیس MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ اتصال موفق به دیتابیس");
  } catch (error) {
    console.error("❌ خطا در اتصال به دیتابیس:", error);
    process.exit(1);
  }
};
connectDB();

// بررسی عضویت در کانال
const checkMembership = async (ctx) => {
  try {
    const chatMember = await ctx.telegram.getChatMember(
      `@${CHANNEL_USERNAME}`,
      ctx.from.id
    );
    return ["member", "administrator", "creator"].includes(chatMember.status);
  } catch (error) {
    console.error("❌ خطا در بررسی عضویت:", error);
    return false;
  }
};

bot.start(async (ctx) => {
  const isMember = await checkMembership(ctx);
  if (!isMember) {
    return ctx.reply("لطفاً ابتدا در کانال عضو شوید:", {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "📢 ورود به کانال",
              url: `https://t.me/${CHANNEL_USERNAME}`,
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

bot.action("check_membership", async (ctx) => {
  const isMember = await checkMembership(ctx);
  if (isMember) {
    return ctx.reply("✅ عضویت شما تأیید شد! حالا ثبت‌نام کنید.", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "📝 ایجاد حساب کاربری", callback_data: "register_user" }],
        ],
      },
    });
  }
  ctx.reply(
    "❌ هنوز در کانال عضو نشده‌اید. لطفاً عضو شوید و مجدداً بررسی کنید."
  );
});

bot.action("register_user", async (ctx) => {
  await ctx.reply("لطفاً نام خود را ارسال کنید:");
  ctx.session = { step: "first_name" };
});

bot.on("text", async (ctx) => {
  if (!ctx.session) return;

  switch (ctx.session.step) {
    case "first_name":
      ctx.session.firstName = ctx.message.text;
      ctx.session.step = "last_name";
      await ctx.reply("لطفاً نام خانوادگی خود را ارسال کنید:");
      break;
    case "last_name":
      ctx.session.lastName = ctx.message.text;
      ctx.session.step = "national_id";
      await ctx.reply("لطفاً کد ملی خود را ارسال کنید:");
      break;
    case "national_id":
      ctx.session.nationalId = ctx.message.text;
      ctx.session.step = "phone_number";
      await ctx.reply("لطفاً شماره تلفن همراه خود را ارسال کنید:");
      break;
    case "phone_number":
      ctx.session.phoneNumber = ctx.message.text;
      await User.create({
        telegramId: ctx.from.id,
        firstName: ctx.session.firstName,
        lastName: ctx.session.lastName,
        nationalId: ctx.session.nationalId,
        phoneNumber: ctx.session.phoneNumber,
      });
      await ctx.reply("✅ ثبت‌نام شما با موفقیت انجام شد!");
      ctx.session = null;
      break;
  }
});

bot.launch();
