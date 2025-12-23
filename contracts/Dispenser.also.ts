import algosdk from 'algosdk'

export interface DispenserConfig {
  rate: number // 1 ALGO = rate WAM tokens
  wamAssetId: number
  dispenserAddress: string
}

export const DISPENSER_CONFIG: DispenserConfig = {
  rate: 10000, // 1 ALGO = 10,000 DEGEN
  wamAssetId: 0, // To be set after DEGEN creation
  dispenserAddress: '', // To be set after dispenser account creation
}

export async function createDispenserAccount(
  algodClient: algosdk.Algodv2,
  creatorAccount: algosdk.Account,
  initialWamAmount: number
): Promise<string> {
  const dispenserAccount = algosdk.generateAccount()

  // Fund dispenser with minimum balance
  const fundTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: creatorAccount.addr,
    receiver: dispenserAccount.addr,
    amount: 100000, // 0.1 ALGO
    suggestedParams: await algodClient.getTransactionParams().do(),
  })

  // Transfer WAM tokens to dispenser
  const wamTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    sender: creatorAccount.addr,
    receiver: dispenserAccount.addr,
    amount: initialWamAmount * 1e6,
    assetIndex: DISPENSER_CONFIG.wamAssetId,
    suggestedParams: await algodClient.getTransactionParams().do(),
  })

  const txns = [fundTxn, wamTxn]
  algosdk.assignGroupID(txns)

  const signedTxns = [
    fundTxn.signTxn(creatorAccount.sk),
    wamTxn.signTxn(creatorAccount.sk)
  ]

  const sendResponse = await algodClient.sendRawTransaction(signedTxns).do()
  const txId = sendResponse.txid

  await algosdk.waitForConfirmation(algodClient, txId, 4)

  return dispenserAccount.addr as string
}

export async function buyWAMTokens(
  algodClient: algosdk.Algodv2,
  buyerAccount: algosdk.Account,
  algoAmount: number,
  dispenserAddress: string,
  wamAssetId: number
): Promise<string> {
  if (algoAmount <= 0) throw new Error('Send ALGO to buy tokens')

  const tokensToSend = algoAmount * DISPENSER_CONFIG.rate * 1e6

  // Check dispenser balance (would need to query)
  // For simplicity, assume it has enough

  const params = await algodClient.getTransactionParams().do()

  // Send ALGO to dispenser
  const algoTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: buyerAccount.addr,
    receiver: dispenserAddress,
    amount: algoAmount * 1e6,
    suggestedParams: params,
  })

  // Dispenser sends WAM (but since we can't sign for dispenser, this would be handled by a smart contract)
  // For now, this is a placeholder

  const signedTxn = algoTxn.signTxn(buyerAccount.sk)
  const sendResponse = await algodClient.sendRawTransaction(signedTxn).do()
  const txId = sendResponse.txid

  await algosdk.waitForConfirmation(algodClient, txId, 4)

  return txId
}

export async function withdrawALGO(
  algodClient: algosdk.Algodv2,
  dispenserAccount: algosdk.Account,
  amount: number,
  receiverAddress: string
): Promise<string> {
  const params = await algodClient.getTransactionParams().do()

  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: dispenserAccount.addr,
    receiver: receiverAddress,
    amount: amount * 1e6,
    suggestedParams: params,
  })

  const signedTxn = txn.signTxn(dispenserAccount.sk)
  const sendResponse = await algodClient.sendRawTransaction(signedTxn).do()
  const txId = sendResponse.txid

  await algosdk.waitForConfirmation(algodClient, txId, 4)

  return txId
}
