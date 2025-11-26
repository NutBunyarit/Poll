// models/Poll.js
const mongoose = require('mongoose');

const PollSchema = new mongoose.Schema({
    // 1. Poll Title
    pollTitle: {
        type: String,
        required: true,
        trim: true
    },
    // 2. Description (Optional)
    description: {
        type: String,
        default: null
    },
    // 3. StartDate
    startDate: {
        type: Date,
        required: true
    },
    // 4. EndDate
    endDate: {
        type: Date,
        required: true
    },
    // 5. Voting Options (ตัวเลือกที่เก็บคะแนน)
    // ใช้ Map เพื่อเก็บ Key-Value: { "ตัวเลือก A": 5, "ตัวเลือก B": 10 }
    options: {
        type: Map,
        of: Number, // Value เป็น Number (เก็บจำนวนโหวต)
        required: true
    },
    // 6. A Option & 7. B Option (รวมอยู่ใน options)
    // สามารถแยกเก็บเป็น String Array ถ้าต้องการ
    createdAt: {
        type: Date,
        default: Date.now
    }
    // ไม่จำเป็นต้องสร้าง ID เพราะ MongoDB จะสร้าง _id อัตโนมัติ
});

module.exports = mongoose.model('Poll', PollSchema);