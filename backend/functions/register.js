const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Connect to MongoDB (runs once per function invocation)
const mongoUri = process.env.MONGO_URI;
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).catch(err => console.error('MongoDB connection error:', err));

exports.handler = async (event, context) => {
  try {
    // Parse body (Netlify Functions receive JSON strings)
    const { username, password } = JSON.parse(event.body);
    if (!username || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Username and password are required' }),
      };
    }

    // Normalize username
    const normalizedUsername = username.toLowerCase();

    // Check if username exists
    const existingUser = await User.findOne({ username: normalizedUsername });
    if (existingUser) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Username already exists' }),
      };
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Save user
    const user = new User({ username: normalizedUsername, password: hashedPassword });
    await user.save();

    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Registration successful' }),
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error during registration' }),
    };
  }
};