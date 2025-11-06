import { getSmartCropRecommendations } from "@/lib/ai-service"

export async function POST(request: Request) {
  try {
    const { location, weather, soilType, seasonality } = await request.json()

    const recommendations = await getSmartCropRecommendations(location, weather, soilType, seasonality)

    return Response.json({ recommendations })
  } catch (error) {
    console.error("[v0] API error:", error)
    return Response.json({ error: "Failed to generate recommendations" }, { status: 500 })
  }
}
