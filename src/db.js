require('dotenv').config(); // این باید بالاترین خط باشه

const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("❌ متغیر MONGO_URI مقداردهی نشده!");
        }
        
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log("✅ اتصال موفق به دیتابیس");
    } catch (error) {
        console.error("❌ خطا در اتصال به دیتابیس:", error.message);
        process.exit(1);
    }
};

connectDB();
