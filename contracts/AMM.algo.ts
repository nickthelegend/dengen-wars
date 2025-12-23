import algosdk from 'algosdk'

export interface AMMPool {
  id: string
  degenAssetId: number
  algoReserve: number
  degenReserve: number
  totalShares: number
  feeRate: number
}

export const AMM_POOL: AMMPool = {
  id: 'degen_algo_pool',
  degenAssetId: 0, // To be set after DEGEN creation
  algoReserve: 0,
  degenReserve: 0,
  totalShares: 0,
  feeRate: 0.003 // 0.3%
}

export async function createAMMPool(
  algodClient: algosdk.Algodv2,
  creatorAccount: algosdk.Account,
  initialAlgoAmount: number,
  initialDegenAmount: number,
  degenAssetId: number
): Promise<string> {
  const poolAccount = algosdk.generateAccount()

  const params = await algodClient.getTransactionParams().do()

  // Fund pool with ALGO
  const algoTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: creatorAccount.addr,
    receiver: poolAccount.addr,
    amount: initialAlgoAmount * 1e6,
    suggestedParams: params,
  })

  // Add DEGEN to pool
  const degenTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    sender: creatorAccount.addr,
    receiver: poolAccount.addr,
    amount: initialDegenAmount * 1e6,
    assetIndex: degenAssetId,
    suggestedParams: params,
  })

  const txns = [algoTxn, degenTxn]
  algosdk.assignGroupID(txns)

  const signedTxns = [
    algoTxn.signTxn(creatorAccount.sk),
    degenTxn.signTxn(creatorAccount.sk)
  ]

  const sendResponse = await algodClient.sendRawTransaction(signedTxns).do()
  const txId = sendResponse.txid

  await algosdk.waitForConfirmation(algodClient, txId, 4)

  return poolAccount.addr as unknown as string
}

export function getK(reserveA: number, reserveB: number): number {
  return reserveA * reserveB
}

export function calculateSwapOutput(
  inputAmount: number,
  inputReserve: number,
  outputReserve: number,
  feeRate: number = 0.003
): number {
  const inputAmountWithFee = inputAmount * (1 - feeRate)
  const numerator = inputAmountWithFee * outputReserve
  const denominator = inputReserve + inputAmountWithFee
  return numerator / denominator
}

export function calculateLiquidityShares(
  algoAmount: number,
  degenAmount: number,
  algoReserve: number,
  degenReserve: number,
  totalShares: number
): number {
  if (totalShares === 0) {
    return Math.sqrt(algoAmount * degenAmount)
  }

  const algoRatio = algoAmount / algoReserve
  const degenRatio = degenAmount / degenReserve
  const ratio = Math.min(algoRatio, degenRatio)

  return totalShares * ratio
}

export async function addLiquidity(
  algodClient: algosdk.Algodv2,
  userAccount: algosdk.Account,
  algoAmount: number,
  degenAmount: number,
  poolAddress: string,
  degenAssetId: number
): Promise<string> {
  if (algoAmount <= 0 || degenAmount <= 0) throw new Error('Invalid amounts')

  const params = await algodClient.getTransactionParams().do()

  // Send ALGO to pool
  const algoTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: userAccount.addr,
    receiver: poolAddress,
    amount: algoAmount * 1e6,
    suggestedParams: params,
  })

  // Send DEGEN to pool
  const degenTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    sender: userAccount.addr,
    receiver: poolAddress,
    amount: degenAmount * 1e6,
    assetIndex: degenAssetId,
    suggestedParams: params,
  })

  const txns = [algoTxn, degenTxn]
  algosdk.assignGroupID(txns)

  const signedTxns = [
    algoTxn.signTxn(userAccount.sk),
    degenTxn.signTxn(userAccount.sk)
  ]

  const sendResponse = await algodClient.sendRawTransaction(signedTxns).do()
  const txId = sendResponse.txid

  await algosdk.waitForConfirmation(algodClient, txId, 4)

  return txId
}

export async function swapExactAlgoForDegen(
  algodClient: algosdk.Algodv2,
  userAccount: algosdk.Account,
  algoAmount: number,
  minDegenOut: number,
  poolAddress: string,
  degenAssetId: number
): Promise<string> {
  if (algoAmount <= 0) throw new Error('Invalid amount')

  const outDegen = calculateSwapOutput(algoAmount, AMM_POOL.algoReserve, AMM_POOL.degenReserve)
  if (outDegen < minDegenOut || outDegen <= 0) throw new Error('Slippage')

  const params = await algodClient.getTransactionParams().do()

  // Send ALGO to pool
  const algoTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: userAccount.addr,
    receiver: poolAddress,
    amount: algoAmount * 1e6,
    suggestedParams: params,
  })

  // Pool sends DEGEN (placeholder, would need smart contract)
  const degenTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    sender: poolAddress,
    receiver: userAccount.addr,
    amount: Math.floor(outDegen * 1e6),
    assetIndex: degenAssetId,
    suggestedParams: params,
  })

  // For demo, only send ALGO
  const signedTxn = algoTxn.signTxn(userAccount.sk)
  const sendResponse = await algodClient.sendRawTransaction(signedTxn).do()
  const txId = sendResponse.txid

  await algosdk.waitForConfirmation(algodClient, txId, 4)

  return txId
}
