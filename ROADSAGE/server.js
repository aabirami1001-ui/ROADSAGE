require('dotenv').config();
const express = require('express'),
    cors = require('cors'),
    path = require('path'),
    fs = require('fs');
const db = require('./database');
const auth = require('./routes/auth'),
    reports = require('./routes/reports'),
    admin = require('./routes/admin');
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, {
    recursive: true
});
app.use('/uploads', express.static(uploadDir));
app.use('/api/auth', auth);
app.use('/api/reports', reports);
app.use('/api/admin', admin);
app.use(express.static(path.join(__dirname, '../frontend')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../frontend/index.html')));
app.use((err, req, res, next) => {
    console.error(err);
    res.status(400).json({
        message: err.message || 'Request failed'
    })
});
const email = (process.env.ADMIN_EMAIL || 'admin@roadsage.local').toLowerCase();
const bcrypt = require('bcryptjs');
if (!db.prepare('SELECT id FROM users WHERE email=?').get(email)) {
    db.prepare('INSERT INTO users(name,email,password,role,createdAt) VALUES(?,?,?,?,?)').run('RoadSage Administrator', email, bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'Admin123@123', 10), 'admin', new Date().toISOString());
    console.log('Default admin created: ' + email + ' / ' + (process.env.ADMIN_PASSWORD || 'Admin123@123'));
}
const port = process.env.PORT || 3000;
app.listen(port, () => console.log('RoadSage running at http://localhost:' + port));