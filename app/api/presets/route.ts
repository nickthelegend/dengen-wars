import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }
    
    const presets = await prisma.teamPreset.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json({ presets })
    
  } catch (error) {
    console.error('Presets GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId, name, coins } = await request.json()
    
    if (!userId || !name || !coins || coins.length !== 3) {
      return NextResponse.json({ error: 'Invalid preset data' }, { status: 400 })
    }
    
    const preset = await prisma.teamPreset.create({
      data: {
        userId,
        name,
        coin1Id: coins[0].id,
        coin2Id: coins[1].id,
        coin3Id: coins[2].id,
        coin1Name: coins[0].ticker,
        coin2Name: coins[1].ticker,
        coin3Name: coins[2].ticker
      }
    })
    
    return NextResponse.json({ preset })
    
  } catch (error) {
    console.error('Presets POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}