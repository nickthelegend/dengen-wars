import { NextResponse } from 'next/server'
import algosdk from 'algosdk'

const algodClient = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', '')

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')
    
    if (!address) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 })
    }
    
    const accountInfo = await algodClient.accountInformation(address).do()
    
    const balances: Record<string, string> = {
      ALGO: (Number(accountInfo.amount) / 1000000).toFixed(6)
    }
    
    // Get all ASA balances and show top ones
    if (accountInfo.assets && accountInfo.assets.length > 0) {
      const sortedAssets = accountInfo.assets
        .filter((asset: any) => asset.amount > 0)
        .sort((a: any, b: any) => Number(b.amount) - Number(a.amount))
        .slice(0, 5) // Show top 5 assets
      
      for (const asset of sortedAssets) {
        try {
          const assetInfo = await algodClient.getAssetByID(asset.assetId).do()
          const decimals = assetInfo.params.decimals || 0
          const unitName = assetInfo.params.unitName || `ASA-${asset.assetId}`
          const balance = (Number(asset.amount) / Math.pow(10, decimals)).toFixed(decimals)
          balances[unitName] = balance
        } catch (e) {
          // Skip if can't get asset info
        }
      }
    }
    
    return NextResponse.json({ balances })
    
  } catch (error) {
    console.error('Token balance error:', error)
    return NextResponse.json({ 
      balances: {
        ALGO: '0.000000'
      }
    })
  }
}