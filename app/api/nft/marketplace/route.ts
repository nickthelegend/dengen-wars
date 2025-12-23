import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const rarity = searchParams.get('rarity')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    
    // Mock NFT listings for now
    const listings = [
      {
        id: '1',
        nftId: 1,
        name: 'Diamond Hands',
        rarity: 'legendary',
        price: 1000,
        currency: 'DEGEN',
        image: 'https://dengenleague.com/cards/diamond-hands.png',
        seller: 'Player123',
        listedAt: new Date().toISOString()
      },
      {
        id: '2',
        nftId: 2,
        name: 'Rocket Fuel',
        rarity: 'epic',
        price: 500,
        currency: 'DEGEN',
        image: 'https://dengenleague.com/cards/rocket-fuel.png',
        seller: 'Player456',
        listedAt: new Date().toISOString()
      }
    ]
    
    let filteredListings = listings
    
    if (rarity) {
      filteredListings = filteredListings.filter(l => l.rarity === rarity)
    }
    
    if (minPrice) {
      filteredListings = filteredListings.filter(l => l.price >= parseInt(minPrice))
    }
    
    if (maxPrice) {
      filteredListings = filteredListings.filter(l => l.price <= parseInt(maxPrice))
    }
    
    return NextResponse.json({
      success: true,
      data: {
        listings: filteredListings,
        total: filteredListings.length
      }
    })
    
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch marketplace listings' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { nftId, price, currency, sellerAddress } = await request.json()
    
    if (!nftId || !price || !currency || !sellerAddress) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Create marketplace listing
    const listing = {
      id: `listing_${Date.now()}`,
      nftId,
      price,
      currency,
      sellerAddress,
      status: 'active',
      listedAt: new Date().toISOString()
    }
    
    return NextResponse.json({
      success: true,
      data: { listing }
    })
    
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create listing' },
      { status: 500 }
    )
  }
}