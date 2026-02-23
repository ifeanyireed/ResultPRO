# Results Pro Backend

School management and results processing backend API built with Node.js, Express, and MySQL.

## Setup

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
cd backend
npm install
```

2. **Environment Setup**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=resultspro_db
JWT_SECRET=your_secret_key_here_min_32_chars
```

3. **Database Setup**

Create MySQL database:
```sql
CREATE DATABASE resultspro_db;
```

4. **Start Development Server**
```bash
npm run dev
```

Server will run at `http://localhost:5000`

## Project Structure

```
src/
├── config/           # Configuration files (db, env, mail, etc.)
├── middleware/       # Express middleware (auth, cors, errors)
├── modules/          # Feature modules (auth, onboarding, schools, etc.)
│   ├── auth/
│   ├── onboarding/
│   └── common/
├── database/         # Database models and migrations
├── utils/            # Utilities and helpers
├── events/           # Event emitters and listeners
├── app.ts            # Express app setup
└── server.ts         # Server entry point
```

## Available Scripts

```bash
npm run dev              # Start dev server with hot reload
npm run build            # Build TypeScript to JavaScript
npm start                # Start production server
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database with sample data
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm run test             # Run tests
npm run test:watch       # Watch mode for tests
npm run test:e2e         # Run E2E tests
```

## API Endpoints

### Health Check
```
GET /api/health
```

### Authentication
```
POST /api/auth/register
POST /api/auth/verify-email
POST /api/auth/login
```

### Onboarding (Protected)
```
GET /api/onboarding/status
POST /api/onboarding/step/:stepNumber
```

## Development Notes

- All timestamps are in UTC
- Database uses soft deletes (paranoid: true)
- JWT tokens expire after 24 hours
- Refresh tokens expire after 7 days

## Next Steps

1. Implement Auth endpoints (Phase 1)
2. Create database migrations
3. Build Onboarding service
4. Implement CSV processing
5. Add comprehensive tests

## Support

For issues or questions, contact the development team.
