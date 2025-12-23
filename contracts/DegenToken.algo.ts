import algosdk from 'algosdk'

export interface DegenTokenConfig {
  total: number
  decimals: number
  defaultFrozen: boolean
  unitName: string
  assetName: string
  url: string
  metadataHash?: Uint8Array
}

export const DEGEN_TOKEN_CONFIG: DegenTokenConfig = {
  total: 1000000000, // 1 billion tokens
  decimals: 6,
  defaultFrozen: false,
  unitName: 'DEGEN',
  assetName: 'DengenLeague Token',
  url: 'https://dengenleague.com/token',
}

export async function createDegenToken(
  algodClient: algosdk.Algodv2,
  creatorAccount: algosdk.Account
): Promise<number> {
  const params = await algodClient.getTransactionParams().do()
  
  const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
    from: creatorAccount.addr,
    suggestedParams: params,
    ...DEGEN_TOKEN_CONFIG,
    manager: creatorAccount.addr,
    reserve: creatorAccount.addr,
    freeze: creatorAccount.addr,
    clawback: creatorAccount.addr,
  })
  
  const signedTxn = txn.signTxn(creatorAccount.sk)
  const { txId } = await algodClient.sendRawTransaction(signedTxn).do()
  
  const result = await algosdk.waitForConfirmation(algodClient, txId, 4)
  return result['asset-index']
}

export async function transferDegenTokens(
  algodClient: algosdk.Algodv2,
  senderAccount: algosdk.Account,
  receiverAddress: string,
  amount: number,
  assetId: number
): Promise<string> {
  const params = await algodClient.getTransactionParams().do()
  
  const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: senderAccount.addr,
    to: receiverAddress,
    amount: amount * Math.pow(10, DEGEN_TOKEN_CONFIG.decimals),
    assetIndex: assetId,
    suggestedParams: params,
  })
  
  const signedTxn = txn.signTxn(senderAccount.sk)
  const { txId } = await algodClient.sendRawTransaction(signedTxn).do()
  
  await algosdk.waitForConfirmation(algodClient, txId, 4)
  return txId
}