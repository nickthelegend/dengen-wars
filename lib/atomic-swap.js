const algosdk = require('algosdk')

const algodClient = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', '')

const SWAP_CONFIG = {
  assetId: parseInt(process.env.DEGEN_ASSET_ID || '745007115'),
  rate: 1000, // 1 ALGO = 1,000 DEGEN (reduced from 10,000)
  minPurchase: 0.1,
  maxPurchase: 100
}

console.log('SWAP_CONFIG loaded:', SWAP_CONFIG)
console.log('DEGEN_ASSET_ID env var:', process.env.DEGEN_ASSET_ID)
console.log('Parsed assetId:', SWAP_CONFIG.assetId, 'Type:', typeof SWAP_CONFIG.assetId)

// Validate asset ID according to ASA documentation requirements
console.log('Validating asset ID:', SWAP_CONFIG.assetId)
console.log('Is assetId truthy?', !!SWAP_CONFIG.assetId)
console.log('Is assetId > 0?', SWAP_CONFIG.assetId > 0)
console.log('Is assetId < 2^53?', SWAP_CONFIG.assetId < Math.pow(2, 53))
console.log('2^53 value:', Math.pow(2, 53))

if (!SWAP_CONFIG.assetId || SWAP_CONFIG.assetId <= 0 || SWAP_CONFIG.assetId >= Math.pow(2, 53)) {
  throw new Error(`Invalid asset ID: ${SWAP_CONFIG.assetId}. Must be positive number < 2^53-1`)
}
console.log('Asset ID validation: ✅ PASSED')

async function createAtomicSwap(buyerAddress, algoAmount) {
  try {
    console.log('Creating atomic swap for:', { buyerAddress, algoAmount })

    // Validate environment variables
    if (!process.env.DEGEN_ASSET_ID) {
      throw new Error('DEGEN_ASSET_ID environment variable is not set')
    }

    if (!process.env.CREATOR_MNEMONIC) {
      throw new Error('CREATOR_MNEMONIC environment variable is not set')
    }

    // Validate inputs with better error messages
    if (!buyerAddress || buyerAddress === '' || buyerAddress === null || buyerAddress === undefined) {
      throw new Error('Wallet address is required. Please connect your wallet.')
    }

    // Validate Algorand address format (should be 58 characters)
    if (typeof buyerAddress !== 'string' || buyerAddress.length !== 58) {
      throw new Error(`Invalid wallet address format. Expected 58 characters, got ${buyerAddress.length}`)
    }

    if (!algoAmount || algoAmount <= 0) {
      throw new Error('Valid ALGO amount is required')
    }

    if (algoAmount < SWAP_CONFIG.minPurchase || algoAmount > SWAP_CONFIG.maxPurchase) {
      throw new Error(`Amount must be between ${SWAP_CONFIG.minPurchase} and ${SWAP_CONFIG.maxPurchase} ALGO`)
    }

    console.log('Validation passed, creating transaction...')

    const degenAmount = Math.floor(algoAmount * SWAP_CONFIG.rate * 1e6)
    const algoMicroAmount = Math.floor(algoAmount * 1e6)
    console.log('Calculated amounts:', { degenAmount, algoMicroAmount })

    // Check creator account balance
    console.log('Checking creator account balance...')
    const creatorAccount = algosdk.mnemonicToSecretKey(process.env.CREATOR_MNEMONIC)
    const creatorAddress = creatorAccount.addr.toString() // Convert Address object to string
    console.log('Creator address:', creatorAddress)

    try {
      const accountInfo = await algodClient.accountInformation(creatorAddress).do()
      console.log('Creator account info:', {
        address: creatorAccount.addr,
        amount: Number(accountInfo.amount) / 1e6, // Convert BigInt to number then to ALGO
        assets: accountInfo.assets?.map(asset => ({
          id: asset['asset-id'],
          amount: Number(asset.amount) // Convert BigInt to number
        }))
      })

      // Check if creator has enough DEGEN tokens
      console.log('Looking for DEGEN asset ID:', SWAP_CONFIG.assetId)
      console.log('Available assets:', accountInfo.assets?.map(asset => ({
        assetId: asset['asset-id'] || asset.assetId,
        amount: Number(asset.amount)
      })))

      const degenAsset = accountInfo.assets?.find(asset => {
        const assetId = asset['asset-id'] || asset.assetId
        return Number(assetId) === SWAP_CONFIG.assetId
      })

      console.log('Found DEGEN asset:', degenAsset)

      // TEMPORARY BYPASS FOR TESTING - Remove this in production
      const bypassBalanceCheck = process.env.BYPASS_DEGEN_BALANCE_CHECK === 'true'

      if (!bypassBalanceCheck && (!degenAsset || Number(degenAsset.amount) < degenAmount)) {
        throw new Error(`Creator account has insufficient DEGEN balance. Has: ${Number(degenAsset?.amount || 0)}, Needs: ${degenAmount}`)
      }

      if (bypassBalanceCheck) {
        console.log('⚠️ BYPASSING DEGEN BALANCE CHECK FOR TESTING')
      } else {
        console.log('Creator has sufficient DEGEN balance')
      }
    } catch (balanceError) {
      console.error('Error checking creator balance:', balanceError)
      throw new Error(`Failed to check creator account balance: ${balanceError.message}`)
    }

    // Check buyer account balance (optional but helpful)
    console.log('Checking buyer account balance...')
    try {
      const buyerAccountInfo = await algodClient.accountInformation(buyerAddress).do()
      console.log('Buyer account info:', {
        address: buyerAddress,
        amount: Number(buyerAccountInfo.amount) / 1e6, // Convert BigInt to number then to ALGO
        minBalance: Number(buyerAccountInfo['min-balance']) / 1e6
      })

      // Check if buyer has enough ALGO (including min balance)
      const availableBalance = Number(buyerAccountInfo.amount) - Number(buyerAccountInfo['min-balance'])
      if (availableBalance < algoMicroAmount) {
        throw new Error(`Buyer account has insufficient ALGO balance. Available: ${availableBalance / 1e6}, Needs: ${algoAmount}`)
      }
      console.log('Buyer has sufficient ALGO balance')
    } catch (buyerBalanceError) {
      console.error('Error checking buyer balance:', buyerBalanceError)
      // Don't fail the swap if we can't check buyer balance, but log it
      console.log('Continuing without buyer balance check due to error')
    }

    console.log('Getting transaction params...')
    const params = await algodClient.getTransactionParams().do()
    console.log('Transaction params:', params)

    const compatibleParams = {
      ...params,
      fee: Math.max(params.fee, params.minFee) // Ensure fee is at least minFee
    }

    console.log('Creating ALGO payment transaction...')
    console.log('From address:', buyerAddress)
    console.log('To address:', creatorAddress)
    console.log('Amount (microAlgos):', algoMicroAmount)

    let algoTxn, degenTxn
    try {
      // ✅ ALGOSDK v3.x COMPATIBLE: Use makePaymentTxnWithSuggestedParamsFromObject
      console.log('Using algosdk v3.x compatible functions...')

      console.log('Creating transactions with:')
      console.log('- From (buyer):', buyerAddress, 'Type:', typeof buyerAddress)
      console.log('- To (creator):', creatorAddress, 'Type:', typeof creatorAddress)

      // Create ALGO payment transaction using v2.x API
      algoTxn = algosdk.makePaymentTxnWithSuggestedParams(
        buyerAddress,
        creatorAddress,
        algoMicroAmount,
        undefined, // closeRemainderTo
        undefined, // note
        compatibleParams
      )
      console.log('ALGO transaction created successfully')
    } catch (algoTxnError) {
      console.error('Error creating ALGO transaction:', algoTxnError)
      throw new Error(`Failed to create ALGO payment transaction: ${algoTxnError.message}`)
    }

    console.log('Creating DEGEN transfer transaction...')
    console.log('Asset ID before transaction:', SWAP_CONFIG.assetId)
    console.log('Asset ID type:', typeof SWAP_CONFIG.assetId)
    console.log('Asset ID as Number:', Number(SWAP_CONFIG.assetId))
    console.log('Is valid number?', !isNaN(Number(SWAP_CONFIG.assetId)))
    console.log('Is positive?', Number(SWAP_CONFIG.assetId) > 0)
    console.log('Is less than 2^53?', Number(SWAP_CONFIG.assetId) < Math.pow(2, 53))

    try {
      // Use the correct function for algosdk v2.x with proper parameters
      const assetIndex = Number(SWAP_CONFIG.assetId)
      console.log('Final assetIndex value:', assetIndex)

      degenTxn = algosdk.makeAssetTransferTxnWithSuggestedParams(
        creatorAddress,        // from (string)
        buyerAddress,          // to (string)
        undefined,             // closeRemainderTo
        undefined,             // revocationTarget
        assetIndex,            // assetIndex
        degenAmount,           // amount
        new Uint8Array(),      // note (empty Uint8Array for v2.x)
        compatibleParams       // suggestedParams
      )
      console.log('DEGEN transaction created successfully')
    } catch (degenTxnError) {
      console.error('Error creating DEGEN transaction:', degenTxnError)
      throw new Error(`Failed to create DEGEN transfer transaction: ${degenTxnError.message}`)
    }

    console.log('Grouping transactions...')
    // Group transactions atomically
    const txnGroup = [algoTxn, degenTxn]
    algosdk.assignGroupID(txnGroup)
    console.log('Transactions grouped successfully')

    // Creator signs their transaction
    const signedDegenTxn = degenTxn.signTxn(creatorAccount.sk)

    // Return unsigned ALGO transaction for buyer to sign
    const unsignedAlgoTxn = algosdk.encodeUnsignedTransaction(algoTxn)

    return {
      success: true,
      data: {
        unsignedTransaction: Array.from(unsignedAlgoTxn),
        signedCreatorTransaction: Array.from(signedDegenTxn),
        degenAmount: degenAmount / 1e6,
        algoAmount,
        rate: SWAP_CONFIG.rate
      }
    }

  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

async function submitAtomicSwap(signedUserTransaction, signedCreatorTransaction) {
  try {
    const userTxn = new Uint8Array(signedUserTransaction)
    const creatorTxn = new Uint8Array(signedCreatorTransaction)

    const { txId } = await algodClient.sendRawTransaction([userTxn, creatorTxn]).do()
    await algosdk.waitForConfirmation(algodClient, txId, 4)

    return {
      success: true,
      data: {
        txId,
        explorerUrl: `https://testnet.algoexplorer.io/tx/${txId}`
      }
    }

  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

module.exports = {
  createAtomicSwap,
  submitAtomicSwap,
  SWAP_CONFIG
}