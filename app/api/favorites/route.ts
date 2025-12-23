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
    
    const favorites = await prisma.favoriteCoin.findMany({
      where: { userId },
      orderBy: { addedAt: 'desc' }
    })
    
    return NextResponse.json({ favorites })
    
  } catch (error) {
    console.error('Favorites GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId, coinId, coinName } = await request.json()
    
    if (!userId || !coinId || !coinName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    const favorite = await prisma.favoriteCoin.create({
      data: {
        userId,
        coinId,
        coinName
      }
    })
    
    return NextResponse.json({ favorite })
    
  } catch (error) {
    console.error('Favorites POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId, coinId } = await request.json()
    
    if (!userId || !coinId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    await prisma.favoriteCoin.deleteMany({
      where: {
        userId,
        coinId
      }
    })
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Favorites DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}