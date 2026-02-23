import { sequelize } from './src/config/database';
import { initializeDatabase } from './src/config/database';

async function checkOTP() {
  try {
    await initializeDatabase();
    
    // Import OTP model  
    const { OTP } = await import('./src/database/models');
    
    const otps = await OTP.findAll({
      where: { email: 'test@example.com' },
      order: [['createdAt', 'DESC']],
      limit: 1
    });
    
    if (otps.length > 0) {
      console.log('Latest OTP for test@example.com:', otps[0].get('code'));
    } else {
      console.log('No OTP found for test@example.com');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkOTP();
