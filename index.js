const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { Api } = require("telegram");

const apiId = 28521723; // جایگزین با API ID خودت
const apiHash = "d7b2393812b45d2e28858bf3f1ebecc6"; // جایگزین با API Hash خودت
const sessionString =
  "1BAAOMTQ5LjE1NC4xNjcuOTEAUIEivKN9xB7XYwLnj3d+1YJK6a5Jst1z/r6R2k6eUGl0qNfYy1WEV4MBtm8ydvfUa4mxKr7ZttjT5n0YRxdQjk9Dzsl39jmP45SmN2JYR0cHEHbzu2LQ8N/jiccXaQqiUk/ZsxTzsnwraiYynP/opuFoGWqXYZdS+82oLDVhcX4q5S8dx90xsYLp8NCrYfRTj5X7vsrVTBcGnuuMtMs1RJHD/PjOwBcw71/3SlA1xpYyQ5Q/lIl/UMkQsFnjyG3sN9Dn+w6Ls6DfltjLdTtpq5Lqx46ucW/mVbe0WBabYXCVyz22MPCOTWNE9Pu472nnb/ENW6EsyHupPAYm0k2kRsg="; // جایگزین با سشن ذخیره‌شده

const session = new StringSession(sessionString); // استفاده از نشست ذخیره‌شده
const client = new TelegramClient(session, apiId, apiHash, {
  connectionRetries: 5,
});

(async () => {
  await client.connect(); // استفاده از نشست بدون نیاز به لاگین
  console.log("✅ با موفقیت متصل شدی!");

  // ارسال پیام تستی به خودت
  await client.sendMessage("me", {
    message: "🚀 اتصال موفق! این پیام از SelfBot ارسال شده است.",
  });

  // اضافه کردن لیسنر برای دریافت پیام‌ها
  client.addEventHandler(async (event) => {
    // بررسی اینکه آیا پیام جدید است
    if (event.message && event.message.text) {
      const message = event.message;
      const text = message.text.toLowerCase();

      // چک کردن پیام و ارسال پاسخ خودکار
      console.log(
        `📩 پیام دریافت شد: ${text} از ${message.peerId.userId || "گروه"}`
      );

      // فقط به پیام‌های خصوصی پاسخ می‌دهیم
      if (message.peerId.userId) {
        if (text === "سلام") {
          await client.sendMessage(message.peerId.userId, {
            message: "سلام! چطوری؟ 😊",
          });
          console.log("✅ پیام پاسخ داده شد: سلام!");
        }

        if (text.includes("چطوری")) {
          await client.sendMessage(message.peerId.userId, {
            message: "خوبم، تو چطوری؟ 😃",
          });
          console.log("✅ پیام پاسخ داده شد: چطوری؟");
        }
      }
    }
  });
})();
