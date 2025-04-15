const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();

// ✅ MySQL Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'priyam@123',
  database: 'todo_app'
});

db.connect(err => {
  if (err) throw err;
  console.log('✅ MySQL Connected...');
});

// ✅ Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false
}));

// ✅ Routes

// Home Page
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views', 'index.html')));

// Signup Page
app.get('/signup', (req, res) => res.sendFile(path.join(__dirname, 'views', 'signup.html')));

// Login Page
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'views', 'login.html')));

// To-Do Page
app.get('/todo', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.sendFile(path.join(__dirname, 'views', 'todo.html'));
});

// ✅ Signup Handler
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  
  db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
    if (err) {
      console.error(err);
      return res.send('User may already exist or an error occurred.');
    }
    res.redirect('/login');
  });
});

// ✅ Login Handler
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
    if (err || results.length === 0) return res.send('Invalid credentials');

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      req.session.user = user;
      res.redirect('/todo');
    } else {
      res.send('Invalid credentials');
    }
  });
});

// ✅ Logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// ✅ Add To-Do
app.post('/add-todo', (req, res) => {
  const { task } = req.body;
  const user = req.session.user;
  if (!user) return res.status(401).send('Not authorized');

  db.query('INSERT INTO todos (user_id, task, completed) VALUES (?, ?, 0)', [user.id, task], (err) => {
    if (err) return res.status(500).send(err);
    res.sendStatus(200);
  });
});

// ✅ Get To-Dos
app.get('/todos', (req, res) => {
  const user = req.session.user;
  if (!user) return res.status(401).send('Not authorized');

  db.query('SELECT * FROM todos WHERE user_id = ?', [user.id], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// ✅ Update To-Do
app.post('/update-todo', (req, res) => {
  const { id, task, completed } = req.body;
  const user = req.session.user;
  if (!user) return res.status(401).send('Not authorized');

  db.query(
    'UPDATE todos SET task = ?, completed = ? WHERE id = ? AND user_id = ?',
    [task, completed, id, user.id],
    (err) => {
      if (err) return res.status(500).send(err);
      res.sendStatus(200);
    }
  );
});

// ✅ Delete To-Do
app.post('/delete-todo', (req, res) => {
  const { id } = req.body;
  const user = req.session.user;
  if (!user) return res.status(401).send('Not authorized');

  db.query('DELETE FROM todos WHERE id = ? AND user_id = ?', [id, user.id], (err) => {
    if (err) return res.status(500).send(err);
    res.sendStatus(200);
  });
});

// ✅ Start Server
app.listen(3000, () => console.log('🚀 Server running on http://localhost:3000'));
