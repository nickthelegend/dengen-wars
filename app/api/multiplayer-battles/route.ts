import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { roomId, player1Id, player2Id, player1Team, player2Team, player1Score, player2Score, winnerId, battleData } = await request.json()

    // Ensure users exist
    await prisma.user.upsert({
      where: { id: player1Id },
      update: {},
      create: { id: player1Id, username: player1Id }
    })
    
    await prisma.user.upsert({
      where: { id: player2Id },
      update: {},
      create: { id: player2Id, username: player2Id }
    })

    const battle = await prisma.multiplayerBattle.create({
      data: {
        roomId,
        player1Id,
        player2Id,
        player1Team: JSON.stringify(player1Team),
        player2Team: JSON.stringify(player2Team),
        player1Score,
        player2Score,
        winnerId,
        battleData: JSON.stringify(battleData),
        status: 'finished',
        endedAt: new Date()
      }
    })

    // Update user stats
    if (winnerId) {
      await prisma.user.update({
        where: { id: winnerId },
        data: {
          wins: { increment: 1 },
          totalBattles: { increment: 1 },
          winStreak: { increment: 1 }
        }
      })

      const loserId = winnerId === player1Id ? player2Id : player1Id
      await prisma.user.update({
        where: { id: loserId },
        data: {
          losses: { increment: 1 },
          totalBattles: { increment: 1 },
          winStreak: 0
        }
      })
    } else {
      // Tie - both players get battle count increment
      await prisma.user.updateMany({
        where: { id: { in: [player1Id, player2Id] } },
        data: {
          totalBattles: { increment: 1 }
        }
      })
    }

    return NextResponse.json({ success: true, battle })
  } catch (error) {
    console.error('Error saving multiplayer battle:', error)
    return NextResponse.json({ error: 'Failed to save battle' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const battles = await prisma.multiplayerBattle.findMany({
      where: {
        OR: [
          { player1Id: userId },
          { player2Id: userId }
        ]
      },
      include: {
        player1: true,
        player2: true,
        winner: true
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    return NextResponse.json({ battles })
  } catch (error) {
    console.error('Error fetching multiplayer battles:', error)
    return NextResponse.json({ error: 'Failed to fetch battles' }, { status: 500 })
  }
}