require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const logRoutes = require('./routes/logRoutes');

const app = express();

// Connect to MongoDB
// Removed top level call, using middleware instead

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Ensure DB connection before handling any routes
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('DB Connection Middleware Error:', error);
    next(error);
  }
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/logs', logRoutes);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

app.get('/', (req, res) => {
  res.send(`
    <html lang="en">
      <head>
        <title>Taskify Backend Status</title>
        <style>
          body { font-family: 'Inter', sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f9fafb; }
          .message-window { background: white; padding: 3rem; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); text-align: center; border-top: 4px solid #10b981; }
          h1 { color: #111827; margin: 0 0 1rem 0; font-size: 24px; }
          p { color: #6b7280; margin: 0; font-size: 16px; }
          .icon { font-size: 48px; margin-bottom: 1rem; }
        </style>
      </head>
      <body>
        <div class="message-window">
          <div class="icon">🚀</div>
          <h1>Backend Successfully Running!</h1>
          <p>The Taskify API server is deployed and fully operational.</p>
        </div>
      </body>
    </html>
  `);
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

module.exports = app;
