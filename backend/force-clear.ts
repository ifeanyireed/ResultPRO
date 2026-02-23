import { sequelize } from './src/config/database';
import { SchoolAdminUser } from './src/database/models';

async function forceDelete() {
  try {
    await sequelize.authenticate();
    
    const result = await SchoolAdminUser.destroy({
      where: {},
      force: true,
    });
    
    console.log(`✓ Deleted ${result} admin user(s) (FORCE)`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

forceDelete();
