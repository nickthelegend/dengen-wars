import { NextResponse } from 'next/server'

// Mock functions for staking calculations
const calculateStakeRewards = (amount: number, durationSeconds: number, rewardRate: number) => {
  return (amount * rewardRate * durationSeconds) / (24 * 60 * 60)
}

// Mock stake pools data
const STAKE_POOLS = [
  {
    id: 'degen_30d',
    name: 'DEGEN 30-Day Stake',
    rewardToken: 'DEGEN',
    minStake: 100,
    totalStaked: 100000,
    rewardRate: 12, // 12% APY
    lockPeriod: 30 * 24 * 60 * 60, // 30 days
    apr: 12
  }
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userAddress = searchParams.get('address')
    
    // Return available staking pools
    const pools = STAKE_POOLS.map(pool => ({
      ...pool,
      estimatedRewards: {
        daily: calculateStakeRewards(pool.minStake, 24 * 60 * 60, pool.rewardRate),
        monthly: calculateStakeRewards(pool.minStake, 30 * 24 * 60 * 60, pool.rewardRate),
        total: calculateStakeRewards(pool.minStake, pool.lockPeriod, pool.rewardRate)
      }
    }))
    
    // Mock user stakes if address provided
    let userStakes: Array<{
      id: string;
      poolId: string;
      amount: number;
      stakedAt: string;
      unlockAt: string;
      currentRewards: number;
    }> = []
    if (userAddress) {
      userStakes = [
        {
          id: 'stake_1',
          poolId: 'degen_30d',
          amount: 5000,
          stakedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          unlockAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
          currentRewards: calculateStakeRewards(5000, 10 * 24 * 60 * 60, 12)
        }
      ]
    }
    
    return NextResponse.json({
      success: true,
      data: {
        pools,
        userStakes,
        totalValueLocked: pools.reduce((sum, pool) => sum + pool.totalStaked, 0)
      }
    })
    
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch staking data' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { poolId, amount, userAddress } = await request.json()
    
    const pool = STAKE_POOLS.find(p => p.id === poolId)
    if (!pool) {
      return NextResponse.json(
        { success: false, error: 'Invalid pool ID' },
        { status: 400 }
      )
    }
    
    if (amount < pool.minStake) {
      return NextResponse.json(
        { success: false, error: `Minimum stake is ${pool.minStake} DEGEN` },
        { status: 400 }
      )
    }
    
    // Create stake record
    const stake = {
      id: `stake_${Date.now()}`,
      poolId,
      amount,
      userAddress,
      stakedAt: new Date().toISOString(),
      unlockAt: new Date(Date.now() + pool.lockPeriod * 1000).toISOString(),
      status: 'active'
    }
    
    return NextResponse.json({
      success: true,
      data: { stake }
    })
    
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create stake' },
      { status: 500 }
    )
  }
}