import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import type { User, ApiResponse } from '../../../types/api'

const prisma = new PrismaClient()

export async function POST(request: Request): Promise<NextResponse<ApiResponse<User>>> {
  try {
    const { username, walletAddress }: { username?: string; walletAddress?: string } = await request.json()
    
    if (!username && !walletAddress) {
      return NextResponse.json({ success: false, error: 'Username or wallet address required' }, { status: 400 })
    }
    
    // Find or create user by wallet address first, then username
    let user = null
    
    if (walletAddress) {
      user = await prisma.user.findUnique({
        where: { walletAddress },
        include: { favorites: true, presets: true }
      })
    }
    
    if (!user && username) {
      user = await prisma.user.findUnique({
        where: { username },
        include: { favorites: true, presets: true }
      })
    }
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          username: username || `Player_${walletAddress?.slice(-6)}`,
          walletAddress
        },
        include: { favorites: true, presets: true }
      })
    }

    // Transform null values to undefined and Date to string to match API types
    const transformedUser = {
      ...user,
      walletAddress: user.walletAddress || undefined,
      createdAt: user.createdAt.toISOString(),
      favorites: user.favorites?.map(fav => ({
        ...fav,
        addedAt: fav.addedAt.toISOString()
      })),
      presets: user.presets?.map(preset => ({
        ...preset,
        createdAt: preset.createdAt.toISOString()
      }))
    }

    return NextResponse.json({ success: true, data: transformedUser })
    
  } catch (error) {
    console.error('User API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')
    
    if (!address) {
      return NextResponse.json({ success: false, error: 'Address required' }, { status: 400 })
    }
    
    let user = await prisma.user.findUnique({
      where: { walletAddress: address },
      include: {
        favorites: true,
        presets: true
      }
    })
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          username: `Player_${address.slice(-6)}`,
          walletAddress: address
        },
        include: { favorites: true, presets: true }
      })
    }

    // Transform null values to undefined and Date to string to match API types
    const transformedUser = {
      ...user,
      walletAddress: user.walletAddress || undefined,
      createdAt: user.createdAt.toISOString(),
      favorites: user.favorites?.map(fav => ({
        ...fav,
        addedAt: fav.addedAt.toISOString()
      })),
      presets: user.presets?.map(preset => ({
        ...preset,
        createdAt: preset.createdAt.toISOString()
      }))
    }

    return NextResponse.json({ success: true, data: transformedUser })
    
  } catch (error) {
    console.error('User GET API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}