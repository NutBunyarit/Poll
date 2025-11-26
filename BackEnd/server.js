const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const Redis = require('ioredis');

// 1. ตั้งค่า PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'PollDB',
  password: '1234',
  port: 5432,
});

// 2. ตั้งค่า Redis (เชื่อมต่อไปที่ localhost:6379 ที่เราเปิด Docker ไว้)
const redis = new Redis({
  host: '127.0.0.1', 
  port: 6379,
  // retryStrategy: ถ้าต่อไม่ได้ ให้พยายามต่อใหม่เรื่อยๆ ทุก 2 วินาที
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

redis.on('error', (err) => {
    console.error('❌ Redis Connection Error:', err.message);
    // ไม่ Crash โปรแกรม แต่จะแจ้งเตือนแทน
});

redis.on('connect', () => {
    console.log('✅ Connected to Redis successfully');
});

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

// Helper: ฟังก์ชันล้าง Cache (เรียกใช้เมื่อมีการ สร้าง/โหวต/ลบ)
const clearCache = async () => {
    try {
        await redis.del('polls:all');
        console.log('🧹 Cache Cleared');
    } catch (err) {
        console.error('Cache Clear Error:', err);
    }
};

// ----------------------------------------------------------------------
// 🔗 API 1: สร้าง Poll (POST) -> ล้าง Cache
// ----------------------------------------------------------------------
app.post('/api/polls', async (req, res) => {
    try {
        const { pollTitle, description, startDate, endDate, optionA, optionB, votingOptions } = req.body;

        if (!pollTitle || !startDate || !endDate || !optionA || !optionB) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

        const optionsMap = {};
        optionsMap[optionA] = 0;
        optionsMap[optionB] = 0;
        if (Array.isArray(votingOptions)) {
            votingOptions.forEach(opt => {
                if (opt) optionsMap[opt] = 0;
            });
        }

        const query = `
            INSERT INTO polls ("pollTitle", description, "startDate", "endDate", options)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id as "_id", "pollTitle", description, "startDate", "endDate", options
        `;
        
        const values = [pollTitle, description, new Date(startDate), new Date(endDate), optionsMap];
        const { rows } = await pool.query(query, values);

        // 🔥 ล้าง Cache เพราะมีข้อมูลใหม่
        await clearCache();

        res.status(201).json(rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// ----------------------------------------------------------------------
// 🔗 API 2: ดึง Polls (GET) -> เช็ค Cache ก่อน
// ----------------------------------------------------------------------
app.get('/api/polls', async (req, res) => {
    try {
        const cacheKey = 'polls:all';

        // 1. ⚡ ลองดึงจาก Redis ก่อน
        const cached = await redis.get(cacheKey);
        if (cached) {
            console.log('⚡ Returning from Redis Cache');
            return res.json(JSON.parse(cached));
        }

        // 2. 🐘 ถ้าไม่มี ให้ดึงจาก PostgreSQL
        const query = `
            SELECT id as "_id", "pollTitle", description, "startDate", "endDate", options 
            FROM polls 
            ORDER BY "createdAt" DESC
        `;
        const { rows } = await pool.query(query);

        // 3. 💾 บันทึกลง Redis (เก็บไว้ 60 วินาที)
        // ตรวจสอบว่ามีข้อมูลไหมก่อน set
        if (rows) {
            await redis.setex(cacheKey, 60, JSON.stringify(rows));
        }

        console.log('🐘 Returning from PostgreSQL');
        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// ----------------------------------------------------------------------
// 🔗 API 3: โหวต (POST Vote) -> ล้าง Cache
// ----------------------------------------------------------------------
app.post('/api/polls/:id/vote', async (req, res) => {
    try {
        const pollId = req.params.id;
        const { selectedOption } = req.body;

        const checkQuery = `SELECT options FROM polls WHERE id = $1`;
        const { rows } = await pool.query(checkQuery, [pollId]);

        if (rows.length === 0) return res.status(404).json({ error: 'Poll not found' });

        const currentOptions = rows[0].options;
        if (currentOptions[selectedOption] === undefined) {
            return res.status(400).json({ error: 'Invalid option' });
        }

        currentOptions[selectedOption] += 1;

        const updateQuery = `
            UPDATE polls 
            SET options = $1 
            WHERE id = $2 
            RETURNING id as "_id", options
        `;
        const updateResult = await pool.query(updateQuery, [currentOptions, pollId]);

        // 🔥 ล้าง Cache เพื่อให้คนอื่นเห็นคะแนนล่าสุดทันที
        await clearCache();

        res.json({ message: 'Vote successful', updatedPoll: updateResult.rows[0] });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// ----------------------------------------------------------------------
// 🔗 API 4: ลบ (DELETE) -> ล้าง Cache
// ----------------------------------------------------------------------
app.delete('/api/polls/:id', async (req, res) => {
    try {
        const pollId = req.params.id;
        const query = 'DELETE FROM polls WHERE id = $1 RETURNING id';
        const { rows } = await pool.query(query, [pollId]);

        if (rows.length === 0) return res.status(404).json({ error: 'Poll not found' });

        // 🔥 ล้าง Cache
        await clearCache();
        
        res.json({ message: 'Poll deleted successfully', deletedId: pollId });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend (Postgres + Redis) Running on http://localhost:${PORT}`);
});