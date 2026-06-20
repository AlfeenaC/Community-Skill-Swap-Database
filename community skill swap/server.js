const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(session({ secret: 'your-secret-key', resave: false, saveUninitialized: true }));

const path = require('path');

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, '/')));

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  multipleStatements: true
};

let db;

async function initDB() {
  db = await mysql.createConnection(dbConfig);
  await db.execute(`CREATE DATABASE IF NOT EXISTS skillswap`);
  await db.end();
  const dbConfigWithDB = { ...dbConfig, database: 'skillswap' };
  db = await mysql.createConnection(dbConfigWithDB);
  await db.execute(`CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    offerSkill VARCHAR(255) DEFAULT '',
    requireSkill VARCHAR(255) DEFAULT ''
  )`);
  console.log('Database and table initialized');
}

initDB();

// Routes
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    await db.execute('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashed]);
    res.json({ message: 'Signup successful' });
  } catch (err) {
    res.status(400).json({ error: 'Username already exists' });
  }
});

app.post('/signin', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) return res.status(400).json({ error: 'Invalid credentials' });
    const user = rows[0];
    if (!await bcrypt.compare(password, user.password)) return res.status(400).json({ error: 'Invalid credentials' });
    req.session.userId = user.id;
    res.json({ user: { id: user.id, username: user.username, offerSkill: user.offerSkill, requireSkill: user.requireSkill } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/update-skills', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
  const { offerSkill, requireSkill } = req.body;
  try {
    await db.execute('UPDATE users SET offerSkill = ?, requireSkill = ? WHERE id = ?', [offerSkill, requireSkill, req.session.userId]);
    res.json({ message: 'Skills updated' });
  } catch (err) {
    res.status(500).json({ error: 'Error updating skills' });
  }
});

app.get('/matches', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
  try {
    const [userRows] = await db.execute('SELECT offerSkill, requireSkill FROM users WHERE id = ?', [req.session.userId]);
    const user = userRows[0];
    const [matches] = await db.execute('SELECT username, offerSkill, requireSkill FROM users WHERE LOWER(offerSkill) = LOWER(?) AND LOWER(requireSkill) = LOWER(?) AND id != ?', [user.requireSkill, user.offerSkill, req.session.userId]);
    res.json({ matches });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching matches' });
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.json({ message: 'Logged out' });
  });
});

app.listen(3000, () => console.log('Server running on port 3000'));
