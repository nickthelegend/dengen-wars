import algosdk from 'algosdk'

export interface LiquidityPool {
  id: string
  assetAId: number // ALGO (0)
  assetBId: number // DEGEN
  reserveA: number
  reserveB: number
  totalLiquidity: number
  feeRate: number // 0.3% = 0.003
}

export async function createLiquidityPool(
  algodClient: algosdk.Algodv2,
  creatorAccount: algosdk.Account,
  degenAssetId: number,
  initialAlgoAmount: number,
  initialDegenAmount: number
): Promise<string> {
  const params = await algodClient.getTransactionParams().do()
  
  // Create pool account
  const poolAccount = algosdk.generateAccount()
  
  // Fund pool with ALGO
  const algoTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: creatorAccount.addr,
    to: poolAccount.addr,
    amount: initialAlgoAmount * 1e6,
    suggestedParams: params,
  })
  
  // Add DEGEN to pool
  const degenTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: creatorAccount.addr,
    to: poolAccount.addr,
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
  
  const { txId } = await algodClient.sendRawTransaction(signedTxns).do()
  await algosdk.waitForConfirmation(algodClient, txId, 4)
  
  return poolAccount.addr
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

export function calculateLiquidityTokens(
  algoAmount: number,
  degenAmount: number,
  algoReserve: number,
  degenReserve: number,
  totalLiquidity: number
): number {
  if (totalLiquidity === 0) {
    return Math.sqrt(algoAmount * degenAmount)
  }
  
  const algoRatio = algoAmount / algoReserve
  const degenRatio = degenAmount / degenReserve
  const ratio = Math.min(algoRatio, degenRatio)
  
  return totalLiquidity * ratio
}