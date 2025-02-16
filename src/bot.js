require('dotenv').config();
const { Telegraf } = require('telegraf');
const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./database/user');
const { connectDB } = require('./db');

// اتصال به دیتابیس
connectDB();

const bot = new Telegraf(process.env.BOT_TOKEN);
const userRegistration = new Map(); // ذخیره وضعیت کاربران در حال ثبت‌نام

bot.start(async (ctx) => {
    ctx.reply('سلام! لطفاً ابتدا عضو کانال ما شوید.', {
        reply_markup: {
            inline_keyboard: [
                [{ text: '📢 عضویت در کانال', url: `https://t.me/${process.env.CHANNEL_USERNAME.replace('@', '')}` }],
                [{ text: '✅ بررسی عضویت', callback_data: 'check_membership' }]
            ]
        }
    });
});

bot.action('check_membership', async (ctx) => {
    try {
        const chatMember = await axios.get(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/getChatMember`, {
            params: {
                chat_id: process.env.CHANNEL_USERNAME,
                user_id: ctx.from.id
            }
        });

        const status = chatMember.data.result.status;
        if (status === 'member' || status === 'administrator' || status === 'creator') {
            const existingUser = await User.findOne({ telegramId: ctx.from.id });

            if (existingUser) {
                ctx.reply('✅ شما قبلاً ثبت‌نام کرده‌اید و می‌توانید از خدمات ربات استفاده کنید.');
            } else {
                ctx.reply('⚠️ شما هنوز ثبت‌نام نکرده‌اید. لطفاً ثبت‌نام کنید.', {
                    reply_markup: {
                        inline_keyboard: [[{ text: '📝 ثبت‌نام', callback_data: 'register_user' }]]
                    }
                });
            }
        } else {
            ctx.reply('❌ شما هنوز عضو کانال نیستید! لطفاً ابتدا عضو شوید و سپس دوباره بررسی کنید.');
        }
    } catch (error) {
        console.error(error);
        ctx.reply('⚠️ خطایی رخ داد. لطفاً دوباره تلاش کنید.');
    }
});

bot.action('register_user', async (ctx) => {
    const userId = ctx.from.id;
    userRegistration.set(userId, { step: 1 });
    ctx.reply('👤 لطفاً نام خود را وارد کنید:');
});

bot.on('text', async (ctx) => {
    const userId = ctx.from.id;
    const registrationData = userRegistration.get(userId);

    if (!registrationData) return; // اگر کاربر در حال ثبت‌نام نبود، پیام را پردازش نکن

    switch (registrationData.step) {
        case 1:
            registrationData.firstName = ctx.message.text;
            registrationData.step = 2;
            ctx.reply('🔤 لطفاً نام خانوادگی خود را وارد کنید:');
            break;

        case 2:
            registrationData.lastName = ctx.message.text;
            registrationData.step = 3;
            ctx.reply('🆔 لطفاً کد ملی خود را وارد کنید:');
            break;

        case 3:
            if (!/^\d{10}$/.test(ctx.message.text)) {
                ctx.reply('⚠️ کد ملی نامعتبر است. لطفاً یک کد ملی ۱۰ رقمی وارد کنید.');
                return;
            }
            registrationData.nationalId = ctx.message.text;
            registrationData.step = 4;
            ctx.reply('📞 لطفاً شماره تلفن همراه خود را وارد کنید:');
            break;

        case 4:
            if (!/^09\d{9}$/.test(ctx.message.text)) {
                ctx.reply('⚠️ شماره تلفن نامعتبر است. لطفاً یک شماره موبایل معتبر ایرانی وارد کنید.');
                return;
            }
            registrationData.phoneNumber = ctx.message.text;

            // ذخیره در دیتابیس
            const newUser = new User({
                telegramId: userId,
                firstName: registrationData.firstName,
                lastName: registrationData.lastName,
                nationalId: registrationData.nationalId,
                phoneNumber: registrationData.phoneNumber
            });

            try {
                await newUser.save();
                ctx.reply('✅ ثبت‌نام شما با موفقیت انجام شد! حالا می‌توانید از خدمات ربات استفاده کنید.');
            } catch (error) {
                console.error(error);
                ctx.reply('❌ خطایی رخ داد. لطفاً بعداً دوباره تلاش کنید.');
            }

            userRegistration.delete(userId); // حذف وضعیت ثبت‌نام پس از تکمیل
            break;
    }
});

bot.launch();
console.log('ربات فعال شد!');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));