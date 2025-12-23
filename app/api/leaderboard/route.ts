import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: [
        { wins: 'desc' },
        { totalBattles: 'asc' }
      ],
      take: 10
    })
    
    return NextResponse.json(users)
  } catch (error) {
    console.error('Leaderboard error:', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}