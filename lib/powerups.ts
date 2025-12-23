import type { PowerUp, BattleModifier } from '../types/battle'

export const POWER_UPS: PowerUp[] = [
  {
    id: 'score_boost',
    name: '🚀 Score Boost',
    description: 'Double your score for 10 seconds',
    effect: 'multiplier',
    value: 2,
    duration: 10,
    rarity: 'common',
    icon: '🚀'
  },
  {
    id: 'price_shield',
    name: '🛡️ Price Shield',
    description: 'Protect from negative price changes',
    effect: 'shield',
    value: 1,
    duration: 15,
    rarity: 'rare',
    icon: '🛡️'
  },
  {
    id: 'mega_pump',
    name: '💎 Mega Pump',
    description: 'Triple score multiplier for 5 seconds',
    effect: 'multiplier',
    value: 3,
    duration: 5,
    rarity: 'epic',
    icon: '💎'
  },
  {
    id: 'score_steal',
    name: '🔥 Score Steal',
    description: 'Steal 20% of opponent score',
    effect: 'steal',
    value: 0.2,
    duration: 1,
    rarity: 'legendary',
    icon: '🔥'
  }
]

export const BATTLE_MODIFIERS: BattleModifier[] = [
  {
    id: 'high_volatility',
    name: '⚡ High Volatility',
    description: 'Price changes are amplified by 150%',
    effect: 'volatility',
    multiplier: 1.5,
    duration: 20
  },
  {
    id: 'bull_market',
    name: '📈 Bull Market',
    description: 'All positive changes get +50% bonus',
    effect: 'bull_market',
    multiplier: 1.5,
    duration: 15
  },
  {
    id: 'bear_market',
    name: '📉 Bear Market',
    description: 'All negative changes are amplified',
    effect: 'bear_market',
    multiplier: 1.3,
    duration: 15
  }
]

export function getRandomPowerUp(): PowerUp {
  const rarityWeights = { common: 50, rare: 30, epic: 15, legendary: 5 }
  const random = Math.random() * 100
  
  let rarity: PowerUp['rarity'] = 'common'
  if (random < 5) rarity = 'legendary'
  else if (random < 20) rarity = 'epic'
  else if (random < 50) rarity = 'rare'
  
  const availablePowerUps = POWER_UPS.filter(p => p.rarity === rarity)
  return availablePowerUps[Math.floor(Math.random() * availablePowerUps.length)]
}

export function getRandomModifier(): BattleModifier {
  return BATTLE_MODIFIERS[Math.floor(Math.random() * BATTLE_MODIFIERS.length)]
}