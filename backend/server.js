const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const app = express();
const port = process.env.PORT || 5001;

// Load environment variables
dotenv.config();

// Middleware
app.use(express.json());
app.use(cors());
// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
const mongoUri = process.env.MONGO_URI;
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB Atlas (patsy database)'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Import User model
const User = require('./models/User');

// In-memory session storage (consider Redis for production)
const activeSessions = {};

// Generate a random session token
function generateSessionToken() {
  return Math.random().toString(36).substr(2) + Date.now().toString(36);
}

// Register endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const sessionToken = generateSessionToken();
    activeSessions[username] = { token: sessionToken };
    res.status(200).json({ message: 'Login successful', sessionToken });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Serve index.html for all other routes (for SPA routing, if needed)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});