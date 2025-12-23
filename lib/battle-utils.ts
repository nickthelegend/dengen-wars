import type { MemeCoin } from '../types/api'

export function calculateTeamScore(team: MemeCoin[]): number {
  if (!team || team.length === 0) return 0
  
  return team.reduce((total, coin) => {
    const initialPrice = (coin as any).initialPrice
    const currentPrice = (coin as any).currentPrice
    
    if (!initialPrice || !currentPrice) return total
    const change = ((currentPrice - initialPrice) / initialPrice) * 100
    return total + change
  }, 0) / team.length
}

export function formatWalletAddress(address: string): string {
  if (!address) return 'No Address'
  return `${address.slice(0, 8)}...${address.slice(-8)}`
}

export function validateTeam(team: any[]): boolean {
  return team.length === 3 && team.every(coin => coin && coin.id && coin.ticker)
}

export function formatPrice(price: number): string {
  if (price < 0.000001) return price.toExponential(2)
  if (price < 0.01) return price.toFixed(6)
  if (price < 1) return price.toFixed(4)
  return price.toFixed(2)
}

export function formatPercentage(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

export function generateBattleId(): string {
  return `battle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function calculateWinRate(wins: number, totalBattles: number): number {
  if (totalBattles === 0) return 0
  return (wins / totalBattles) * 100
}