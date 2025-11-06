# Macro-Data Fusion Platform - Deployment Guide

## Quick Start with Docker

### Prerequisites
- Docker & Docker Compose
- 4GB RAM minimum
- Port availability: 3000 (frontend), 8000 (API), 27017 (MongoDB)

### Deploy Locally

1. **Clone and navigate to project root:**
\`\`\`bash
cd macro-data-fusion
\`\`\`

2. **Start all services:**
\`\`\`bash
docker-compose up -d
\`\`\`

3. **Access services:**
- Frontend: http://localhost:3000
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- MongoDB: localhost:27017 (credentials: root/password)

4. **View logs:**
\`\`\`bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f scheduler
\`\`\`

5. **Stop services:**
\`\`\`bash
docker-compose down
\`\`\`

## Manual Deployment

### Backend Setup

1. **Install Python 3.9+**

2. **Create virtual environment:**
\`\`\`bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
\`\`\`

3. **Install dependencies:**
\`\`\`bash
pip install -r requirements.txt
\`\`\`

4. **Create .env file:**
\`\`\`env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=macro_data_fusion
FASTAPI_ENV=development
LOG_LEVEL=INFO
SCHEDULER_TIME_UTC=02:00
\`\`\`

5. **Start MongoDB (ensure it's running):**
\`\`\`bash
# Using Docker
docker run -d -p 27017:27017 --name mongo mongo:7.0

# Or use local MongoDB installation
\`\`\`

6. **Run API server:**
\`\`\`bash
python main.py
# Server runs on http://localhost:8000
\`\`\`

7. **In another terminal, run scheduler:**
\`\`\`bash
python scheduler_v2.py
\`\`\`

### Frontend Setup

1. **Install Node.js 18+**

2. **Install dependencies:**
\`\`\`bash
cd frontend
npm install
# or
pnpm install
\`\`\`

3. **Set environment variables:**
Create `.env.local`:
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:8000
\`\`\`

4. **Start development server:**
\`\`\`bash
npm run dev
\`\`\`

Frontend runs on http://localhost:3000

## Production Deployment (Vercel + Railway/Render)

### Option 1: Vercel (Frontend) + Railway (Backend)

#### Deploy Frontend to Vercel

1. Push code to GitHub
2. Connect GitHub repo to Vercel
3. Set environment variable:
   - `NEXT_PUBLIC_API_URL`: Your Railway API URL
4. Deploy

#### Deploy Backend to Railway

1. Connect GitHub repo to Railway
2. Add MongoDB plugin
3. Set environment variables:
   - `MONGODB_URI`: Provided by Railway
   - `FASTAPI_ENV`: production
4. Add custom start command:
   \`\`\`
   uvicorn main:app --host 0.0.0.0 --port $PORT
   \`\`\`
5. Deploy

#### Deploy Scheduler to Railway (separate service)

Create `railway.toml`:
\`\`\`toml
[build]
builder = "dockerfile"
dockerfile = "backend/Dockerfile"

[deploy]
startCommand = "python scheduler_v2.py"
\`\`\`

### Option 2: Docker to Render/Fly.io

#### Render.com

1. Connect GitHub repo
2. Create Web Service with Docker
3. Set environment variables
4. Deploy

#### Fly.io

1. Install flyctl: `curl -L https://fly.io/install.sh | sh`
2. Run: `flyctl launch`
3. Configure fly.toml
4. Deploy: `flyctl deploy`

## Monitoring & Maintenance

### Log Monitoring

- Backend logs: `/app/logs/` or docker logs
- Scheduler logs: `scheduler.log`
- Frontend logs: Browser console + server logs

### Database Maintenance

\`\`\`bash
# Backup MongoDB
mongodump --uri="mongodb://root:password@localhost:27017" --out=./backup

# Restore MongoDB
mongorestore --uri="mongodb://root:password@localhost:27017" ./backup

# Create indexes for performance
db.fusion_scores.createIndex({country: 1, crop: 1, timestamp: -1})
db.weather.createIndex({country: 1, date: -1})
\`\`\`

### Scaling Recommendations

- **High Traffic**: Deploy multiple API instances behind load balancer
- **Data Volume**: Enable MongoDB sharding for horizontal scaling
- **Real-time Updates**: Add WebSocket support in FastAPI
- **Async Jobs**: Use Celery for long-running ingestors

## Troubleshooting

### MongoDB Connection Failed
\`\`\`bash
# Check if MongoDB is running
docker ps | grep mongo

# Reset connection string
MONGODB_URI=mongodb://host.docker.internal:27017  # For Docker on localhost
\`\`\`

### API Returns 503
\`\`\`bash
# Check API logs
docker-compose logs backend

# Ensure MongoDB is healthy
docker-compose ps
\`\`\`

### Scheduler Not Running
\`\`\`bash
# Check scheduler logs
docker-compose logs scheduler

# Verify scheduled time
cat backend/.env | grep SCHEDULER_TIME_UTC
\`\`\`

### Frontend Can't Connect to API
\`\`\`bash
# Check CORS
# Ensure NEXT_PUBLIC_API_URL matches backend URL
# Check browser console for exact error

# In development
NEXT_PUBLIC_API_URL=http://localhost:8000
\`\`\`

## Performance Optimization

1. **API Caching**: Implement Redis for fusion score caching
2. **Database Indexing**: Index frequently queried fields
3. **Frontend Optimization**: Use Next.js Image optimization
4. **Scheduler Parallelization**: Use concurrent.futures for parallel ingestion

## Security Checklist

- [ ] Change MongoDB default credentials
- [ ] Enable MongoDB authentication
- [ ] Use HTTPS in production
- [ ] Implement API rate limiting
- [ ] Add CORS headers for frontend domain
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS redirect
- [ ] Regular security updates
