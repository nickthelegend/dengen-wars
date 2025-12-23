import { NextResponse } from 'next/server'
const algosdk = require('algosdk')
import { prisma } from '@/lib/prisma'

const algodClient = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', '');

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')

    if (!address) {
      return NextResponse.json({ 
        success: false, 
        error: 'Address parameter required' 
      }, { status: 400 })
    }

    // Get account info from Algorand
    const accountInfo = await algodClient.accountInformation(address).do()
    const algoBalance = Number(accountInfo.amount) / 1e6

    // Find DEGEN asset
    const degenAssetId = parseInt(process.env.DEGEN_ASSET_ID!)
    const degenAsset = accountInfo.assets?.find((asset: any) => asset['asset-id'] === degenAssetId)
    const degenBalance = degenAsset ? Number(degenAsset.amount) / 1e6 : 0

    // Update user balance in database
    const user = await prisma.user.upsert({
      where: { walletAddress: address },
      update: {
        algoBalance: algoBalance,
        degenBalance: degenBalance
      },
      create: {
        username: `user_${address.slice(-8)}`,
        walletAddress: address,
        algoBalance: algoBalance,
        degenBalance: degenBalance
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        address,
        algoBalance,
        degenBalance,
        userId: user.id
      }
    })

  } catch (error: any) {
    console.error('Balance fetch error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}