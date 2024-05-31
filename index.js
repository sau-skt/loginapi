const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express();
const port = 3000;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json()); // To parse JSON bodies

// MongoDB connection URI
const mongoURI = 'mongodb://127.0.0.1:27017/newToDo';

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Define User schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mid: { type: String, required: true }
});

// Create User model
const User = mongoose.model('users', userSchema);

// Register User (Example endpoint for registering users)
app.post('/register', async (req, res) => {
  const { email, password, mid } = req.body;

  if (!email || !password || !mid) {
    return res.status(400).json({ error: 'Email ,password and mid are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, mid });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Define the GET API to check if email exists and return password
app.get('/get-mid', async (req, res) => {
  const email = req.query.email;

  if (!email) {
    return res.status(400).json({ error: 'Email parameter is required' });
  }

  try {
    const user = await User.findOne({ email: email });
    if (user) {
      res.json({ exists: true, mid: user.mid });
    } else {
      res.json({ exists: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login Endpoint
app.get('/login', async (req, res) => {
  const { email, password } = req.query;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email: email });
    if (user && await bcrypt.compare(password, user.password)) {
      res.json({ message: true });
    } else {
      res.status(200).json({ message: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
