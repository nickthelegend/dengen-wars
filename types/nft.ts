export interface BattleCardNFT {
  id: number
  name: string
  description: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  ability: {
    type: 'score_boost' | 'price_protection' | 'volatility_immunity' | 'double_rewards'
    value: number
    duration?: number
  }
  image: string
  metadata: {
    creator: string
    collection: string
    attributes: NFTAttribute[]
  }
}

export interface NFTAttribute {
  trait_type: string
  value: string | number
}

export interface AchievementBadgeNFT {
  id: number
  achievementId: string
  name: string
  description: string
  image: string
  issuedTo: string
  issuedAt: string
}

export interface NFTMarketplaceListing {
  id: string
  nftId: number
  sellerId: string
  price: number
  currency: 'ALGO' | 'DEGEN'
  status: 'active' | 'sold' | 'cancelled'
  listedAt: string
}