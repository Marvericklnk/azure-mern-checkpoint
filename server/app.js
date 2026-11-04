const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Task = require('./models/Task');
const app = express();
app.use(express.json({ limit: '20kb' }));

// Health reflects the actual connection; it never pretends a database is connected.
app.get('/api/health', (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({ database: connected ? 'connected' : 'disconnected' });
});
app.use('/api/tasks', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) return res.status(503).json({ message: 'Database unavailable. Please try again later.' });
  next();
});
app.param('id', (req, res, next, id) => {
  if (!mongoose.isObjectIdOrHexString(id)) return res.status(400).json({ message: 'Invalid task ID.' });
  next();
});
app.get('/api/tasks', async (req, res, next) => {
  try { res.json(await Task.find().sort({ createdAt: -1 })); } catch (err) { next(err); }
});
app.post('/api/tasks', async (req, res, next) => {
  try {
    if (typeof req.body?.title !== 'string' || !req.body.title.trim()) return res.status(400).json({ message: 'Enter a task title.' });
    res.status(201).json(await Task.create({ title: req.body.title }));
  } catch (err) { next(err); }
});
app.put('/api/tasks/:id', async (req, res, next) => {
  try {
    const changes = {};
    if (req.body?.title !== undefined) {
      if (typeof req.body.title !== 'string' || !req.body.title.trim()) return res.status(400).json({ message: 'Enter a task title.' });
      changes.title = req.body.title;
    }
    if (req.body?.done !== undefined) {
      if (typeof req.body.done !== 'boolean') return res.status(400).json({ message: 'Done must be true or false.' });
      changes.done = req.body.done;
    }
    if (!Object.keys(changes).length) return res.status(400).json({ message: 'No changes supplied.' });
    const task = await Task.findByIdAndUpdate(req.params.id, { $set: changes }, { new: true, runValidators: true });
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    res.json(task);
  } catch (err) { next(err); }
});
app.delete('/api/tasks/:id', async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    res.status(204).end();
  } catch (err) { next(err); }
});
app.use('/api', (req, res) => res.status(404).json({ message: 'API route not found.' }));
// Serve Vite's production output from the same host as the API.
app.use(express.static(path.join(__dirname, '../client/dist')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../client/dist/index.html')));
app.use((req, res) => res.status(404).send('Page not found.'));
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') return res.status(400).json({ message: 'Task title must contain 1–150 characters.' });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Invalid JSON.' });
  res.status(500).json({ message: 'Unable to complete the request.' });
});
module.exports = app;
