const { test } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const Task = require('../server/models/Task');
const app = require('../server/app');

test('task API responses and database outage handling (mock database)', async t => {
  const server = app.listen(0);
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://localhost:${server.address().port}`;
  const request = (path, method = 'GET', body) => fetch(base + path, {
    method, headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body)
  });
  assert.equal((await request('/api/health')).status, 503);
  assert.equal((await request('/api/tasks')).status, 503);
  const original = mongoose.connection.readyState;
  mongoose.connection.readyState = 1;
  t.after(() => { mongoose.connection.readyState = original; });
  const task = { _id: '507f1f77bcf86cd799439011', title: 'Learn Azure', done: false };
  t.mock.method(Task, 'find', () => ({ sort: async () => [task] }));
  t.mock.method(Task, 'create', async data => ({ ...task, ...data }));
  t.mock.method(Task, 'findByIdAndUpdate', async (id, change) => ({ ...task, ...change.$set }));
  t.mock.method(Task, 'findByIdAndDelete', async () => task);
  assert.equal((await request('/api/health')).status, 200);
  assert.deepEqual(await (await request('/api/tasks')).json(), [task]);
  const created = await request('/api/tasks', 'POST', { title: task.title });
  assert.equal(created.status, 201);
  assert.equal((await created.json()).title, task.title);
  assert.equal((await request('/api/tasks', 'POST', { title: ' ' })).status, 400);
  const updated = await request('/api/tasks/' + task._id, 'PUT', { done: true });
  assert.equal((await updated.json()).done, true);
  assert.equal((await request('/api/tasks/' + task._id, 'PUT', { done: 'yes' })).status, 400);
  assert.equal((await request('/api/tasks/bad', 'DELETE')).status, 400);
  assert.equal((await request('/api/tasks/' + task._id, 'DELETE')).status, 204);
  Task.findByIdAndDelete.mock.mockImplementation(async () => null);
  assert.equal((await request('/api/tasks/' + task._id, 'DELETE')).status, 404);
  assert.equal((await request('/api/unknown')).status, 404);
  const home = await request('/');
  assert.equal(home.status, 200);
  assert.match(await home.text(), /Daylist/);
});

test('task schema validation', async () => {
  await assert.rejects(new Task({ title: ' ' }).validate());
  await assert.rejects(new Task({ title: 'a'.repeat(151) }).validate());
  const task = new Task({ title: ' Read documentation ' });
  await task.validate();
  assert.equal(task.title, 'Read documentation');
  assert.equal(task.done, false);
});
