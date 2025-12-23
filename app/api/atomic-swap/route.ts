import { NextResponse } from 'next/server'
import algosdk from 'algosdk'

// Initialize the Algod client to connect to the TestNet
const algodClient = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', '');

// --- Configuration ---
const SWAP_CONFIG = {
  assetId: parseInt(process.env.DEGEN_ASSET_ID!),
  rate: 100, // 1 ALGO = 100 DEGEN (further reduced for testing)
  creatorMnemonic: process.env.CREATOR_MNEMONIC!,
  minPurchase: 0.01,
  maxPurchase: 1, // Further reduced for testing
};

/**
 * POST: Creates and prepares the atomic swap transaction group.
 * This is the single, definitive endpoint for creating swaps.
 */
export async function POST(request: Request) {
  try {
    // --- 1. Robust Validation ---
    if (!SWAP_CONFIG.assetId || isNaN(SWAP_CONFIG.assetId)) {
        throw new Error("Server Error: DEGEN_ASSET_ID is missing or invalid in the .env.local file.");
    }
    if (!SWAP_CONFIG.creatorMnemonic) {
        throw new Error("Server Error: CREATOR_MNEMONIC is not set in the .env.local file.");
    }

    const { buyerAddress, algoAmount } = await request.json();

    if (!buyerAddress || typeof buyerAddress !== 'string' || !algosdk.isValidAddress(buyerAddress)) {
      return NextResponse.json({ success: false, error: 'A valid buyer wallet address is required.' }, { status: 400 });
    }
    if (!algoAmount || algoAmount < SWAP_CONFIG.minPurchase || algoAmount > SWAP_CONFIG.maxPurchase) {
      return NextResponse.json({ success: false, error: `Purchase amount must be between ${SWAP_CONFIG.minPurchase} and ${SWAP_CONFIG.maxPurchase} ALGO.`}, { status: 400 });
    }

    // --- 2. Setup and Transaction Creation ---
    const creatorAccount = algosdk.mnemonicToSecretKey(SWAP_CONFIG.creatorMnemonic);
    const creatorAddressString = creatorAccount.addr; // Use the string representation of the address

    const degenAmount = Math.floor(algoAmount * SWAP_CONFIG.rate * 1e6);
    const algoMicroAmount = Math.floor(algoAmount * 1e6);
    const params = await algodClient.getTransactionParams().do();

    // --- 2.5. Check if buyer has already opted into the asset ---
    console.log('Checking if buyer has already opted into DEGEN asset...');
    let buyerAlreadyOptedIn = false;
    try {
      const buyerAccountInfo = await algodClient.accountInformation(buyerAddress).do();
      const buyerAssets = buyerAccountInfo.assets || [];
      const degenAsset = buyerAssets.find((asset: any) => asset['asset-id'] === SWAP_CONFIG.assetId);
      buyerAlreadyOptedIn = !!degenAsset;
      console.log('Buyer opt-in status:', buyerAlreadyOptedIn ? 'Already opted in' : 'Needs to opt-in');
    } catch (accountError: any) {
      console.log('Could not check buyer account, assuming opt-in needed:', accountError.message);
    }

    // ✅ ALGOSDK v3.x COMPATIBLE: Use the modern "...FromObject" functions.

    // First, create opt-in transaction for the buyer
    const optInTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      sender: buyerAddress,
      receiver: buyerAddress, // Send to self to opt-in
      amount: 0, // 0 amount for opt-in
      assetIndex: SWAP_CONFIG.assetId,
      suggestedParams: params,
    });

    // Payment transaction
    const algoTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      sender: buyerAddress,
      receiver: creatorAddressString,
      amount: algoMicroAmount,
      suggestedParams: params,
    });

    // DEGEN transfer transaction
    const degenTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      sender: creatorAddressString,
      receiver: buyerAddress,
      amount: degenAmount,
      assetIndex: SWAP_CONFIG.assetId,
      suggestedParams: params,
    });

    // --- 3. Group, Sign, and Encode ---
    algosdk.assignGroupID([optInTxn, algoTxn, degenTxn]);
    const signedDegenTxn = degenTxn.signTxn(creatorAccount.sk);

    // Encode transactions for the wallet
    const unsignedOptInTxn = algosdk.encodeUnsignedTransaction(optInTxn);
    const unsignedAlgoTxn = algosdk.encodeUnsignedTransaction(algoTxn);

    // --- 4. Return Complete Transaction Group ---
    return NextResponse.json({
      success: true,
      data: {
        // Send complete transaction group to wallet (3 transactions)
        transactions: [
          {
            txn: Array.from(unsignedOptInTxn),
            signers: [buyerAddress], // User needs to sign opt-in
          },
          {
            txn: Array.from(unsignedAlgoTxn),
            signers: [buyerAddress], // User needs to sign payment
          },
          {
            txn: Array.from(signedDegenTxn),
            signers: [], // Already signed by creator
          }
        ],
        // Keep backward compatibility
        unsignedTransaction: Array.from(unsignedAlgoTxn),
        signedCreatorTransaction: Array.from(signedDegenTxn),
      },
    });

  } catch (error: any) {
    console.error('Error creating atomic swap:', error);
    // Return a generic error to the user for security
    return NextResponse.json({ success: false, error: "An internal server error occurred. Please try again later." }, { status: 500 });
  }
}

/**
 * PUT: Submits the fully signed transaction group to the network.
 */
export async function PUT(request: Request) {
    try {
      const { signedUserTransaction, signedCreatorTransaction } = await request.json();

      console.log('PUT request received:', {
        signedUserTransaction: signedUserTransaction ? 'present' : 'missing',
        signedCreatorTransaction: signedCreatorTransaction ? 'present' : 'missing',
        userTransactionLength: signedUserTransaction ? signedUserTransaction.length : 0,
        creatorTransactionLength: signedCreatorTransaction ? signedCreatorTransaction.length : 0
      });

      if (!signedUserTransaction || !signedCreatorTransaction) {
        return NextResponse.json({ success: false, error: "Both signed transactions are required." }, { status: 400 });
      }

      // Handle the transaction group - could be 1, 2, or 3 transactions
      let optInTxn: Uint8Array | null = null;
      let userTxn: Uint8Array | null = null;
      const creatorTxn = new Uint8Array(signedCreatorTransaction);

      console.log('Processing signed transactions:')
      console.log('- signedUserTransaction length:', signedUserTransaction ? signedUserTransaction.length : 0)
      console.log('- signedCreatorTransaction length:', signedCreatorTransaction ? signedCreatorTransaction.length : 0)

      if (signedUserTransaction && signedUserTransaction.length > 0) {
        if (signedUserTransaction.length >= 1) {
          userTxn = new Uint8Array(signedUserTransaction[0]);
          console.log('User transaction loaded, length:', userTxn.length)
        }
        if (signedUserTransaction.length >= 2) {
          optInTxn = new Uint8Array(signedUserTransaction[1]);
          console.log('Opt-in transaction loaded, length:', optInTxn.length)
        }
      } else {
        console.log('No user transactions provided - using fallback mode')
      }

      console.log('Transaction sizes:', {
        optInTxn: optInTxn ? optInTxn.length : 0,
        userTxn: userTxn ? userTxn.length : 0,
        creatorTxn: creatorTxn.length
      });

      // Validate transaction formats
      console.log('Validating transaction formats...');
      try {
        if (optInTxn) {
          const decodedOptInTxn = algosdk.decodeSignedTransaction(optInTxn);
          console.log('Opt-in transaction type:', decodedOptInTxn.txn.type);
        } else {
          console.log('No opt-in transaction (not needed or using fallback)')
        }

        if (userTxn) {
          const decodedUserTxn = algosdk.decodeSignedTransaction(userTxn);
          console.log('User transaction type:', decodedUserTxn.txn.type);
        } else {
          console.log('No user transaction provided - checking if this is expected...')

          // Check if this is a fallback scenario where only creator transaction is provided
          if (signedUserTransaction && signedUserTransaction.length === 0) {
            console.log('This appears to be a fallback scenario - proceeding without user transaction')
            // In fallback mode, we only need the creator transaction
            // The user transaction might be handled differently
          } else {
            console.log('Unexpected: No user transaction in non-fallback scenario')
            return NextResponse.json({
              success: false,
              error: 'User transaction is required but was not provided'
            }, { status: 400 });
          }
        }

        const decodedCreatorTxn = algosdk.decodeSignedTransaction(creatorTxn);
        console.log('Creator transaction type:', decodedCreatorTxn.txn.type);
      } catch (decodeError: any) {
        console.error('Transaction decoding failed:', decodeError);
        return NextResponse.json({
          success: false,
          error: `Invalid transaction format: ${decodeError.message}`
        }, { status: 400 });
      }

      // Build transaction array dynamically
      const transactionsToSubmit: Uint8Array[] = [];
      if (optInTxn) transactionsToSubmit.push(optInTxn);
      if (userTxn) transactionsToSubmit.push(userTxn);
      transactionsToSubmit.push(creatorTxn);

      console.log(`Submitting ${transactionsToSubmit.length} transactions to network...`);

      // Only submit if we have at least the creator transaction
      if (transactionsToSubmit.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'No valid transactions to submit'
        }, { status: 400 });
      }
      let txId: string;
      try {
        const sendResponse = await algodClient.sendRawTransaction(transactionsToSubmit).do();
        txId = sendResponse.txid;
        console.log('Transaction group submitted successfully, txId:', txId);

        // Wait for confirmation
        console.log('Waiting for confirmation...');
        await algosdk.waitForConfirmation(algodClient, txId, 4);
        console.log('Transaction group confirmed successfully');

      } catch (submitError: any) {
        console.error('Transaction submission failed:', submitError);
        return NextResponse.json({
          success: false,
          error: `Transaction submission failed: ${submitError.message}`
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        data: {
          txId,
          explorerUrl: `https://testnet.algoexplorer.io/tx/${txId}`
        }
      });

    } catch (error: any) {
      console.error('Transaction submission error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
      return NextResponse.json({ success: false, error: "Failed to submit transaction to the network." }, { status: 500 });
    }
}