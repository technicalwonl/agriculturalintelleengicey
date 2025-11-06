import { getAIFarmingAdvice } from "@/lib/ai-service"

export async function POST(request: Request) {
  try {
    const { message, language } = await request.json()

    const reply = await getAIFarmingAdvice(message, language)

    return Response.json({ reply })
  } catch (error) {
    console.error("[v0] API error:", error)
    return Response.json({ error: "Failed to generate response" }, { status: 500 })
  }
}
