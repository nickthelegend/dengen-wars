import { NextResponse } from 'next/server'

async function fetchWithRetry(url: string, options: RequestInit, maxRetries: number = 3): Promise<Response> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options)
      if (response.ok) {
        return response
      }
      if (attempt === maxRetries) {
        throw new Error(`API request failed after ${maxRetries} attempts: ${response.status}`)
      }
    } catch (error) {
      if (attempt === maxRetries) {
        throw error
      }
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
    }
  }
  throw new Error('Unexpected error in fetchWithRetry')
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''

  try {
    const response = await fetchWithRetry(
      "https://api.vestigelabs.org/assets/list?network_id=0&exclude_labels=8,7&denominating_asset_id=31566704&limit=50&offset=0&order_by=rank&order_dir=asc",
      {
        headers: {
          "accept": "application/json, text/plain, */*",
          "accept-language": "en-US,en;q=0.5",
          "cache-control": "no-cache",
          "pragma": "no-cache",
          "priority": "u=1, i",
          "sec-ch-ua": '"Not;A=Brand";v="99", "Brave";v="139", "Chromium";v="139"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "cross-site",
          "sec-gpc": "1",
          "Referer": "https://vestige.fi/"
        },
        method: "GET"
      },
      3
    )

    const data = await response.json()

    if (!data.results || !Array.isArray(data.results)) {
      throw new Error('Invalid API response structure')
    }

    // Skip first item and filter by search if provided
    let filteredResults = data.results.slice(1)

    if (search) {
      filteredResults = filteredResults.filter((coin: any) =>
        coin.name?.toLowerCase().includes(search.toLowerCase()) ||
        coin.ticker?.toLowerCase().includes(search.toLowerCase())
      )
    }

    const coins = filteredResults.map((coin: any) => ({
      id: coin.id,
      name: coin.name || 'Unknown',
      ticker: coin.ticker || 'UNK',
      price: coin.price || 0,
      market_cap: coin.market_cap || 0,
      rank: coin.rank || 0,
      percent_change_1h: coin.price1h ? ((coin.price - coin.price1h) / coin.price1h * 100) : 0,
      percent_change_24h: coin.price1d ? ((coin.price - coin.price1d) / coin.price1d * 100) : 0,
      image: coin.image || '',
      last_updated: new Date().toISOString()
    }))

    return NextResponse.json({
      coins,
      timestamp: new Date().toISOString(),
      source: 'vestige-api'
    })

  } catch (error) {
    console.error('Vestige API Error:', error)

    // Enhanced fallback with more coins and better data
    let mockCoins = [
      { id: 31566704, name: 'USDC', ticker: 'USDC', price: 1.0001, market_cap: 1000000000, rank: 2, percent_change_1h: 0.01, percent_change_24h: 0.02, image: 'https://asa-list.tinyman.org/assets/31566704/icon.png' },
      { id: 386192725, name: 'goBTC', ticker: 'goBTC', price: 95000, market_cap: 500000000, rank: 3, percent_change_1h: 0.5, percent_change_24h: -2.1, image: 'https://asa-list.tinyman.org/assets/386192725/icon.png' },
      { id: 386195940, name: 'goETH', ticker: 'goETH', price: 3500, market_cap: 300000000, rank: 4, percent_change_1h: -1.2, percent_change_24h: -4.5, image: 'https://asa-list.tinyman.org/assets/386195940/icon.png' },
      { id: 27165954, name: 'PLANET', ticker: 'PLANETS', price: 0.000025, market_cap: 180000000, rank: 5, percent_change_1h: 0.8, percent_change_24h: -1.9, image: 'https://asa-list.tinyman.org/assets/27165954/icon.png' },
      { id: 163650, name: 'Asia Reserve Currency Coin', ticker: 'ARCC', price: 0.45, market_cap: 150000000, rank: 6, percent_change_1h: 0.3, percent_change_24h: 1.2, image: 'https://asa-list.tinyman.org/assets/163650/icon.png' },
      { id: 226701642, name: 'Dogecoin', ticker: 'DOGE', price: 0.2113, market_cap: 32000000000, rank: 7, percent_change_1h: 0.2, percent_change_24h: -1.5, image: 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png' },
      { id: 287867876, name: 'Shiba Inu', ticker: 'SHIB', price: 0.00001219, market_cap: 7200000000, rank: 8, percent_change_1h: -0.5, percent_change_24h: 2.1, image: 'https://assets.coingecko.com/coins/images/11939/small/shiba.png' },
      { id: 244475981, name: 'Pepe', ticker: 'PEPE', price: 0.00000994, market_cap: 4200000000, rank: 9, percent_change_1h: 1.2, percent_change_24h: -0.8, image: 'https://assets.coingecko.com/coins/images/29850/small/pepe-token.jpeg' }
    ]

    if (search) {
      mockCoins = mockCoins.filter(coin =>
        coin.name.toLowerCase().includes(search.toLowerCase()) ||
        coin.ticker.toLowerCase().includes(search.toLowerCase())
      )
    }

    return NextResponse.json({
      coins: mockCoins,
      timestamp: new Date().toISOString(),
      source: 'fallback',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
}