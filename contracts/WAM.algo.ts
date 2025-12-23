import algosdk from 'algosdk'

export interface WAMConfig {
  total: number
  decimals: number
  defaultFrozen: boolean
  unitName: string
  assetName: string
  url: string
  metadataHash?: Uint8Array
}

export const WAM_CONFIG: WAMConfig = {
  total: 1000000000, // 1 billion tokens
  decimals: 6,
  defaultFrozen: false,
  unitName: 'WAM',
  assetName: 'Wrapped AMM Token',
  url: 'https://dengenleague.com/token/wam',
}

export async function createWAMToken(
  algodClient: algosdk.Algodv2,
  creatorAccount: algosdk.Account
): Promise<number> {
  const params = await algodClient.getTransactionParams().do()

  const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
    sender: creatorAccount.addr,
    suggestedParams: params,
    ...WAM_CONFIG,
    manager: creatorAccount.addr,
    reserve: creatorAccount.addr,
    freeze: creatorAccount.addr,
    clawback: creatorAccount.addr,
  })

  const signedTxn = txn.signTxn(creatorAccount.sk)
  const sendResponse = await algodClient.sendRawTransaction(signedTxn).do()
  const txId = sendResponse.txid

  const result = await algosdk.waitForConfirmation(algodClient, txId, 4)
  return result['asset-index']
}

export async function mintWAMTokens(
  algodClient: algosdk.Algodv2,
  managerAccount: algosdk.Account,
  receiverAddress: string,
  amount: number,
  assetId: number
): Promise<string> {
  const params = await algodClient.getTransactionParams().do()

  const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    sender: managerAccount.addr,
    receiver: receiverAddress,
    amount: amount * Math.pow(10, WAM_CONFIG.decimals),
    assetIndex: assetId,
    suggestedParams: params,
  })

  const signedTxn = txn.signTxn(managerAccount.sk)
  const sendResponse = await algodClient.sendRawTransaction(signedTxn).do()
  const txId = sendResponse.txid

  await algosdk.waitForConfirmation(algodClient, txId, 4)
  return txId
}
