import algosdk from 'algosdk'

export interface BattleEscrow {
  battleId: string
  player1: string
  player2: string
  stake: number
  assetId: number
  status: 'pending' | 'active' | 'completed' | 'cancelled'
  winner?: string
  createdAt: number
}

export async function createBattleEscrow(
  algodClient: algosdk.Algodv2,
  player1Account: algosdk.Account,
  player2Address: string,
  stakeAmount: number,
  degenAssetId: number
): Promise<string> {
  const params = await algodClient.getTransactionParams().do()
  
  // Create escrow account
  const escrowAccount = algosdk.generateAccount()
  
  // Fund escrow account with minimum balance
  const fundTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: player1Account.addr,
    to: escrowAccount.addr,
    amount: 100000, // 0.1 ALGO for minimum balance
    suggestedParams: params,
  })
  
  // Player 1 stakes tokens
  const stakeTxn1 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: player1Account.addr,
    to: escrowAccount.addr,
    amount: stakeAmount * 1e6,
    assetIndex: degenAssetId,
    suggestedParams: params,
  })
  
  // Group transactions
  const txns = [fundTxn, stakeTxn1]
  algosdk.assignGroupID(txns)
  
  const signedTxns = [
    fundTxn.signTxn(player1Account.sk),
    stakeTxn1.signTxn(player1Account.sk)
  ]
  
  const { txId } = await algodClient.sendRawTransaction(signedTxns).do()
  await algosdk.waitForConfirmation(algodClient, txId, 4)
  
  return escrowAccount.addr
}

export async function resolveBattleEscrow(
  algodClient: algosdk.Algodv2,
  escrowAccount: algosdk.Account,
  winnerAddress: string,
  loserAddress: string,
  totalStake: number,
  degenAssetId: number
): Promise<string> {
  const params = await algodClient.getTransactionParams().do()
  
  // Winner gets 90% of total stake
  const winnerAmount = Math.floor(totalStake * 0.9 * 1e6)
  // Loser gets 10% back
  const loserAmount = Math.floor(totalStake * 0.1 * 1e6)
  
  const winnerTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: escrowAccount.addr,
    to: winnerAddress,
    amount: winnerAmount,
    assetIndex: degenAssetId,
    suggestedParams: params,
  })
  
  const loserTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: escrowAccount.addr,
    to: loserAddress,
    amount: loserAmount,
    assetIndex: degenAssetId,
    suggestedParams: params,
  })
  
  // Group and sign transactions
  const txns = [winnerTxn, loserTxn]
  algosdk.assignGroupID(txns)
  
  const signedTxns = [
    winnerTxn.signTxn(escrowAccount.sk),
    loserTxn.signTxn(escrowAccount.sk)
  ]
  
  const { txId } = await algodClient.sendRawTransaction(signedTxns).do()
  await algosdk.waitForConfirmation(algodClient, txId, 4)
  
  return txId
}

export function generateBattleId(): string {
  return `battle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}