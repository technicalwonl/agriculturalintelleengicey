# Architecture Diagram

\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│                          USER (Browser)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         Frontend Dashboard (React + Next.js)            │   │
│  │                                                          │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐   │   │
│  │  │ Fusion Score│  │ Crop Health  │  │Weather Graph │   │   │
│  │  │   Widget    │  │     Map      │  │   (30-day)   │   │   │
│  │  └─────────────┘  └──────────────┘  └──────────────┘   │   │
│  │                                                          │   │
│  │  ┌─────────────┐  ┌──────────────┐                     │   │
│  │  │Price Trend  │  │  News Risk   │                     │   │
│  │  │   Chart     │  │    Gauge     │                     │   │
│  │  └─────────────┘  └──────────────┘                     │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           │                                      │
│                           │ HTTP/REST                            │
│                           ▼                                      │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │
┌─────────────────────────────────────────────────────────────────┐
│           Backend API Server (FastAPI + Python)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           REST Endpoint Controllers                      │   │
│  │  GET /fusion-score    GET /map/health                    │   │
│  │  GET /weather/forecast  POST /predict-price             │   │
│  │  GET /news-risk       GET /health                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           │                                      │
│                           ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │          Fusion Score Calculator                         │   │
│  │   formula: (CH + WS + PT + NR) / 4 = Score             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           │                                      │
│                           ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │            MongoDB Collections                           │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐          │   │
│  │  │   crops    │ │  weather   │ │ commodities│          │   │
│  │  │ (NDVI data)│ │(forecasts) │ │ (prices)   │          │   │
│  │  └────────────┘ └────────────┘ └────────────┘          │   │
│  │                                                          │   │
│  │  ┌────────────┐ ┌────────────┐                         │   │
│  │  │    news    │ │fusion_score│                         │   │
│  │  │(sentiment) │ │ (composite)│                         │   │
│  │  └────────────┘ └────────────┘                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
        ▲                           ▲                   ▲
        │                           │                   │
        │ Daily cron 2AM UTC        │                   │
        │ (refresh all data)        │                   │
        │                           │                   │
┌───────┴────────────────────────────┴───────────────────┴───────┐
│            Background Data Ingestors (Python)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │ Sentinel-2 NDVI  │  │  Weather Data    │                    │
│  │   Ingestor       │  │  Ingestor        │                    │
│  │ (crop health)    │  │(Open-Meteo API)  │                    │
│  └──────────────────┘  └──────────────────┘                    │
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │  Commodity Price │  │  News Sentiment  │                    │
│  │   Ingestor       │  │  Ingestor        │                    │
│  │  (Kaggle CSV)    │  │(Google News RSS) │                    │
│  └──────────────────┘  └──────────────────┘                    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
        │                   │               │              │
        │                   │               │              │
        ▼                   ▼               ▼              ▼
    ┌─────────────┐  ┌──────────────┐ ┌─────────┐  ┌──────────────┐
    │ Sentinel Hub│  │ Open-Meteo   │ │ Kaggle  │  │ Google News  │
    │   (Cloud)   │  │   API        │ │  CSV    │  │  RSS Feed    │
    └─────────────┘  └──────────────┘ └─────────┘  └──────────────┘

Data Flow Example:
─────────────────

1. Daily Refresh (2 AM UTC):
   Scheduler triggers → All 4 ingestors fetch data → Store in MongoDB

2. User Views Dashboard:
   Frontend → GET /fusion-score?country=IN&crop=wheat
   Backend → Query MongoDB → Calculate scores → Return JSON
   Frontend → Render visualizations

3. Scoring Process:
   CropHealth (NDVI avg) ─┐
   WeatherScore (forecast)├─► Fusion Calculator ─► Final Score
   PriceTrend (ML pred)  ─┤   & Risk Level
   NewsRisk (sentiment)   ─┘

\`\`\`

## Data Flow

### Ingest Phase (Daily)
1. Sentinel-2 API → Extract NDVI values → Calculate health score
2. Open-Meteo API → Get 30-day forecast → Calculate weather score
3. Kaggle CSV → Load prices → Predict trends (Prophet/LSTM)
4. Google News RSS → Parse sentiment → Calculate risk score

### Fusion Phase
All scores normalized to 0-100 and averaged into single Fusion Score

### Display Phase
Dashboard fetches latest score and visualizations via REST API
