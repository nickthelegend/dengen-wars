import algosdk from 'algosdk'

export interface StakePool {
  id: string
  assetId: number
  totalStaked: number
  rewardRate: number // Annual percentage rate
  lockPeriod: number // In seconds
  minStake: number
}

export const STAKE_POOLS: StakePool[] = [
  {
    id: 'degen_30d',
    assetId: 0, // Will be set after token creation
    totalStaked: 0,
    rewardRate: 12, // 12% APR
    lockPeriod: 30 * 24 * 60 * 60, // 30 days
    minStake: 1000
  },
  {
    id: 'degen_90d',
    assetId: 0,
    totalStaked: 0,
    rewardRate: 25, // 25% APR
    lockPeriod: 90 * 24 * 60 * 60, // 90 days
    minStake: 5000
  }
]

export async function createStakeTransaction(
  algodClient: algosdk.Algodv2,
  stakerAccount: algosdk.Account,
  amount: number,
  poolId: string,
  degenAssetId: number
): Promise<string> {
  const pool = STAKE_POOLS.find(p => p.id === poolId)
  if (!pool || amount < pool.minStake) {
    throw new Error('Invalid pool or insufficient stake amount')
  }
  
  const params = await algodClient.getTransactionParams().do()
  
  // Create application call for staking
  const appArgs = [
    new Uint8Array(Buffer.from('stake')),
    algosdk.encodeUint64(amount * 1e6),
    new Uint8Array(Buffer.from(poolId))
  ]
  
  const txn = algosdk.makeApplicationNoOpTxnFromObject({
    from: stakerAccount.addr,
    appIndex: 0, // Will be set after app deployment
    appArgs,
    suggestedParams: params,
    foreignAssets: [degenAssetId]
  })
  
  const signedTxn = txn.signTxn(stakerAccount.sk)
  const { txId } = await algodClient.sendRawTransaction(signedTxn).do()
  
  await algosdk.waitForConfirmation(algodClient, txId, 4)
  return txId
}

export function calculateStakeRewards(
  stakedAmount: number,
  stakeDuration: number,
  rewardRate: number
): number {
  const annualReward = stakedAmount * (rewardRate / 100)
  const dailyReward = annualReward / 365
  const totalReward = dailyReward * (stakeDuration / (24 * 60 * 60))
  
  return Math.floor(totalReward)
}