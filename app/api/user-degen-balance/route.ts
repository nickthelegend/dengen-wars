import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('walletAddress')

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 })
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { walletAddress }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          username: `Player_${walletAddress.slice(-6)}`,
          walletAddress,
          degenBalance: 0
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        walletAddress: user.walletAddress,
        degenBalance: user.degenBalance || 0,
        username: user.username
      }
    })

  } catch (error) {
    console.error('User DEGEN balance error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch DEGEN balance'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { walletAddress, amount, action } = await request.json()

    if (!walletAddress || !amount || !action) {
      return NextResponse.json({ error: 'walletAddress, amount, and action required' }, { status: 400 })
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { walletAddress }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          username: `Player_${walletAddress.slice(-6)}`,
          walletAddress,
          degenBalance: 0
        }
      })
    }

    let currentBalance = Number(user.degenBalance || 0)
    let newBalance = currentBalance

    if (action === 'add') {
      newBalance = currentBalance + amount
    } else if (action === 'subtract') {
      if (currentBalance < amount) {
        return NextResponse.json({
          success: false,
          error: 'Insufficient DEGEN balance'
        }, { status: 400 })
      }
      newBalance = currentBalance - amount
    } else {
      return NextResponse.json({ error: 'Invalid action. Use "add" or "subtract"' }, { status: 400 })
    }

    // Update user balance
    const updatedUser = await prisma.user.update({
      where: { walletAddress },
      data: { degenBalance: newBalance }
    })

    return NextResponse.json({
      success: true,
      data: {
        walletAddress: updatedUser.walletAddress,
        degenBalance: updatedUser.degenBalance,
        change: action === 'add' ? amount : -amount
      }
    })

  } catch (error) {
    console.error('User DEGEN balance update error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update DEGEN balance'
    }, { status: 500 })
  }
}