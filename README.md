# Macro-Data Fusion Platform - Complete Guide

## What is This Project?

This is a **smart farming assistant web application** that helps farmers make better decisions about their crops. It works like a personal advisor that collects information from 4 different sources (weather, crop satellite images, market prices, and news) and combines them into one simple number to tell you: "Is this a good time to plant? Should I worry about my crops? Are prices going up or down?"

### Real-World Example
You're a wheat farmer in India. Instead of checking:
- Weather websites for temperature and rain
- News for political situations affecting crops
- Market websites for price trends
- Satellite images for crop health

You open this app and see **ONE number: 72/100** which tells you the overall risk level. Below it, you see exactly which factors are affecting your crops and what actions to take.

---

## Technologies Used (What Powers This App)

Think of this like building a car - we used different parts:

### Frontend (What You See)
- **React** - A library that makes interactive web pages (like the buttons and charts you click)
- **Next.js** - A framework that makes React easier and faster
- **Tailwind CSS** - A tool for beautiful, modern styling
- **shadcn/ui** - Pre-made beautiful buttons, cards, and components
- **Recharts** - Library for drawing pretty graphs and charts

### Backend (What Works Behind the Scenes)
- **FastAPI** - A Python framework that creates an API (a way for the website to talk to the server)
- **Python** - The programming language used for data processing and calculations
- **MongoDB** - A database (like a digital filing cabinet) that stores all the data

### Data Sources (Where We Get Information)
- **Sentinel-2 Satellites** - Real NASA satellites that take pictures of crops from space to measure crop health
- **Open-Meteo API** - Free weather data service
- **Google News RSS** - News feeds about agriculture and prices
- **Commodity Market Data** - Current and historical prices of crops like wheat, rice, corn

### Infrastructure (Where It Runs)
- **Docker** - Technology to package the entire app so it runs the same everywhere
- **Cron Scheduler** - Automatic task that refreshes data every day at 2 AM UTC

---

## How It Works (The Flow)

\`\`\`
1. Data Collection (Every Day at 2 AM UTC)
   ├── Satellite Images → Crop Health Score (0-100)
   ├── Weather API → Rain/Temp Forecast Score (0-100)
   ├── Price Data → Price Trend Score (0-100)
   └── News → Political/Market Risk Score (0-100)
   
2. Fusion Calculation
   └── (Crop Health + Weather + Prices + News) ÷ 4 = FINAL RISK SCORE
   
3. Display to Farmer
   └── Beautiful Dashboard with recommendations
\`\`\`

---

## Features & How Farmers Use Them

### 1. Real-Time Risk Assessment (The Big Number)
**What it shows:** 0-100 score with risk level (Low/Medium/High)

**How farmers use it:** 
- Score 75-100 = Safe to plant or harvest
- Score 50-75 = Be careful, monitor closely
- Score 0-50 = High risk, wait or take precautions

**Example:** If you see 42/100 (High Risk), it might be because prices are falling or weather looks bad. The app tells you WHY.

### 2. Crop Health Map (NDVI)
**What it shows:** Color-coded map of your fields (Green = Healthy, Yellow = Okay, Red = Problem)

**How farmers use it:**
- See which parts of fields are struggling
- Decide where to spray pesticides or fertilizer
- Identify irrigation problems (wet vs dry areas)

**Example:** You see a red patch in your southwest field - this alerts you to check for disease or water problems there.

### 3. Weather Forecast (30-Day Chart)
**What it shows:** Temperature and rainfall predictions for next month

**How farmers use it:**
- Plan when to plant (before rain)
- Schedule irrigation (if rain is coming, don't water)
- Prepare for extreme weather

**Example:** You see rain coming in 5 days - perfect time to apply fertilizer before the downpour washes it away.

### 4. Pest Risk Alert
**What it shows:** Danger level for insects/diseases based on current weather

**How farmers use it:**
- Know when pests will attack (they like warm, humid weather)
- Scout your fields at the right time
- Spray pesticides before pests destroy crops

**Example:** Temperature is 25°C and humidity is 80% - ideal for fungal diseases. The app says "HIGH PEST RISK - Scout your fields and consider spraying."

### 5. Soil Moisture Monitor
**What it shows:** Is your soil too dry or too wet? How much water does your crop need now?

**How farmers use it:**
- Know exactly when to turn on irrigation
- Avoid wasting water
- Prevent root rot from overwatering

**Example:** Wheat needs 40-60% moisture. Sensor shows 35%. App says "NEEDS WATER - Irrigate for 4 hours."

### 6. Yield Forecast (Expected Harvest)
**What it shows:** Prediction of how much crop you'll harvest based on current conditions

**How farmers use it:**
- Plan storage space
- Schedule harvest equipment
- Arrange buyers before harvest

**Example:** "Based on crop health and weather, expect 4.2 tons from this field. Last year you got 3.8 tons."

### 7. Fertilizer Recommender
**What it shows:** Exact nutrients your crop needs right now

**How farmers use it:**
- Buy the right fertilizer mix (NPK ratios)
- Apply at the right growth stage
- Maximize yield while saving money

**Example:** "Wheat is in flowering stage. Apply 1:1:1 NPK ratio. Use 50kg/hectare."

### 8. Price Trend & Forecasting
**What it shows:** Graph of wheat prices over time + prediction for next 30 days

**How farmers use it:**
- Decide when to sell (when prices are predicted to go up, wait; when going down, sell quickly)
- Plan business finances
- Compare your prices to market rates

**Example:** "Prices rising next 2 weeks, then falling. SELL in 10-14 days for best price."

### 9. News Risk Gauge
**What it shows:** Risk percentage based on agriculture news (regulations, tariffs, diseases spreading)

**How farmers use it:**
- Know about government policy changes
- Prepare for market disruptions
- Understand why prices might change

**Example:** "30% Risk - Government announced new export tax on wheat. Prices may fall."

---

## How to Use (Step by Step)

### For First-Time Users
1. Open the app in your browser
2. Select your country (default: India)
3. Select your crop (Rice, Wheat, Corn, etc.)
4. **Look at the big number** - this is your risk score
5. **Read the cards below** - each one tells you something useful
6. **Take action** based on recommendations

### Daily Use
1. Check the app every morning
2. Look for alerts (Red = Immediate action needed)
3. Take the recommended action (spray, irrigate, wait, sell, etc.)

---

## Technical Architecture (For Developers)

### Folder Structure
\`\`\`
project/
├── frontend/              # React Next.js app
│   ├── app/               # Pages and routing
│   ├── components/        # Reusable UI components
│   │   ├── updated-dashboard.tsx      # Main dashboard
│   │   ├── advanced-fusion-card.tsx   # Risk score display
│   │   ├── crop-health-map.tsx        # NDVI heatmap
│   │   ├── pest-risk-alert.tsx        # Pest predictions
│   │   ├── soil-moisture-monitor.tsx  # Irrigation guide
│   │   ├── yield-forecast.tsx         # Harvest prediction
│   │   ├── fertilizer-recommender.tsx # Nutrient guide
│   │   ├── enhanced-weather-chart.tsx # Weather graph
│   │   ├── enhanced-price-chart.tsx   # Price chart
│   │   └── advanced-news-display.tsx  # News feed
│   └── lib/               # Utilities and helpers
│
├── backend/               # FastAPI Python server
│   ├── main.py            # Main API server
│   ├── schemas.py         # Data models
│   ├── fusion.py          # Fusion score calculation
│   ├── scheduler.py       # Daily data refresh
│   ├── ingestors/         # Data collection
│   │   ├── sentinel2_ingestor.py     # Crop health
│   │   ├── weather_ingestor.py       # Weather data
│   │   ├── commodity_ingestor.py     # Price data
│   │   └── news_ingestor.py          # News data
│   └── models/            # Machine learning
│       ├── price_predictor.py        # Price forecasting
│       └── fusion_calculator.py      # Score calculation
│
└── docker-compose.yml     # Docker setup
\`\`\`

### Data Flow
\`\`\`
Satellite → Extract NDVI → Calculate health (0-100)
Weather API → Process forecast → Calculate weather score (0-100)
Prices → Analyze trends → Calculate price score (0-100)
News → Sentiment analysis → Calculate risk score (0-100)
                    ↓
            Fusion Calculator
                    ↓
            Average all 4 scores
                    ↓
        Display on Dashboard to Farmer
\`\`\`

### MongoDB Collections (Data Storage)
- **crops** - Crop health data, NDVI values, field locations
- **weather** - Temperature, rainfall, humidity forecasts
- **commodities** - Price history, trends, predictions
- **news** - Agriculture news, sentiment scores
- **fusion_scores** - Final combined risk scores

---

## Setup & Installation

### Option 1: Docker (Easiest)
\`\`\`bash
# Clone the project
git clone <your-repo-url>
cd macro-data-fusion

# Start everything with one command
docker-compose up

# Frontend: http://localhost:3000
# API: http://localhost:8000
# Database: mongodb://localhost:27017
\`\`\`

### Option 2: Manual Setup (Linux/Mac)

**Backend:**
\`\`\`bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python scheduler.py  # In one terminal
python main.py       # In another terminal
\`\`\`

**Frontend:**
\`\`\`bash
npm install
npm run dev
\`\`\`

### Environment Variables
Create a `.env` file in the backend folder:
\`\`\`
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=macro_fusion
SENTIMENT_HUB_API_KEY=your_key_here
NEWS_API_KEY=your_key_here
COMMODITY_API_KEY=your_key_here
NEXT_PUBLIC_API_URL=http://localhost:8000
LOG_LEVEL=INFO
SCHEDULER_ENABLED=true
SCHEDULER_TIME_UTC=02:00
\`\`\`

---

## API Endpoints (For Developers)

All these endpoints return data that the dashboard uses:

\`\`\`
GET  /fusion-score?country=IN&crop=wheat
     → Returns risk score and components

GET  /map/health?country=IN&crop=wheat
     → Returns crop health NDVI data with locations

GET  /weather/forecast?country=IN
     → Returns 30-day weather forecast

GET  /pest-risk?country=IN&crop=wheat
     → Returns pest risk alert

GET  /soil-moisture?country=IN
     → Returns soil moisture data and irrigation recommendations

GET  /yield-forecast?country=IN&crop=wheat
     → Returns expected harvest amount

GET  /fertilizer-recommend?country=IN&crop=wheat
     → Returns fertilizer NPK recommendations

POST /predict-price?commodity=wheat&days=30
     → Returns price forecast for next 30 days

GET  /news-risk?country=IN
     → Returns news-based risk assessment
\`\`\`

---

## Scoring Formula Explained

\`\`\`
Final Risk Score = (Crop Health + Weather + Prices + News Risk) ÷ 4

Each component is scored 0-100:
- 0-33   = BAD (Red)
- 34-66  = MEDIUM (Yellow)
- 67-100 = GOOD (Green)

Then the average is:
- 0-50   = HIGH RISK (Red) - Don't plant or harvest, issues likely
- 50-75  = MEDIUM RISK (Yellow) - Be careful, monitor closely
- 75-100 = LOW RISK (Green) - Safe to proceed

EXAMPLE:
- Crop Health: 80 (green, healthy)
- Weather: 70 (okay, rain coming)
- Prices: 45 (bad, prices falling)
- News Risk: 60 (medium, some political concern)
Average = (80+70+45+60) ÷ 4 = 63.75 = MEDIUM RISK
\`\`\`

---

## Real Farmer Story

**Meet Rajesh, a wheat farmer in Punjab:**

*Monday:* Opens the app, sees his wheat risk score is 72 (MEDIUM). 
- Crop health is good (85)
- But prices are dropping (45)
- Weather shows rain coming (70)

*Action:* He decides to wait 2 weeks before selling because the price chart shows prices will recover.

*Wednesday:* Weather forecast shows rain tomorrow. He checks soil moisture - it's already 50%. Irrigation monitor says "DON'T WATER - Rain coming in 24 hours." Saves water and money.

*Pest Risk Alert:* After rain, temperature will be 28°C and humidity 85% - perfect for fungal diseases. App recommends scouting. Rajesh walks his fields and catches the problem early. Spends $20 on spray instead of $200 on lost crop.

*Week 2:* Price chart shows wheat prices going up. He sells his wheat and gets 8% better price than he would have a week earlier. Makes an extra $500!

**Result:** Using the app, Rajesh saved water, prevented disease, and earned more money - all in one month.

---

## Supported Crops & Countries

**Countries:** India, USA, Brazil, Egypt, Australia, China

**Crops:** 
- Rice
- Wheat
- Corn
- Soybeans
- Sugarcane
- Cotton
- Potatoes

---

## Future Features (Coming Soon)

- SMS alerts for farmers without internet
- Offline mode for areas with no internet
- Local language support (Hindi, Marathi, Tamil, etc.)
- WhatsApp integration for quick alerts
- Drone integration to capture farm images automatically
- Soil testing lab integration
- Crop insurance recommendations
- Equipment rental marketplace
- Direct buyer connections

---

## Troubleshooting

**Q: The app shows "Failed to fetch"**
A: The backend server isn't running. Run `python main.py` in the backend folder.

**Q: Data isn't updating**
A: The scheduler might be disabled. Check that SCHEDULER_ENABLED=true in .env

**Q: NDVI map shows nothing**
A: Make sure MongoDB is running and contains crop data.

**Q: Why is my risk score always 72?**
A: That's mock data. For real data, connect to actual APIs (Sentinel-2, OpenMeteo, etc.)

---

## Support & Contribution

Found a bug? Have an idea? Create an issue or pull request on GitHub.

For farmers who can't use the app: Contact your local agricultural officer for a paper printout.

---

## License

MIT - Free to use and modify for any purpose

---

## Key Takeaway

**This app turns confusing agricultural data into simple, actionable advice.**

Instead of being a data scientist, a farmer can just check ONE number and take ONE action. That's the power of fusion - combining many sources into one smart recommendation.
#   a g r i c u l t u r a l i n t e l l e e n g i c e y  
 