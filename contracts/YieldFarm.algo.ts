import algosdk from 'algosdk'

export interface YieldFarm {
  id: string
  poolAddress: string
  rewardTokenId: number
  rewardRate: number // Tokens per second
  totalStaked: number
  startTime: number
  endTime: number
}

export interface FarmPosition {
  id: string
  farmId: string
  userAddress: string
  stakedAmount: number
  rewardDebt: number
  lastUpdateTime: number
}

export const YIELD_FARMS: YieldFarm[] = [
  {
    id: 'algo_degen_farm',
    poolAddress: '',
    rewardTokenId: 0, // DEGEN token
    rewardRate: 1.157407, // ~100k DEGEN per day
    totalStaked: 0,
    startTime: Date.now() / 1000,
    endTime: (Date.now() / 1000) + (365 * 24 * 60 * 60) // 1 year
  }
]

export async function stakeLPTokens(
  algodClient: algosdk.Algodv2,
  userAccount: algosdk.Account,
  farmId: string,
  lpTokenAmount: number
): Promise<string> {
  const params = await algodClient.getTransactionParams().do()
  
  const farm = YIELD_FARMS.find(f => f.id === farmId)
  if (!farm) throw new Error('Farm not found')
  
  // Create stake transaction
  const appArgs = [
    new Uint8Array(Buffer.from('stake')),
    algosdk.encodeUint64(lpTokenAmount * 1e6),
    new Uint8Array(Buffer.from(farmId))
  ]
  
  const txn = algosdk.makeApplicationNoOpTxnFromObject({
    from: userAccount.addr,
    appIndex: 0, // Farm app ID
    appArgs,
    suggestedParams: params,
  })
  
  const signedTxn = txn.signTxn(userAccount.sk)
  const { txId } = await algodClient.sendRawTransaction(signedTxn).do()
  
  await algosdk.waitForConfirmation(algodClient, txId, 4)
  return txId
}

export function calculateFarmRewards(
  position: FarmPosition,
  farm: YieldFarm,
  currentTime: number
): number {
  if (farm.totalStaked === 0) return 0
  
  const timeElapsed = currentTime - position.lastUpdateTime
  const userShare = position.stakedAmount / farm.totalStaked
  const rewards = timeElapsed * farm.rewardRate * userShare
  
  return Math.floor(rewards)
}

export function calculateAPR(
  farm: YieldFarm,
  lpTokenPrice: number,
  rewardTokenPrice: number
): number {
  if (farm.totalStaked === 0) return 0
  
  const annualRewards = farm.rewardRate * 365 * 24 * 60 * 60
  const rewardValue = annualRewards * rewardTokenPrice
  const stakedValue = farm.totalStaked * lpTokenPrice
  
  return (rewardValue / stakedValue) * 100
}