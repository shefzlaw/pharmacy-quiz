const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Connect to MongoDB
const mongoUri = process.env.MONGO_URI;
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).catch(err => console.error('MongoDB connection error:', err));

exports.handler = async (event, context) => {
  try {
    const { username, password } = JSON.parse(event.body);
    if (!username || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Username and password are required' }),
      };
    }

    // Normalize username
    const normalizedUsername = username.toLowerCase();

    // Find user
    const user = await User.findOne({ username: normalizedUsername });
    if (!user) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid username or password' }),
      };
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid username or password' }),
      };
    }

    // Generate session token (simplified for serverless)
    const sessionToken = Math.random().toString(36).substr(2) + Date.now().toString(36);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Login successful', sessionToken }),
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error during login' }),
    };
  }
};