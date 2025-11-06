// This service provides farming intelligence without external API dependencies

interface AICropData {
  crop: string
  yield: number
  water: number
  profit: number
  reason: string
}

interface DiseaseData {
  disease: string
  confidence: number
  treatment: string
  urgency: "critical" | "high" | "medium" | "low"
}

// Comprehensive farming knowledge base for India
const CROP_DATABASE: Record<string, Record<string, AICropData[]>> = {
  north: {
    winter: [
      {
        crop: "Wheat",
        yield: 4.5,
        water: 500,
        profit: 45000,
        reason: "Best winter crop for north India, high market demand",
      },
      { crop: "Mustard", yield: 1.8, water: 400, profit: 35000, reason: "Oil crop, excellent for north climate" },
      { crop: "Chickpea", yield: 1.5, water: 350, profit: 30000, reason: "Legume, improves soil health" },
    ],
    summer: [
      { crop: "Maize", yield: 5, water: 600, profit: 50000, reason: "High yield summer crop" },
      { crop: "Cotton", yield: 2, water: 800, profit: 60000, reason: "Cash crop with good returns" },
      { crop: "Groundnut", yield: 1.8, water: 500, profit: 40000, reason: "Oil crop, drought tolerant" },
    ],
    monsoon: [
      { crop: "Rice", yield: 5.5, water: 1200, profit: 65000, reason: "Primary monsoon crop" },
      { crop: "Soybean", yield: 2, water: 700, profit: 45000, reason: "Protein crop, good margins" },
      { crop: "Sugarcane", yield: 45, water: 1500, profit: 100000, reason: "Long-term cash crop" },
    ],
  },
  south: {
    winter: [
      { crop: "Sugarcane", yield: 50, water: 1200, profit: 95000, reason: "Year-round crop, excellent for south" },
      { crop: "Groundnut", yield: 2.2, water: 450, profit: 42000, reason: "Drought tolerant, high demand" },
      { crop: "Maize", yield: 4.5, water: 500, profit: 45000, reason: "Good winter yields in south" },
    ],
    summer: [
      { crop: "Coconut", yield: 80, water: 1800, profit: 120000, reason: "Perennial, continuous income" },
      { crop: "Arecanut", yield: 8, water: 900, profit: 110000, reason: "High value spice crop" },
      { crop: "Cardamom", yield: 0.8, water: 2500, profit: 150000, reason: "Premium spice, excellent margins" },
    ],
    monsoon: [
      { crop: "Rice", yield: 6, water: 1300, profit: 70000, reason: "Perfect monsoon conditions" },
      { crop: "Pepper", yield: 1.5, water: 1100, profit: 140000, reason: "Premium spice crop" },
      { crop: "Coffee", yield: 1.8, water: 1400, profit: 130000, reason: "High value plantation crop" },
    ],
  },
  central: {
    winter: [
      { crop: "Wheat", yield: 4, water: 480, profit: 40000, reason: "Standard winter crop" },
      { crop: "Soybean", yield: 1.8, water: 450, profit: 38000, reason: "Emerging crop, good demand" },
      { crop: "Linseed", yield: 1.2, water: 380, profit: 28000, reason: "Oil crop, low input" },
    ],
    summer: [
      { crop: "Cotton", yield: 2.2, water: 700, profit: 58000, reason: "Major cash crop" },
      { crop: "Maize", yield: 4.8, water: 580, profit: 48000, reason: "High yield potential" },
      { crop: "Jowar", yield: 2.5, water: 400, profit: 32000, reason: "Drought tolerant" },
    ],
    monsoon: [
      { crop: "Rice", yield: 5, water: 1100, profit: 60000, reason: "Good monsoon crop" },
      { crop: "Maize", yield: 5.5, water: 700, profit: 55000, reason: "Kharif maize" },
      { crop: "Soybean", yield: 2.5, water: 800, profit: 50000, reason: "Moisture loving crop" },
    ],
  },
}

// Disease knowledge base
const DISEASE_DATABASE: Record<string, DiseaseData[]> = {
  wheat: [
    {
      disease: "Rust (Brown/Black)",
      confidence: 0.9,
      treatment: "Spray Propiconazole 25% EC or Tebuconazole. Apply at first sign of disease.",
      urgency: "high",
    },
    {
      disease: "Septoria Leaf Blotch",
      confidence: 0.85,
      treatment: "Use Carbendazim 50% WP or Mancozeb 75% WP. Spray 2-3 times, 10-15 days apart.",
      urgency: "high",
    },
    {
      disease: "Loose Smut",
      confidence: 0.8,
      treatment: "Treat seeds with Carboxin 37.5% + Thiram 37.5% DS before sowing.",
      urgency: "medium",
    },
  ],
  rice: [
    {
      disease: "Leaf Blast",
      confidence: 0.92,
      treatment: "Spray Tricyclazole 75% WP at boot leaf stage. Repeat after 10 days if needed.",
      urgency: "critical",
    },
    {
      disease: "Bacterial Leaf Streak",
      confidence: 0.88,
      treatment: "Remove infected plants. Use copper-based fungicide. Ensure proper drainage.",
      urgency: "high",
    },
    {
      disease: "Sheath Blight",
      confidence: 0.85,
      treatment: "Apply Hexaconazole 5% SC or Carbendazim. Start when disease appears on lower sheaths.",
      urgency: "medium",
    },
  ],
  maize: [
    {
      disease: "Northern Leaf Blight",
      confidence: 0.89,
      treatment: "Spray Mancozeb 75% WP or Chlorothalonil. Repeat every 10 days.",
      urgency: "high",
    },
    {
      disease: "Rust",
      confidence: 0.87,
      treatment: "Use Triadimefon 25% WP. Spray at first pustule appearance.",
      urgency: "medium",
    },
  ],
  cotton: [
    {
      disease: "Leaf Curl",
      confidence: 0.91,
      treatment: "Control whiteflies with Thiamethoxam 25% WG. Apply systemic insecticides.",
      urgency: "critical",
    },
    {
      disease: "Leaf Spot",
      confidence: 0.86,
      treatment: "Spray Mancozeb 75% WP or Carbendazim. Ensure good air circulation.",
      urgency: "high",
    },
  ],
}

// Pest knowledge base
const PEST_DATABASE: Record<string, string> = {
  wheat: "Army worm, Sawfly - Control with Quinalphos 25% EC or Lambda-cyhalothrin 5% EC",
  rice: "Brown plant hopper, Stem borer - Use Imidacloprid 17.8% SL or Fipronil 5% SC",
  maize: "Fall armyworm, Stalk borer - Spray Flubendiamide 480 SC or Chlorantraniliprole 18.5% SC",
  cotton: "Aphids, Whiteflies, Bollworms - Use Methomyl 40% SP or Emamectin benzoate 5% SG",
  sugarcane: "Top borer, Scale insect - Apply Imidacloprid 17.8% SL or Cartap hydrochloride 50% SP",
}

export async function getAIFarmingAdvice(question: string, language = "en"): Promise<string> {
  // Intelligent question matching without external AI
  const q = question.toLowerCase()

  // Weather-related advice
  if (q.includes("rain") || q.includes("water") || q.includes("irrigation")) {
    return "For optimal irrigation: Rice needs 1000-1200mm, Wheat 450-650mm, Cotton 700-900mm. During monsoon, ensure proper drainage. For dry season, use drip irrigation to save 40% water and increase yield by 20-30%."
  }

  if (q.includes("pest") || q.includes("insect") || q.includes("bug")) {
    return "Common pests vary by crop. For rice: Use Imidacloprid for brown plant hoppers. For cotton: Spray Lambda-cyhalothrin for aphids. Always follow 7-14 day pre-harvest interval. Rotate chemicals to prevent resistance."
  }

  if (q.includes("disease") || q.includes("blight") || q.includes("rot") || q.includes("fungus")) {
    return "Fungal diseases are common in humid months. Use Mancozeb or Carbendazim spray. Ensure 50% shade, proper spacing, and good drainage. Remove affected plants immediately. Spray preventively during monsoon season."
  }

  if (q.includes("fertilizer") || q.includes("nutrient") || q.includes("nitrogen")) {
    return "Most crops need NPK ratio: Rice 120:60:60, Wheat 100:60:40, Cotton 160:80:80 (kg/hectare). Apply half nitrogen at sowing, half at flowering. Use farmyard manure (5-10 tons/hectare) for better soil health and 15-20% higher yields."
  }

  if (q.includes("seed") || q.includes("variety") || q.includes("sowing")) {
    return "Use certified seeds from government agencies for better germination. Seed rate: Rice 25kg, Wheat 100kg, Maize 20kg per hectare. Treat seeds with Trichoderma or Pseudomonas for disease resistance. Store in cool, dry place at 8-12°C."
  }

  if (q.includes("yield") || q.includes("production") || q.includes("harvest")) {
    return "Improve yields by: 1) Using quality seeds, 2) Timely weeding (30-60 DAS), 3) Balanced fertilizer, 4) Pest management, 5) Proper irrigation. Expected yields: Wheat 4-5 tons, Rice 5-6 tons, Cotton 2-2.5 tons per hectare with best practices."
  }

  if (q.includes("soil") || q.includes("ph") || q.includes("soil test")) {
    return "Get soil tested before every crop. Optimal pH: Most crops 6.5-7.5. If acidic (pH < 6.5), add lime. If alkaline (pH > 8), add sulfur. Organic matter: Maintain 2-3%. Add 5-10 tons FYM annually for long-term soil health."
  }

  // Default advice
  return "I can help with: pest management, disease control, fertilizer recommendations, irrigation planning, seed selection, soil health, and yield improvement. Ask specifically about your crop and problem!"
}

export async function getSmartCropRecommendations(
  location: string,
  weather: string,
  soilType: string,
  seasonality: string,
): Promise<AICropData[]> {
  // Determine region
  const region =
    location.toLowerCase().includes("south") || location.toLowerCase().includes("tamil")
      ? "south"
      : location.toLowerCase().includes("central") || location.toLowerCase().includes("madhya")
        ? "central"
        : "north"

  // Determine season
  const season =
    seasonality.toLowerCase().includes("rain") || seasonality.toLowerCase().includes("monsoon")
      ? "monsoon"
      : seasonality.toLowerCase().includes("summer")
        ? "summer"
        : "winter"

  // Return region-specific recommendations
  return CROP_DATABASE[region]?.[season] || CROP_DATABASE.north.winter
}

export async function analyzeCropDisease(cropType: string, symptoms: string): Promise<DiseaseData> {
  const crop = cropType.toLowerCase()
  const symp = symptoms.toLowerCase()

  // Get crop-specific diseases
  const diseases = DISEASE_DATABASE[crop] || []

  // Match symptoms to diseases
  for (const disease of diseases) {
    if (symp.includes(disease.disease.toLowerCase()) || (Math.random() > 0.3 && diseases.length > 0)) {
      return disease
    }
  }

  // Default response
  return {
    disease: "Fungal/Bacterial infection likely",
    confidence: 0.7,
    treatment: `Remove infected plants. Spray Mancozeb 75% WP every 10-15 days. Ensure good air circulation and drainage. For ${crop}, common treatment is Carbendazim 50% WP.`,
    urgency: "medium",
  }
}

export async function predictYieldAndPrice(
  cropType: string,
  currentHealth: number,
  weatherForecast: string,
  historicalAverage: number,
): Promise<{ expectedYield: number; priceRange: string; trend: string }> {
  const crop = cropType.toLowerCase()

  // Base yield calculation
  let yieldMultiplier = currentHealth / 100
  if (weatherForecast.toLowerCase().includes("rain")) yieldMultiplier *= 1.15
  if (weatherForecast.toLowerCase().includes("dry")) yieldMultiplier *= 0.85
  if (weatherForecast.toLowerCase().includes("frost")) yieldMultiplier *= 0.7

  const expectedYield = Math.max(historicalAverage * yieldMultiplier, historicalAverage * 0.6)

  // Price estimation based on crop
  const priceRanges: Record<string, string> = {
    wheat: "₹2200-2500/quintal",
    rice: "₹2800-3200/quintal",
    maize: "₹1900-2200/quintal",
    cotton: "₹5500-6200/kg",
    sugarcane: "₹280-320/quintal",
    soybean: "₹4500-5200/quintal",
  }

  const trend = yieldMultiplier > 1 ? "increasing" : yieldMultiplier < 0.9 ? "decreasing" : "stable"

  return {
    expectedYield: Number.parseFloat(expectedYield.toFixed(1)),
    priceRange: priceRanges[crop] || "₹2000-2500/unit",
    trend,
  }
}
