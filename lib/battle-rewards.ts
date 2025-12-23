export interface BattleReward {
  baseReward: number
  multiplier: number
  bonusReward: number
  totalReward: number
}

export function calculateBattleRewards(
  battleResult: {
    won: boolean
    score: number
    opponentScore: number
    battleDuration: number
    perfectGame: boolean
    winStreak: number
  },
  userStaking: {
    stakedAmount: number
    farmMultiplier: number
  }
): BattleReward {
  let baseReward = 0
  let multiplier = 1
  let bonusReward = 0
  
  // Base rewards
  if (battleResult.won) {
    baseReward = 50 + Math.floor(battleResult.score * 10)
  } else {
    baseReward = 10 + Math.floor(battleResult.score * 2)
  }
  
  // Staking multiplier
  if (userStaking.stakedAmount > 0) {
    multiplier += userStaking.farmMultiplier
  }
  
  // Win streak bonus
  if (battleResult.winStreak >= 3) {
    bonusReward += battleResult.winStreak * 25
  }
  
  // Perfect game bonus
  if (battleResult.perfectGame) {
    bonusReward += 200
  }
  
  // Score difference bonus
  const scoreDiff = Math.abs(battleResult.score - battleResult.opponentScore)
  if (scoreDiff > 5) {
    bonusReward += Math.floor(scoreDiff * 5)
  }
  
  const totalReward = Math.floor((baseReward + bonusReward) * multiplier)
  
  return {
    baseReward,
    multiplier,
    bonusReward,
    totalReward
  }
}

export function getFarmMultiplier(stakedAmount: number): number {
  if (stakedAmount >= 10000) return 0.5 // 50% bonus
  if (stakedAmount >= 5000) return 0.3  // 30% bonus
  if (stakedAmount >= 1000) return 0.2  // 20% bonus
  if (stakedAmount >= 100) return 0.1   // 10% bonus
  return 0
}

export function calculateSeasonalBonus(
  currentSeason: string,
  userLevel: number,
  totalBattles: number
): number {
  let bonus = 0
  
  // Level bonus
  bonus += userLevel * 5
  
  // Activity bonus
  if (totalBattles >= 100) bonus += 100
  else if (totalBattles >= 50) bonus += 50
  else if (totalBattles >= 10) bonus += 20
  
  // Seasonal multiplier
  const seasonMultipliers: Record<string, number> = {
    'spring': 1.2,
    'summer': 1.0,
    'autumn': 1.1,
    'winter': 1.3
  }
  
  return Math.floor(bonus * (seasonMultipliers[currentSeason] || 1.0))
}