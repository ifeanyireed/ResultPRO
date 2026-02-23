import { sequelize } from './src/config/database';
import { initializeDatabase } from './src/config/database';

async function verifyEmail() {
  try {
    await initializeDatabase();
    
    // Get all models
    const { School } = await import('./src/database/models');
    
    // Find school for test@example.com
    const school = await School.findOne({ where: { contactEmail: 'test@example.com' } });
    
    if (!school) {
      console.log('School not found');
      process.exit(1);
    }
    
    console.log('Found school:', school.get('name'), 'with email:', school.get('contactEmail'));
    console.log('Current status:', school.get('status'));
    console.log('Current verificationStatus:', school.get('verificationStatus'));
    
    // Manual verification status (simulating email verification)
    await school.update({
      verificationStatus: 'EMAIL_VERIFIED',
      status: 'AWAITING_VERIFICATION_DOCS',
    });
    
    console.log('✓ Email verified! School status updated to:', school.get('status'));
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

verifyEmail();
