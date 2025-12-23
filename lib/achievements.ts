import type { Achievement } from '../types/achievements'

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_win',
    name: '🏆 First Victory',
    description: 'Win your first battle',
    category: 'battle',
    points: 100,
    rarity: 'bronze',
    icon: '🏆',
    condition: { type: 'total_wins', target: 1 },
    reward: { type: 'tokens', amount: 100 }
  },
  {
    id: 'win_streak_5',
    name: '🔥 Hot Streak',
    description: 'Win 5 battles in a row',
    category: 'battle',
    points: 500,
    rarity: 'silver',
    icon: '🔥',
    condition: { type: 'win_streak', target: 5 },
    reward: { type: 'tokens', amount: 500 }
  },
  {
    id: 'perfect_game',
    name: '💎 Flawless Victory',
    description: 'Win with all coins showing positive returns',
    category: 'battle',
    points: 1000,
    rarity: 'gold',
    icon: '💎',
    condition: { type: 'perfect_game', target: 1 },
    reward: { type: 'nft', amount: 1 }
  },
  {
    id: 'coin_collector',
    name: '🪙 Coin Collector',
    description: 'Battle with 50 different meme coins',
    category: 'collection',
    points: 750,
    rarity: 'silver',
    icon: '🪙',
    condition: { type: 'coin_collection', target: 50 }
  },
  {
    id: 'battle_master',
    name: '⚔️ Battle Master',
    description: 'Win 100 battles',
    category: 'battle',
    points: 2500,
    rarity: 'platinum',
    icon: '⚔️',
    condition: { type: 'total_wins', target: 100 },
    reward: { type: 'tokens', amount: 2500 }
  }
]

export function checkAchievements(userStats: any, battleResult?: any): Achievement[] {
  const unlockedAchievements: Achievement[] = []
  
  for (const achievement of ACHIEVEMENTS) {
    if (isAchievementUnlocked(achievement, userStats, battleResult)) {
      unlockedAchievements.push(achievement)
    }
  }
  
  return unlockedAchievements
}

function isAchievementUnlocked(achievement: Achievement, userStats: any, battleResult?: any): boolean {
  const { condition } = achievement
  
  switch (condition.type) {
    case 'total_wins':
      return userStats.wins >= condition.target
    case 'win_streak':
      return userStats.winStreak >= condition.target
    case 'perfect_game':
      return battleResult?.isPerfectGame || false
    case 'coin_collection':
      return userStats.uniqueCoinsUsed >= condition.target
    default:
      return false
  }
}