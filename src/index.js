const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const port = process.env.PORT || 3000;
const mongoose = require('mongoose');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Implementing IO for real-time communication
const { Server } = require('socket.io');
const io = new Server(server);

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('user-message', (message) => {
    io.emit('message', message);
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

// Use CORS middleware
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const saltRounds = 10;

// DATABASE CONNECTION
mongoose.connect('mongodb://localhost:27017/local')
  .then(() => console.log('MongoDB connected!'))
  .catch(err => console.log('MongoDB connection error:', err));

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Define User schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  }
});

const User = mongoose.model('User', userSchema);

// Route to handle form submission
app.post('/signup', (req, res) => {
  const { username, password, email } = req.body;
  console.log(`"Received username: ${username}, password: ${password}, email: ${email}"`);
  
  // Ensure username and password are strings OR //PREVENTING PARAMETER POLLUTION
  if (Array.isArray(username) || Array.isArray(password)) {
    return res.status(400).send('Invalid input: username or password is an array.');
  }

  bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
    if (err) {
      console.error('Error hashing password:', err);
      return res.status(500).send('Error hashing password');
    }

    const newUser = new User({ username, password: hashedPassword, email });

    newUser.save()
      .then(() => {
        console.log('User saved successfully');
        return res.redirect('index.html');
      })
      .catch(err => {
        console.error('Error saving user:', err);
        if (!res.headersSent) {
          return res.status(500).send('Error saving user');
        }
      });
  });
});

app.post('/login', async (req, res) => {
  let { username, password, name } = req.body;
  // Use 'name' if 'username' is not provided
  username = username || name;

  // Ensure username and password are strings
  username = String(username);
  password = String(password);

  if (!username || !password) {
    console.log('Username or password not provided');
    return res.status(400).send("login failed: Username or password not provided");
  }

  try {
    const user = await User.findOne({ username: username });
    if (!user) {
      console.log('User not found');
      return res.status(401).send("login failed: User not found");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password does not match');
      return res.status(401).send("login failed: Incorrect password");
    }

    console.log('Password matches');
    res.send("login successfully");
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send("error occurred");
  }
});

app.use(express.static(path.join(__dirname, '../public')));

app.get('/Eduverse', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

app.get('/HTML', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'tut.html'));
});

app.get('/css', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'css.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'login.html'));
});

app.post('/Eduverse', (req, res) => {
  const user = {
    name: req.body.name,
    password: req.body.password
  };
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

app.get('/profile',(req,res) =>{
  res.sendFile(path.join(__dirname,'../public','profile.html'));
});

app.get('/dsa',(req,res) =>{
  res.sendFile(path.join(__dirname, '../public', 'dsa.html'));
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
  }
});
