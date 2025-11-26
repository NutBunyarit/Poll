const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const Redis = require('ioredis');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'PollDB',
  password: '1234',
  port: 5432,
});

// Redis setup
const redis = new Redis({
  host: '127.0.0.1',
  port: 6379,
});

const app = express();
app.use(cors());
app.use(express.json()); // 👈 สำคัญ! สำหรับรับ JSON จาก Frontend

// เส้น API รับข้อมูล Poll
app.post('/api/poll', (req, res) => {
    const data = req.body;  // ได้ข้อมูลจาก Frontend เลย
    console.log(" Received Poll:", data);

    res.json({
        message: "Poll received successfully!",
        received: data
    });
});

// สมมติ: redis = node-redis v4 client หรือ ioredis (ปรับ method เล็กน้อยถ้าใช้ ioredis)
app.get('/api/polls', async (req, res) => {
  try {
    const cacheKey = 'polls:all';

    // ถ้าใช้ node-redis v4: await redis.get(cacheKey)
    // ถ้าใช้ ioredis: same await redis.get(cacheKey)
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log('Returning from cache');
      return res.json(JSON.parse(cached));
    }

    const { rows } = await pool.query('SELECT * FROM polls');
    console.log(rows.length);
    // ถ้าไม่มีผลลัพธ์ ให้คืน array ว่างดีกว่า 404 (design choice)
    if (!rows || rows.length === 0) {
      return res.json([]); // หรือ res.status(404).json({ message: 'Not found' })
    }

    // บันทึกลง Redis — สำหรับ node-redis v4 ใช้ setEx
    // node-redis v4:
    if (typeof redis.setEx === 'function') {
      await redis.setEx(cacheKey, 60, JSON.stringify(rows));
    } else {
      // ioredis:
      await redis.setex(cacheKey, 60, JSON.stringify(rows));
    }

    //console.log('Returning from PostgreSQL');
    return res.json(rows);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});


// เช็คว่า server รัน
app.get('/', (req, res) => {
    res.send("Backend is running...");
});

app.listen(3000, () => {
    console.log(" Backend Running on http://localhost:3000");
});
