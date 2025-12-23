import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { userId, teamData, opponentStrategy, playerScore, opponentScore, result } = await request.json()

    if (!userId || !teamData || !teamData.playerTeam || !teamData.opponentTeam) {
      return NextResponse.json(
        { success: false, error: 'Missing required battle data' },
        { status: 400 }
      )
    }

    // Use transaction to ensure data consistency
    const battle = await prisma.$transaction(async (tx) => {
      // Find or create player 1 (user)
      let player1 = await tx.user.findUnique({
        where: { id: userId }
      })

      if (!player1) {
        // Try to find by wallet address if userId is actually a wallet address
        player1 = await tx.user.findUnique({
          where: { walletAddress: userId }
        })

        if (!player1) {
          player1 = await tx.user.create({
            data: {
              username: `Player_${userId.slice(-6)}`,
              walletAddress: userId
            }
          })
        }
      }

      // Create or find player 1's team
      const player1Team = await tx.memeTeam.create({
        data: {
          userId: player1.id,
          coin1Id: teamData.playerTeam[0]?.id || 1,
          coin2Id: teamData.playerTeam[1]?.id || 2,
          coin3Id: teamData.playerTeam[2]?.id || 3,
          coin1Name: teamData.playerTeam[0]?.ticker || teamData.playerTeam[0]?.name || 'Unknown',
          coin2Name: teamData.playerTeam[1]?.ticker || teamData.playerTeam[1]?.name || 'Unknown',
          coin3Name: teamData.playerTeam[2]?.ticker || teamData.playerTeam[2]?.name || 'Unknown'
        }
      })

      // Create AI opponent user (if not exists)
      let player2 = await tx.user.findUnique({
        where: { username: 'AI_Opponent' }
      })

      if (!player2) {
        player2 = await tx.user.create({
          data: {
            username: 'AI_Opponent',
            walletAddress: null
          }
        })
      }

      // Create opponent team
      const player2Team = await tx.memeTeam.create({
        data: {
          userId: player2.id,
          coin1Id: teamData.opponentTeam[0]?.id || 1,
          coin2Id: teamData.opponentTeam[1]?.id || 2,
          coin3Id: teamData.opponentTeam[2]?.id || 3,
          coin1Name: teamData.opponentTeam[0]?.ticker || teamData.opponentTeam[0]?.name || 'Unknown',
          coin2Name: teamData.opponentTeam[1]?.ticker || teamData.opponentTeam[1]?.name || 'Unknown',
          coin3Name: teamData.opponentTeam[2]?.ticker || teamData.opponentTeam[2]?.name || 'Unknown'
        }
      })

      // Determine winner
      let winnerId = null
      if (result === 'win') {
        winnerId = player1.id
      } else if (result === 'loss') {
        winnerId = player2.id
      } // tie = null

      // Create battle record
      const battleRecord = await tx.memeBattle.create({
        data: {
          player1Id: player1.id,
          player2Id: player2.id,
          player1TeamId: player1Team.id,
          player2TeamId: player2Team.id,
          player1Score: playerScore || 0,
          player2Score: opponentScore || 0,
          winnerId,
          battleData: JSON.stringify({
            teamData,
            opponentStrategy,
            priceHistory: teamData.priceHistory || []
          }),
          strategy: opponentStrategy || 'balanced',
          stakeAmount: 0, // No staking implemented yet
          endedAt: new Date()
        },
        include: {
          player1: true,
          player2: true,
          winner: true,
          player1Team: true,
          player2Team: true
        }
      })

      // Update user statistics
      if (result === 'win') {
        await tx.user.update({
          where: { id: player1.id },
          data: {
            wins: { increment: 1 },
            totalBattles: { increment: 1 },
            winStreak: { increment: 1 }
          }
        })
        await tx.user.update({
          where: { id: player2.id },
          data: {
            losses: { increment: 1 },
            totalBattles: { increment: 1 },
            winStreak: 0
          }
        })
      } else if (result === 'loss') {
        await tx.user.update({
          where: { id: player1.id },
          data: {
            losses: { increment: 1 },
            totalBattles: { increment: 1 },
            winStreak: 0
          }
        })
        await tx.user.update({
          where: { id: player2.id },
          data: {
            wins: { increment: 1 },
            totalBattles: { increment: 1 },
            winStreak: { increment: 1 }
          }
        })
      } else {
        // Tie - both get totalBattles incremented but no win/loss
        await tx.user.update({
          where: { id: player1.id },
          data: {
            totalBattles: { increment: 1 },
            winStreak: 0
          }
        })
        await tx.user.update({
          where: { id: player2.id },
          data: {
            totalBattles: { increment: 1 },
            winStreak: 0
          }
        })
      }

      return battleRecord
    })

    return NextResponse.json({
      success: true,
      data: { battle }
    })

  } catch (error) {
    console.error('Battle creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create battle' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      )
    }

    // Find user
    let user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      user = await prisma.user.findUnique({
        where: { walletAddress: userId }
      })
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Get battle history
    const battles = await prisma.memeBattle.findMany({
      where: {
        OR: [
          { player1Id: user.id },
          { player2Id: user.id }
        ]
      },
      include: {
        player1: {
          select: { id: true, username: true, walletAddress: true }
        },
        player2: {
          select: { id: true, username: true, walletAddress: true }
        },
        winner: {
          select: { id: true, username: true, walletAddress: true }
        },
        player1Team: true,
        player2Team: true
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })

    // Get total count for pagination
    const totalCount = await prisma.memeBattle.count({
      where: {
        OR: [
          { player1Id: user.id },
          { player2Id: user.id }
        ]
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        battles,
        totalCount,
        hasMore: offset + limit < totalCount
      }
    })

  } catch (error) {
    console.error('Battle history fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch battle history' },
      { status: 500 }
    )
  }
}