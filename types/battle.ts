export interface PowerUp {
  id: string
  name: string
  description: string
  effect: 'multiplier' | 'shield' | 'boost' | 'steal'
  value: number
  duration: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  icon: string
}

export interface BattleModifier {
  id: string
  name: string
  description: string
  effect: 'volatility' | 'bull_market' | 'bear_market' | 'flash_crash'
  multiplier: number
  duration: number
}

export interface BattleState {
  id: string
  players: string[]
  teams: any[][]
  scores: number[]
  powerUps: PowerUp[]
  modifiers: BattleModifier[]
  timeLeft: number
  status: 'waiting' | 'active' | 'finished'
  priceHistory: any[]
}