import { predictYieldAndPrice } from "@/lib/ai-service"

export async function POST(request: Request) {
  try {
    const { cropType, currentHealth, weatherForecast, historicalAverage } = await request.json()

    const prediction = await predictYieldAndPrice(cropType, currentHealth, weatherForecast, historicalAverage)

    return Response.json({ prediction })
  } catch (error) {
    console.error("[v0] API error:", error)
    return Response.json({ error: "Failed to generate prediction" }, { status: 500 })
  }
}
