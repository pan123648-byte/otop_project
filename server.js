// 1. เรียกใช้งานผู้ช่วยที่จำเป็น (เพิ่ม pg)
const express = require('express');
const { Pool } = require('pg'); // เปลี่ยนจาก mysql2 เป็น pg
const cors = require('cors');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 

// 2. ตั้งค่า Server ของเรา (เหมือนเดิม)
const app = express();
app.use(cors());
app.use(express.json()); 
app.use(express.static('public')); 

const JWT_SECRET = 'kalasin-otop-project-is-the-best-in-the-world-2025';

// 3. เชื่อมต่อไปยังฐานข้อมูล PostgreSQL (ส่วนที่เปลี่ยน)
// เราจะใช้ DATABASE_URL ที่ได้จาก Render.com โดยตรง
const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// 4. สร้าง "ยามรักษาความปลอดภัย" (Middleware - เหมือนเดิม)
function verifyToken(req, res, next) {
    // ... โค้ดส่วนนี้เหมือนเดิมทุกประการ ...
}

// =============================================================
// 5. สร้าง "เคาน์เตอร์บริการ" (API Endpoints)
// **แก้ไขเล็กน้อยให้ใช้ синтаксис ของ pg**
// =============================================================

app.post('/api/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 8); 
        // สังเกต: คำสั่ง SQL จะใช้ $1, $2 แทน ?
        await db.query("INSERT INTO users (email, password, role) VALUES ($1, $2, $3)", [email, hashedPassword, 'admin']);
        res.status(201).send({ message: "สมัครสมาชิกสำเร็จ!" });
    } catch (error) {
        res.status(500).send({ message: "เกิดข้อผิดพลาดในการสมัครสมาชิก" });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        if (result.rows.length === 0) {
            return res.status(404).send({ message: "ไม่พบอีเมลนี้ในระบบ" });
        }
        const user = result.rows[0];
        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) {
            return res.status(401).send({ message: "รหัสผ่านไม่ถูกต้อง!" });
        }
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: 86400 }); 
        res.status(200).send({ accessToken: token });
    } catch (error) {
        res.status(500).send({ message: "เกิดข้อผิดพลาดในการล็อกอิน" });
    }
});

app.get('/api/products', async (req, res) => {
    const result = await db.query("SELECT * FROM products ORDER BY id DESC");
    res.status(200).json(result.rows);
});

app.post('/api/products', verifyToken, async (req, res) => {
    try {
        const { name, description, price, image_url, location_gps } = req.body;
        await db.query(
            "INSERT INTO products (name, description, price, image_url, location_gps, created_by) VALUES ($1, $2, $3, $4, $5, $6)",
            [name, description, price, image_url, location_gps, req.userId]
        );
        res.status(201).send({ message: "เพิ่มสินค้าสำเร็จ!" });
    } catch (error) {
        res.status(500).send({ message: "เกิดข้อผิดพลาดในการเพิ่มสินค้า" });
    }
});

// 6. สั่งให้ "หลังร้าน" เปิดทำการ
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ OTOP Server is now open on port ${PORT}`);
});