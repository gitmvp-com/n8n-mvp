import { createServer } from './server.js';
import { database } from './database.js';

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await database.initialize();
    console.log('Database initialized');

    const app = createServer();
    app.listen(PORT, () => {
      console.log(`\n🚀 n8n MVP Server running on http://localhost:${PORT}`);
      console.log(`📚 API Documentation:`);
      console.log(`   - GET  /health - Health check`);
      console.log(`   - POST /api/workflows - Create workflow`);
      console.log(`   - GET  /api/workflows - List workflows`);
      console.log(`   - POST /api/workflows/:id/execute - Execute workflow`);
      console.log(`   - GET  /api/executions/:id - Get execution details\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();