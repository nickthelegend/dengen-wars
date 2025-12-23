export interface Achievement {
  id: string
  name: string
  description: string
  category: 'battle' | 'collection' | 'social' | 'special'
  points: number
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum'
  icon: string
  condition: {
    type: 'win_streak' | 'total_wins' | 'perfect_game' | 'coin_collection' | 'referrals'
    target: number
  }
  reward?: {
    type: 'tokens' | 'nft' | 'powerup'
    amount: number
  }
}

export interface UserAchievement {
  id: string
  userId: string
  achievementId: string
  unlockedAt: string
  progress: number
}