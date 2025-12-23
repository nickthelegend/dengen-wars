import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { walletAddress, stakeAmount, battleType = 'ai' } = await request.json()

    if (!walletAddress || !stakeAmount) {
      return NextResponse.json({
        success: false,
        error: 'Wallet address and stake amount required'
      }, { status: 400 })
    }

    if (stakeAmount < 10) {
      return NextResponse.json({
        success: false,
        error: 'Minimum stake is 10 DEGEN'
      }, { status: 400 })
    }

    // Check user's DEGEN balance
    const balanceResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/user-degen-balance?walletAddress=${walletAddress}`)
    const balanceData = await balanceResponse.json()

    if (!balanceData.success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to check balance'
      }, { status: 500 })
    }

    if (balanceData.data.degenBalance < stakeAmount) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient DEGEN balance'
      }, { status: 400 })
    }

    // Deduct stake from user's balance
    const stakeResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/user-degen-balance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress,
        amount: stakeAmount,
        action: 'subtract'
      })
    })

    const stakeData = await stakeResponse.json()

    if (!stakeData.success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to process stake'
      }, { status: 500 })
    }

    // Create battle stake record
    const battleId = `battle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    return NextResponse.json({
      success: true,
      data: {
        battleId,
        walletAddress,
        stakeAmount,
        battleType,
        stakedAt: new Date().toISOString(),
        status: 'active'
      }
    })

  } catch (error) {
    console.error('Battle stake error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create battle stake'
    }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { battleId, winnerAddress, loserAddress, stakeAmount } = await request.json()

    if (!battleId || !winnerAddress || !stakeAmount) {
      return NextResponse.json({
        success: false,
        error: 'Battle ID, winner address, and stake amount required'
      }, { status: 400 })
    }

    // Award stake to winner
    const rewardResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/user-degen-balance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress: winnerAddress,
        amount: stakeAmount * 2, // Winner gets their stake back plus loser's stake
        action: 'add'
      })
    })

    const rewardData = await rewardResponse.json()

    if (!rewardData.success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to award stake to winner'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        battleId,
        winnerAddress,
        stakeAmount,
        totalReward: stakeAmount * 2,
        completedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Battle stake settlement error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to settle battle stake'
    }, { status: 500 })
  }
}