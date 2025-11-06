# Getting Started with Macro-Data Fusion

## What is This Platform?

A real-time agriculture intelligence platform that:
- Combines satellite crop health data (NDVI)
- Integrates weather forecasts (30-day)
- Analyzes commodity price trends with ML models
- Processes news sentiment for socio-political risk
- Produces a unified "Fusion Score" for agriculture risk assessment

## Project Structure

\`\`\`
macro-data-fusion/
├── backend/                      # Python FastAPI backend
│   ├── main.py                  # FastAPI server & endpoints
│   ├── scheduler_v2.py          # Daily data refresh scheduler
│   ├── requirements.txt         # Python dependencies
│   ├── ingestors/               # Data ingestion modules
│   │   ├── sentinel2_ingestor.py
│   │   ├── weather_ingestor.py
│   │   ├── commodity_ingestor.py
│   │   └── news_ingestor.py
│   └── models/                  # ML models
│       ├── price_predictor.py  # LSTM-like price forecasting
│       └── fusion_calculator.py # Fusion score logic
│
├── frontend/                     # React + Next.js frontend
│   ├── app/
│   │   ├── page.tsx            # Dashboard page
│   │   └── layout.tsx          # Root layout
│   ├── components/
│   │   ├── dashboard.tsx       # Main dashboard layout
│   │   ├── api-client.ts       # Backend API client
│   │   ├── fusion-score-card.tsx
│   │   ├── crop-health-map.tsx
│   │   ├── weather-forecast.tsx
│   │   ├── price-trend-chart.tsx
│   │   └── news-risk-gauge.tsx
│   └── package.json
│
├── docker-compose.yml           # Multi-container setup
├── README.md                    # Project overview
├── ARCHITECTURE.md              # System architecture
├── DEPLOYMENT.md                # Deployment guide
└── GETTING_STARTED.md           # This file
\`\`\`

## Quick Start (5 minutes)

### Option 1: Docker (Easiest)

\`\`\`bash
# 1. Clone repo
git clone <repo-url>
cd macro-data-fusion

# 2. Start all services
docker-compose up -d

# 3. Open in browser
# Frontend: http://localhost:3000
# API Docs: http://localhost:8000/docs
\`\`\`

### Option 2: Local Development

**Backend:**
\`\`\`bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py  # Runs on http://localhost:8000
\`\`\`

**Scheduler (in another terminal):**
\`\`\`bash
cd backend
source venv/bin/activate
python scheduler_v2.py  # Runs daily refresh
\`\`\`

**Frontend:**
\`\`\`bash
npm install
npm run dev  # Runs on http://localhost:3000
\`\`\`

## Understanding the Fusion Score

The Fusion Score combines 4 data sources into a single 0-100 risk metric:

\`\`\`
Fusion Score = (CropHealth + WeatherScore + PriceRisk + NewsRisk) / 4

Risk Levels:
- 75-100: LOW RISK ✓ (stable outlook)
- 50-75: MEDIUM RISK ⚠ (monitor carefully)
- 0-50: HIGH RISK ✗ (significant challenges)
\`\`\`

### Component Breakdown

**Crop Health (0-100)**
- Based on NDVI (satellite vegetation index)
- Higher = healthier crops
- Source: Sentinel-2 satellite imagery

**Weather Score (0-100)**
- Favorability of 30-day forecast
- Considers temperature, rainfall, humidity
- Source: Open-Meteo weather API

**Price Trend (0-100)**
- Commodity price momentum
- Volatility assessment
- Source: Historical price data

**News Risk (0-100)**
- Sentiment analysis of agriculture news
- Reflects socio-political factors
- Source: Google News RSS + NLP

## API Endpoints

### Get Fusion Score
\`\`\`bash
curl http://localhost:8000/fusion-score?country=IN&crop=wheat
\`\`\`

### Get Crop Health Map
\`\`\`bash
curl http://localhost:8000/map/health?country=IN&crop=wheat
\`\`\`

### Get Weather Forecast
\`\`\`bash
curl http://localhost:8000/weather/forecast?country=IN
\`\`\`

### Predict Commodity Price
\`\`\`bash
curl -X POST http://localhost:8000/predict-price?commodity=wheat&days_ahead=30
\`\`\`

### Get News Risk
\`\`\`bash
curl http://localhost:8000/news-risk?country=IN
\`\`\`

### API Documentation
Visit http://localhost:8000/docs for interactive Swagger UI

## Data Refresh Schedule

The scheduler runs daily at **2:00 AM UTC** and:
1. Fetches latest Sentinel-2 NDVI data
2. Updates 30-day weather forecast
3. Ingests current commodity prices
4. Analyzes latest news sentiment
5. Recalculates fusion scores for all countries/crops

To change schedule, modify in backend/.env:
\`\`\`env
SCHEDULER_TIME_UTC=02:00
\`\`\`

## Customization

### Add New Country
1. Add country code to scheduler_v2.py `countries` list
2. Add coordinates to ingestors
3. Restart scheduler

### Change Fusion Score Weights
Modify `FusionScoreCalculator` initialization:
\`\`\`python
custom_weights = {
    'crop_health': 0.3,      # 30%
    'weather_score': 0.3,    # 30%
    'price_trend': 0.2,      # 20%
    'news_risk': 0.2         # 20%
}
calculator = FusionScoreCalculator(db, weights=custom_weights)
\`\`\`

### Connect Real Data Sources

Replace mock data in ingestors:

**Sentinel-2 NDVI**: Get API key from Sentinel Hub
\`\`\`python
# In sentinel2_ingestor.py
response = requests.post(
    "https://services.sentinel-hub.com/api/v1/process",
    json=tile_request,
    headers={"Authorization": f"Bearer {SENTINEL_API_KEY}"}
)
\`\`\`

**Real Price Data**: Load Kaggle CSV or commodity exchange API
\`\`\`python
# In commodity_ingestor.py
prices_df = pd.read_csv('kaggle_commodity_prices.csv')
\`\`\`

**Better Sentiment**: Use HuggingFace model
\`\`\`python
from transformers import pipeline
sentiment_pipeline = pipeline("sentiment-analysis", model="finbert")
result = sentiment_pipeline(text)
\`\`\`

## Troubleshooting

### Dashboard shows "No data available"
- Check if backend is running: http://localhost:8000
- Check API logs: `docker-compose logs backend`
- Verify MongoDB is connected

### Scheduler not running
- Check scheduler logs: `docker-compose logs scheduler`
- Verify time format in .env (must be HH:MM UTC)
- Check MongoDB connection

### High memory usage
- Reduce historical data kept (MongoDB TTL)
- Scale MongoDB separately
- Implement data archival strategy

## Next Steps

1. **Deploy to Production**: Follow DEPLOYMENT.md
2. **Add Real Data Sources**: Integrate actual APIs
3. **User Authentication**: Add Supabase auth
4. **Email Alerts**: Send notifications for high-risk scenarios
5. **Mobile App**: Build React Native version
6. **Export Reports**: PDF/Excel export functionality

## Support

- Issues: Check GitHub issues or create new one
- Documentation: See README.md and ARCHITECTURE.md
- Community: Check discussions section

## License

MIT - See LICENSE file
