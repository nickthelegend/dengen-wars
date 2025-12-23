// User Types
export interface User {
  id: string
  username: string
  walletAddress?: string
  wins: number
  losses: number
  totalBattles: number
  winStreak: number
  createdAt: string
  favorites?: FavoriteCoin[]
  presets?: TeamPreset[]
  battleHistory?: Battle[]
}

// Coin Types
export interface MemeCoin {
  id: number
  name: string
  ticker: string
  price: number
  rank: number
  image?: string
  marketCap?: number
  volume24h?: number
  priceChange24h?: number
}

export interface FavoriteCoin {
  id: string
  userId: string
  coinId: number
  coinName: string
  addedAt: string
}

export interface TeamPreset {
  id: string
  userId: string
  name: string
  coin1Id: number
  coin2Id: number
  coin3Id: number
  coin1Name: string
  coin2Name: string
  coin3Name: string
  createdAt: string
}

// Battle Types
export interface Battle {
  id: string
  player1Id: string
  player2Id: string
  player1Score: number
  player2Score: number
  winnerId?: string
  status: 'waiting' | 'active' | 'finished'
  createdAt: string
  endedAt?: string
  player1?: User
  player2?: User
  winner?: User
}

export interface BattleRoom {
  id: string
  player1Id: string
  player2Id?: string
  player1Team: string
  player2Team?: string
  battleType: 'pvp' | 'pve'
  status: 'waiting' | 'active' | 'finished'
  results?: string
  startedAt?: string
  endedAt?: string
  createdAt: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Token Balance Types
export interface TokenBalance {
  [symbol: string]: string
}

export interface TokenBalanceResponse {
  balances: TokenBalance
}

// Battle Price Types
export interface BattlePrice {
  symbol: string
  price: number
  change24h?: number
  timestamp: number
}

export interface BattlePriceResponse {
  prices: Record<string, number>
  timestamp: number
}