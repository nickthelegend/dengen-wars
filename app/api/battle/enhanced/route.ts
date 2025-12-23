import { NextResponse } from 'next/server'
import { getAggregatedPrice, simulatePriceMovement } from '../../../../lib/price-feeds'
import { getRandomPowerUp, getRandomModifier } from '../../../../lib/powerups'
import { checkAchievements } from '../../../../lib/achievements'
import { rateLimiter } from '../../../../lib/cache'

export async function POST(request: Request) {
  try {
    const { symbols, battleId, stream = false } = await request.json()

    // Rate limiting for battle API
    if (!rateLimiter.isAllowed(`battle-enhanced-${battleId || 'default'}`, 20, 60000)) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    if (stream) {
      // Real-time streaming response
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        async start(controller) {
          const sendUpdate = async () => {
            try {
              const prices: Record<string, number> = {}

              for (const symbol of symbols) {
                try {
                  const basePrice = await getAggregatedPrice(symbol)
                  prices[symbol] = simulatePriceMovement(basePrice, 0.05)
                } catch (error) {
                  prices[symbol] = simulatePriceMovement(Math.random() * 0.1, 0.05)
                }
              }

              const powerUpChance = Math.random()
              const newPowerUp = powerUpChance < 0.1 ? getRandomPowerUp() : null

              const modifierChance = Math.random()
              const newModifier = modifierChance < 0.05 ? getRandomModifier() : null

              const data = {
                success: true,
                data: {
                  prices,
                  timestamp: Date.now(),
                  powerUp: newPowerUp,
                  modifier: newModifier,
                  battleId
                }
              }

              controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
            } catch (error) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ success: false, error: 'Stream error' })}\n\n`))
            }
          }

          // Send initial update
          await sendUpdate()

          // Send updates every 5 seconds for 2 minutes
          const interval = setInterval(sendUpdate, 5000)
          const timeout = setTimeout(() => {
            clearInterval(interval)
            controller.close()
          }, 120000)

          // Cleanup on abort
          request.signal.addEventListener('abort', () => {
            clearInterval(interval)
            clearTimeout(timeout)
            controller.close()
          })
        }
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    } else {
      // Regular response
      const prices: Record<string, number> = {}

      for (const symbol of symbols) {
        try {
          const basePrice = await getAggregatedPrice(symbol)
          prices[symbol] = simulatePriceMovement(basePrice, 0.05)
        } catch (error) {
          prices[symbol] = simulatePriceMovement(Math.random() * 0.1, 0.05)
        }
      }

      const powerUpChance = Math.random()
      const newPowerUp = powerUpChance < 0.1 ? getRandomPowerUp() : null

      const modifierChance = Math.random()
      const newModifier = modifierChance < 0.05 ? getRandomModifier() : null

      return NextResponse.json({
        success: true,
        data: {
          prices,
          timestamp: Date.now(),
          powerUp: newPowerUp,
          modifier: newModifier,
          battleId
        }
      })
    }

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch enhanced battle data' },
      { status: 500 }
    )
  }
}