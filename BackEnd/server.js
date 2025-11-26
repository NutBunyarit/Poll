// server.js (ปรับปรุง)
const express = require('express');
const bodyParser = require('body-parser'); 
const connectDB = require('./db'); // นำเข้าฟังก์ชันเชื่อมต่อ DB
const Poll = require('./models/Poll'); // นำเข้าโมเดล Poll

const app = express();
const PORT = 3000;

// *** 1. เรียกใช้ฟังก์ชันเชื่อมต่อฐานข้อมูล ***
connectDB();

// Middleware (เหมือนเดิม)
app.use(bodyParser.json()); 
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// ----------------------------------------------------------------------
// 🔗 API Endpoint 1: POST /api/polls (สร้าง Poll ใหม่ใน MongoDB)
// ----------------------------------------------------------------------
app.post('/api/polls', async (req, res) => {
    try {
        const { 
            pollTitle, 
            description, 
            startDate, 
            endDate, 
            optionA, 
            optionB, 
            votingOptions // ถ้ามีตัวเลือกเพิ่มเติม
        } = req.body;

        // ตรวจสอบข้อมูลที่จำเป็น
        if (!pollTitle || !startDate || !endDate || !optionA || !optionB) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

        // เตรียม Map สำหรับ options (ตั้งค่าคะแนนโหวตเริ่มต้นเป็น 0)
        const optionsMap = {};
        optionsMap[optionA] = 0;
        optionsMap[optionB] = 0;

        // เพิ่มตัวเลือกเพิ่มเติม (ถ้ามี)
        if (Array.isArray(votingOptions)) {
            votingOptions.forEach(opt => {
                if (opt && typeof opt === 'string') {
                    optionsMap[opt] = 0;
                }
            });
        }

        const newPoll = new Poll({
            pollTitle,
            description,
            startDate,
            endDate,
            options: optionsMap // ใช้ Map ที่เตรียมไว้
        });

        // บันทึกข้อมูลลงใน MongoDB
        const createdPoll = await newPoll.save();

        // ส่งข้อมูลที่ถูกบันทึกพร้อม ID ที่ MongoDB สร้างกลับไป
        return res.status(201).json(createdPoll);

    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server Error during poll creation');
    }
});


// ----------------------------------------------------------------------
// 🔗 API Endpoint 2: GET /api/polls (ดึงรายการ Poll ทั้งหมดจาก MongoDB)
// ----------------------------------------------------------------------
app.get('/api/polls', async (req, res) => {
    try {
        // ค้นหา Polls ทั้งหมด
        const allPolls = await Poll.find().sort({ createdAt: -1 }); // เรียงลำดับจากใหม่ไปเก่า

        return res.status(200).json(allPolls);

    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server Error while fetching polls');
    }
});
// server.js (เพิ่มในส่วน API Endpoints)

// 🔗 API Endpoint 3: GET /api/polls/:id (ดึงรายละเอียด Poll เดี่ยว)
app.get('/api/polls/:id', async (req, res) => {
    try {
        const pollId = req.params.id;
        
        // ค้นหา Poll ด้วย ID ที่ได้มาจาก URL parameter
        const poll = await Poll.findById(pollId);

        if (!poll) {
            return res.status(404).json({ error: 'Poll not found' });
        }

        return res.status(200).json(poll);

    } catch (err) {
        // เช่น ถ้า ID ที่ส่งมามี format ที่ไม่ถูกต้องของ MongoDB
        if (err.kind === 'ObjectId') {
             return res.status(400).json({ error: 'Invalid Poll ID format' });
        }
        console.error(err.message);
        return res.status(500).send('Server Error while fetching single poll');
    }
});
// server.js (เพิ่มในส่วน API Endpoints)

// 🔗 API Endpoint 4: POST /api/polls/:id/vote (บันทึกการโหวต)
app.post('/api/polls/:id/vote', async (req, res) => {
    try {
        const pollId = req.params.id;
        const { selectedOption } = req.body; // สิ่งที่ Front-End ส่งมา

        if (!selectedOption) {
            return res.status(400).json({ error: 'Selected option is required' });
        }

        // 1. ค้นหา Poll
        const poll = await Poll.findById(pollId);

        if (!poll) {
            return res.status(404).json({ error: 'Poll not found' });
        }

        // 2. ตรวจสอบว่าตัวเลือกถูกต้องหรือไม่
        const currentOptions = poll.options;

        if (currentOptions.get(selectedOption) === undefined) {
             return res.status(400).json({ error: `Invalid option: ${selectedOption}` });
        }

        // 3. อัปเดตจำนวนโหวต
        // เพิ่มคะแนนโหวตให้ตัวเลือกที่ถูกเลือกไป 1
        currentOptions.set(selectedOption, currentOptions.get(selectedOption) + 1);
        
        // 4. บันทึกการเปลี่ยนแปลงกลับไปที่ฐานข้อมูล
        await poll.save();

        // 5. ส่งผลลัพธ์ใหม่กลับไป (หรือแค่สถานะสำเร็จ)
        return res.status(200).json({ 
            message: 'Vote successful', 
            updatedPoll: poll // ส่ง Poll ที่อัปเดตกลับไปให้ Front-End โชว์ผลทันที
        });

    } catch (err) {
        if (err.kind === 'ObjectId') {
             return res.status(400).json({ error: 'Invalid Poll ID format' });
        }
        console.error(err.message);
        return res.status(500).send('Server Error during voting');
    }
});

app.delete('/api/polls/:id', async (req, res) => {
    try {
        const pollId = req.params.id;

        // ค้นหาและลบ Poll ตาม ID
        const deletedPoll = await Poll.findByIdAndDelete(pollId);

        // ถ้าหาไม่เจอ (หรือถูกลบไปแล้ว)
        if (!deletedPoll) {
            return res.status(404).json({ error: 'Poll not found' });
        }

        return res.status(200).json({ 
            message: 'Poll deleted successfully', 
            deletedId: pollId 
        });

    } catch (err) {
        // กรณี ID ผิด Format (เช่น ส่งมาสั้นเกินไป)
        if (err.kind === 'ObjectId') {
             return res.status(400).json({ error: 'Invalid Poll ID format' });
        }
        console.error(err.message);
        return res.status(500).send('Server Error during deletion');
    }
});
// ----------------------------------------------------------------------
// เริ่มต้น Server
// ----------------------------------------------------------------------
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});