import { NextResponse } from 'next/server'
const algosdk = require('algosdk')

const algodClient = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', '');

// Token sale configuration
const DEGEN_SALE_CONFIG = {
  assetId: parseInt(process.env.DEGEN_ASSET_ID!),
  rate: 10000, // 1 ALGO = 10,000 DEGEN tokens
  minPurchase: 0.1, // Minimum 0.1 ALGO
  maxPurchase: 100, // Maximum 100 ALGO per transaction
}

export async function POST(request: Request) {
  try {
    const { buyerAddress, algoAmount } = await request.json()

    if (!buyerAddress || !algoAmount) {
      return NextResponse.json({ 
        success: false, 
        error: 'buyerAddress and algoAmount required' 
      }, { status: 400 })
    }

    // Validate purchase amount
    if (algoAmount < DEGEN_SALE_CONFIG.minPurchase) {
      return NextResponse.json({ 
        success: false, 
        error: `Minimum purchase is ${DEGEN_SALE_CONFIG.minPurchase} ALGO` 
      }, { status: 400 })
    }

    if (algoAmount > DEGEN_SALE_CONFIG.maxPurchase) {
      return NextResponse.json({ 
        success: false, 
        error: `Maximum purchase is ${DEGEN_SALE_CONFIG.maxPurchase} ALGO` 
      }, { status: 400 })
    }

    // Calculate DEGEN tokens to send
    const degenAmount = Math.floor(algoAmount * DEGEN_SALE_CONFIG.rate * 1e6) // Convert to microDEGEN

    // Get creator account
    const creatorAccount = algosdk.mnemonicToSecretKey(process.env.CREATOR_MNEMONIC!)
    
    // Check if creator has enough DEGEN tokens
    const creatorInfo = await algodClient.accountInformation(creatorAccount.addr).do()
    const creatorAssets = creatorInfo.assets || []
    const degenAsset = creatorAssets.find((asset: any) => asset['asset-id'] === DEGEN_SALE_CONFIG.assetId)
    
    if (!degenAsset || degenAsset.amount < degenAmount) {
      return NextResponse.json({ 
        success: false, 
        error: 'Insufficient DEGEN tokens in treasury' 
      }, { status: 400 })
    }

    // Create transaction to send DEGEN tokens
    const params = await algodClient.getTransactionParams().do()
    
    const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: creatorAccount.addr,
      to: buyerAddress,
      amount: degenAmount,
      assetIndex: DEGEN_SALE_CONFIG.assetId,
      suggestedParams: params
    })

    const signedTxn = txn.signTxn(creatorAccount.sk)
    const { txId } = await algodClient.sendRawTransaction(signedTxn).do()

    // Wait for confirmation
    await algosdk.waitForConfirmation(algodClient, txId, 4)

    return NextResponse.json({
      success: true,
      data: {
        txId,
        degenAmount: degenAmount / 1e6, // Convert back to DEGEN
        algoAmount,
        rate: DEGEN_SALE_CONFIG.rate,
        paymentAddress: process.env.CREATOR_ADDRESS,
        explorerUrl: `https://testnet.algoexplorer.io/tx/${txId}`
      }
    })

  } catch (error: any) {
    console.error('Token sale error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Token sale failed' 
    }, { status: 500 })
  }
}

// Get token sale info
export async function GET() {
  try {
    const creatorAccount = algosdk.mnemonicToSecretKey(process.env.CREATOR_MNEMONIC!)
    const creatorInfo = await algodClient.accountInformation(creatorAccount.addr).do()
    const creatorAssets = creatorInfo.assets || []
    const degenAsset = creatorAssets.find((asset: any) => asset['asset-id'] === DEGEN_SALE_CONFIG.assetId)
    
    const availableTokens = degenAsset ? degenAsset.amount / 1e6 : 0

    return NextResponse.json({
      success: true,
      data: {
        assetId: DEGEN_SALE_CONFIG.assetId,
        rate: DEGEN_SALE_CONFIG.rate,
        minPurchase: DEGEN_SALE_CONFIG.minPurchase,
        maxPurchase: DEGEN_SALE_CONFIG.maxPurchase,
        availableTokens,
        paymentAddress: process.env.CREATOR_ADDRESS,
        pricePerToken: 1 / DEGEN_SALE_CONFIG.rate // ALGO per DEGEN
      }
    })

  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}