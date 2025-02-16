const mongoose = require('mongoose');

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ اتصال به دیتابیس برقرار شد.');
    } catch (error) {
        console.error('❌ خطا در اتصال به دیتابیس:', error);
    }
}

module.exports = { connectDB };
