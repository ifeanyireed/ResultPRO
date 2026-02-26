import { createApp } from './app.js';
import { initializeDatabase } from '@config/database';
import { initializeMailer } from '@config/mail';
import { config } from '@config/environment';
import { uploadLogoToS3 } from '@modules/common/utils/logo-upload';
import { EmailTemplateService } from '@modules/common/services/email-template.service';

async function startServer() {
  try {
    console.log('\n🚀 Starting Results Pro Backend Server...\n');

    // Initialize database
    console.log('📦 Initializing database connection...');
    await initializeDatabase();

    // Initialize mailer
    console.log('📧 Initializing mail service...');
    initializeMailer();

    // Upload logo to S3 and set it in email templates (non-blocking, runs in background)
    console.log('☁️ Starting S3 logo upload (background task)...');
    uploadLogoToS3()
      .then((logoUrl) => {
        EmailTemplateService.setLogoUrl(logoUrl);
        console.log('✅ Logo uploaded to S3:', logoUrl);
      })
      .catch((logoError) => {
        console.warn('⚠️ Failed to upload logo to S3:', logoError instanceof Error ? logoError.message : logoError);
        console.log('📧 Email templates will display as text fallback');
      });

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
