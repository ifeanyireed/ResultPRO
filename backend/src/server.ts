import { createApp } from './app';
import { initializeDatabase } from '@config/database';
import { initializeMailer } from '@config/mail';
import { config } from '@config/environment';

async function startServer() {
  try {
    console.log('\n🚀 Starting Results Pro Backend Server...\n');

    // Initialize database
    console.log('📦 Initializing database connection...');
    await initializeDatabase();

    // Initialize mailer
    console.log('📧 Initializing mail service...');
    initializeMailer();

    // Create Express app
    const app = await createApp();

    // Start server
    const PORT = config.PORT;
    app.listen(PORT, () => {
      console.log(`\n✅ Server running at http://localhost:${PORT}`);
      console.log(`📝 API URL: ${config.API_URL}`);
      console.log(`🌐 Frontend URL: ${config.FRONTEND_URL}`);
      console.log(`🔧 Environment: ${config.NODE_ENV}\n`);
    });
  } catch (error) {
    console.error('\n❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
