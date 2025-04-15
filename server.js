const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const Note = require('./models/Notes'); // note model
const app = express();
const PORT = 3000;

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/userDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  username: String,
  email: String,
  phone: String,
  password: String,
});
const User = mongoose.model('User', userSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));

// Sign-up
app.post('/index', async (req, res) => {
  const { name, username, email, phone, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.send('Email already registered.');
    await new User({ name, username, email, phone, password }).save();
    res.redirect('/login.html');
  } catch (err) {
    res.send('Error signing up');
  }
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (user) res.redirect('/main.html');
  else res.send('Incorrect email or password');
});

// Save Note (POST)
app.post('/api/notes', async (req, res) => {
  try {
    const note = new Note({ content: req.body.content });
    await note.save();
    res.status(201).send(note);
  } catch (err) {
    res.status(500).send('Error saving note');
  }
});

// Get All Notes (GET)
app.get('/api/notes', async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.send(notes);
  } catch (err) {
    res.status(500).send('Error fetching notes');
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
