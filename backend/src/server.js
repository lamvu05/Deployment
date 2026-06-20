require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT} [${process.env.NODE_ENV}]`);
    console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use. Retrying in 2s...`);
      setTimeout(() => {
        server.close();
        server.listen(PORT);
      }, 2000);
    } else {
      throw err;
    }
  });
};

startServer().catch((err) => {
  console.error('❌ Failed to start server:', err.message);
  process.exit(1);
});
