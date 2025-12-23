import { apiCache, rateLimiter } from './cache'

interface PriceFeed {
  name: string
  fetchPrice: (symbol: string) => Promise<number>
  weight: number
}

const priceFeeds: PriceFeed[] = [
  {
    name: 'coingecko',
    fetchPrice: async (symbol: string) => {
      const cacheKey = `coingecko-${symbol}`
      const cached = apiCache.get<number>(cacheKey)
      if (cached !== null) {
        return cached
      }

      if (!rateLimiter.isAllowed(`coingecko-${symbol}`, 30, 60000)) {
        throw new Error('Rate limit exceeded for CoinGecko API')
      }

      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd`)
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`)
      }
      const data = await response.json()
      const price = data[symbol]?.usd || 0
      apiCache.set(cacheKey, price, 30000) // Cache for 30 seconds
      return price
    },
    weight: 0.4
  },
  {
    name: 'coinmarketcap',
    fetchPrice: async (symbol: string) => {
      const cacheKey = `cmc-${symbol}`
      const cached = apiCache.get<number>(cacheKey)
      if (cached !== null) {
        return cached
      }

      if (!rateLimiter.isAllowed(`cmc-${symbol}`, 10, 60000)) {
        throw new Error('Rate limit exceeded for CMC API')
      }

      const apiKey = process.env.COINMARKETCAP_API_KEY
      if (!apiKey) {
        throw new Error('COINMARKETCAP_API_KEY not configured')
      }
      const response = await fetch(`https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?symbol=${symbol}&convert=USD`, {
        headers: {
          'X-CMC_PRO_API_KEY': apiKey,
          'Accept': 'application/json'
        }
      })
      if (!response.ok) {
        throw new Error(`CMC API error: ${response.status}`)
      }
      const data = await response.json()
      const price = data.data[symbol][0]?.quote?.USD?.price || 0
      apiCache.set(cacheKey, price, 30000)
      return price
    },
    weight: 0.3
  },
  {
    name: 'dexscreener',
    fetchPrice: async (symbol: string) => {
      const cacheKey = `dexscreener-${symbol}`
      const cached = apiCache.get<number>(cacheKey)
      if (cached !== null) {
        return cached
      }

      if (!rateLimiter.isAllowed(`dexscreener-${symbol}`, 30, 60000)) {
        throw new Error('Rate limit exceeded for DexScreener API')
      }

      const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${symbol}`)
      if (!response.ok) {
        throw new Error(`DexScreener API error: ${response.status}`)
      }
      const data = await response.json()
      const pair = data.pairs?.[0]
      const price = pair?.priceUsd ? parseFloat(pair.priceUsd) : 0
      apiCache.set(cacheKey, price, 30000)
      return price
    },
    weight: 0.3
  }
]

export async function getAggregatedPrice(symbol: string): Promise<number> {
  const prices = await Promise.allSettled(
    priceFeeds.map(feed => feed.fetchPrice(symbol))
  )
  
  let totalWeight = 0
  let weightedSum = 0
  
  prices.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value > 0) {
      const feed = priceFeeds[index]
      weightedSum += result.value * feed.weight
      totalWeight += feed.weight
    }
  })
  
  return totalWeight > 0 ? weightedSum / totalWeight : 0
}

export function simulatePriceMovement(basePrice: number, volatility: number = 0.05): number {
  const change = (Math.random() - 0.5) * 2 * volatility
  return basePrice * (1 + change)
}

export function calculateMarketSentiment(priceHistory: number[]): 'bullish' | 'bearish' | 'neutral' {
  if (priceHistory.length < 3) return 'neutral'
  
  const recent = priceHistory.slice(-3)
  const trend = recent[2] - recent[0]
  
  if (trend > 0.02) return 'bullish'
  if (trend < -0.02) return 'bearish'
  return 'neutral'
}