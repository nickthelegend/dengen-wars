import algosdk from 'algosdk'
import type { BattleCardNFT } from '../types/nft'

export async function createBattleCardNFT(
  algodClient: algosdk.Algodv2,
  creatorAccount: algosdk.Account,
  nftData: BattleCardNFT
): Promise<number> {
  const params = await algodClient.getTransactionParams().do()
  
  const metadata = {
    name: nftData.name,
    description: nftData.description,
    image: nftData.image,
    attributes: nftData.metadata.attributes,
    ability: nftData.ability
  }
  
  const metadataJSON = JSON.stringify(metadata)
  const metadataHash = new Uint8Array(algosdk.sha256(Buffer.from(metadataJSON)))
  
  const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
    from: creatorAccount.addr,
    suggestedParams: params,
    total: 1, // NFT is unique
    decimals: 0,
    defaultFrozen: false,
    unitName: `CARD${nftData.id}`,
    assetName: nftData.name,
    url: `https://dengenleague.com/nft/${nftData.id}`,
    metadataHash,
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

export async function transferNFT(
  algodClient: algosdk.Algodv2,
  senderAccount: algosdk.Account,
  receiverAddress: string,
  nftAssetId: number
): Promise<string> {
  const params = await algodClient.getTransactionParams().do()
  
  const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: senderAccount.addr,
    to: receiverAddress,
    amount: 1,
    assetIndex: nftAssetId,
    suggestedParams: params,
  })
  
  const signedTxn = txn.signTxn(senderAccount.sk)
  const { txId } = await algodClient.sendRawTransaction(signedTxn).do()
  
  await algosdk.waitForConfirmation(algodClient, txId, 4)
  return txId
}

export const BATTLE_CARD_TEMPLATES: Omit<BattleCardNFT, 'id'>[] = [
  {
    name: 'Diamond Hands',
    description: 'Protects against negative price movements',
    rarity: 'legendary',
    ability: {
      type: 'price_protection',
      value: 100,
      duration: 30
    },
    image: 'https://dengenleague.com/cards/diamond-hands.png',
    metadata: {
      creator: 'DengenLeague',
      collection: 'Battle Cards Genesis',
      attributes: [
        { trait_type: 'Rarity', value: 'Legendary' },
        { trait_type: 'Ability', value: 'Price Protection' },
        { trait_type: 'Power Level', value: 100 }
      ]
    }
  },
  {
    name: 'Rocket Fuel',
    description: 'Doubles score for 15 seconds',
    rarity: 'epic',
    ability: {
      type: 'score_boost',
      value: 200,
      duration: 15
    },
    image: 'https://dengenleague.com/cards/rocket-fuel.png',
    metadata: {
      creator: 'DengenLeague',
      collection: 'Battle Cards Genesis',
      attributes: [
        { trait_type: 'Rarity', value: 'Epic' },
        { trait_type: 'Ability', value: 'Score Boost' },
        { trait_type: 'Power Level', value: 85 }
      ]
    }
  }
]