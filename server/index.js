require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
async function start() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required.');
  await mongoose.connect(process.env.MONGO_URI);
  // Azure supplies PORT; 3000 is used for local development.
  app.listen(process.env.PORT || 3000, () => console.log('Task board server started.'));
}
start().catch(() => {
  console.error('Startup failed. Check MONGO_URI and MongoDB network access.');
  process.exitCode = 1;
});
