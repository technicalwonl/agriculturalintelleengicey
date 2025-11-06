# Environment Variables Configuration

## Quick Start

### Local Development with Docker
No setup needed! Docker Compose handles all environment variables automatically.

\`\`\`bash
docker-compose up -d
\`\`\`

### Local Development (Manual Setup)

#### Frontend (.env.local)
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_USE_MOCK_DATA=true
\`\`\`

#### Backend (backend/.env)
\`\`\`env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=macro_data_fusion
FASTAPI_ENV=development
LOG_LEVEL=INFO
SCHEDULER_ENABLED=true
SCHEDULER_TIME_UTC=02:00
\`\`\`

## Production Deployment

### Vercel (Frontend)
1. Go to your Vercel project settings → Environment Variables
2. Add these variables:
   \`\`\`
   NEXT_PUBLIC_API_URL=https://your-api-domain.com
   NEXT_PUBLIC_USE_MOCK_DATA=false
   \`\`\`

### Railway/Render/Fly.io (Backend)
1. Create a `.env` file with production settings:
   \`\`\`
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/macro_data_fusion
   FASTAPI_ENV=production
   DEBUG=false
   SECRET_KEY=generate-random-key-with-openssl
   SCHEDULER_ENABLED=true
   \`\`\`

2. Add external MongoDB (MongoDB Atlas recommended):
   - Create free tier cluster at https://www.mongodb.com/cloud/atlas
   - Get connection string and set as MONGODB_URI

### External APIs (Optional)
For production data sources, register and get API keys from:
- **Sentinel-2 Data**: https://scihub.copernicus.eu/
- **News Data**: https://newsapi.org/
- **Commodity Prices**: https://www.alphavantage.co/

## Environment Variable Reference

### Frontend (NEXT_PUBLIC_* variables)
| Variable | Default | Purpose |
|----------|---------|---------|
| NEXT_PUBLIC_API_URL | http://localhost:8000 | Backend API base URL |
| NEXT_PUBLIC_USE_MOCK_DATA | true | Use mock data as fallback |

### Backend
| Variable | Default | Purpose |
|----------|---------|---------|
| MONGODB_URI | mongodb://localhost:27017 | Database connection string |
| MONGODB_DB_NAME | macro_data_fusion | Database name |
| FASTAPI_ENV | development | Environment (development/production) |
| LOG_LEVEL | INFO | Logging level (DEBUG/INFO/WARNING/ERROR) |
| SCHEDULER_ENABLED | true | Enable/disable automated data refresh |
| SCHEDULER_TIME_UTC | 02:00 | Daily refresh time in UTC (HH:MM format) |
| SECRET_KEY | (required) | JWT secret key for security |
| DEBUG | false | Debug mode (disable in production) |

## Troubleshooting

### API Connection Issues
- Check NEXT_PUBLIC_API_URL points to correct backend
- Ensure backend is running and accessible
- Check CORS settings in backend/.env ALLOWED_ORIGINS

### Database Connection Issues
- Verify MONGODB_URI is correct format
- For local: `mongodb://localhost:27017`
- For MongoDB Atlas: `mongodb+srv://user:password@cluster.mongodb.net/dbname`
- Ensure database is running or connection allowed

### Mock Data Not Working
- Set NEXT_PUBLIC_USE_MOCK_DATA=true to enable fallback
- Check browser console for error details

## Security Best Practices

- Never commit .env files with real API keys to git
- Use `.env.local` for local development
- Rotate SECRET_KEY in production
- Use environment variable services (Vercel Secrets, Railway Vault, etc.)
- Keep external API keys in backend only (not frontend)
