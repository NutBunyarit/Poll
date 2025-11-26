const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // กำหนด URL ของ MongoDB (ตรวจสอบพอร์ตที่คุณติดตั้ง)
        const mongoURI = 'mongodb://localhost:27017/votingAppDB'; 
        
        await mongoose.connect(mongoURI);

        console.log('MongoDB connected successfully!');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        // ออกจากโปรเซสหากไม่สามารถเชื่อมต่อได้
        process.exit(1);
    }
};

module.exports = connectDB;