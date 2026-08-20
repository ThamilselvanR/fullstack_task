import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret-key';

// Set up express.json() to parse JSON request bodies
app.use(express.json());

// In-memory store for tasks
let tasks = [
  { id: 1, title: 'Learn Node.js', done: false },
  { id: 2, title: 'Build a REST API', done: false }
];
let nextId = 3;

// In-memory store for users
let users = [];
let nextUserId = 1;

// Auth Middleware: Verify JWT from Authorization header
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

// 1. POST /register - hash the password with bcrypt before saving user
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || typeof username !== 'string' || username.trim() === '') {
    return res.status(400).json({ error: 'Username is required and must be a non-empty string.' });
  }
  if (!password || typeof password !== 'string' || password.trim() === '') {
    return res.status(400).json({ error: 'Password is required and must be a non-empty string.' });
  }

  const usernameTrimmed = username.trim();
  const userExists = users.some(user => user.username.toLowerCase() === usernameTrimmed.toLowerCase());
  
  if (userExists) {
    return res.status(400).json({ error: 'Username is already taken.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: nextUserId++,
      username: usernameTrimmed,
      password: hashedPassword
    };

    users.push(newUser);
    res.status(201).json({
      message: 'User registered successfully.',
      user: {
        id: newUser.id,
        username: newUser.username
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// 2. POST /login - compare the hash and return a signed JWT on success
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const user = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  try {
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Sign the JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// 4. Protect all /tasks routes with requireAuth
app.use('/tasks', requireAuth);

// GET /tasks - Return all tasks (Protected)
app.get('/tasks', (req, res) => {
  res.json(tasks);
});

// POST /tasks - Create a task (Protected)
app.post('/tasks', (req, res) => {
  const { title } = req.body;

  // Validate that title is present and is a non-empty string
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required and must be a non-empty string.' });
  }

  const newTask = {
    id: nextId++,
    title: title.trim(),
    done: false
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

// PUT /tasks/:id - Update title/done of a task (Protected)
app.put('/tasks/:id', (req, res) => {
  const targetId = parseInt(req.params.id, 10);
  
  if (isNaN(targetId)) {
    return res.status(400).json({ error: 'Invalid task ID format.' });
  }

  const taskIndex = tasks.findIndex(task => task.id === targetId);

  // Return 404 if the task doesn't exist
  if (taskIndex === -1) {
    return res.status(404).json({ error: `Task with ID ${targetId} not found.` });
  }

  const { title, done } = req.body;
  const task = tasks[taskIndex];

  // Update title if provided
  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Title must be a non-empty string.' });
    }
    task.title = title.trim();
  }

  // Update done status if provided
  if (done !== undefined) {
    if (typeof done !== 'boolean') {
      return res.status(400).json({ error: 'Done status must be a boolean.' });
    }
    task.done = done;
  }

  res.json(task);
});

// DELETE /tasks/:id - Remove a task by ID (Protected)
app.delete('/tasks/:id', (req, res) => {
  const targetId = parseInt(req.params.id, 10);

  if (isNaN(targetId)) {
    return res.status(400).json({ error: 'Invalid task ID format.' });
  }

  const taskIndex = tasks.findIndex(task => task.id === targetId);

  // Return 404 if the task doesn't exist
  if (taskIndex === -1) {
    return res.status(404).json({ error: `Task with ID ${targetId} not found.` });
  }

  tasks.splice(taskIndex, 1);
  res.json({ message: 'Task deleted successfully.' });
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export { app, server };
