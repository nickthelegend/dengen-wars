"use client"

import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRotate, faSeedling, faShield } from '@fortawesome/free-solid-svg-icons'

const DashboardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px;
`

const DeFiCard = styled.div`
  background: var(--light-bg);
  border: 4px solid var(--border-primary);
  padding: 20px;
  box-shadow: 4px 4px 0px 0px var(--border-primary);
`

const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: 900;
  color: var(--text-primary);
  margin: 0 0 16px 0;
  font-family: var(--font-mono);
  text-transform: uppercase;
`

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-family: var(--font-mono);
  font-size: 14px;
`

const ActionButton = styled.button`
  background: var(--brutal-lime);
  border: 3px solid var(--border-primary);
  padding: 8px 16px;
  font-weight: 900;
  font-family: var(--font-mono);
  cursor: pointer;
  margin-top: 12px;
  
  &:hover {
    background: var(--brutal-cyan);
  }
`

interface DeFiDashboardProps {
  userAddress?: string
}

export function DeFiDashboard({ userAddress }: DeFiDashboardProps) {
  const [poolData, setPoolData] = useState<any>(null)
  const [farmData, setFarmData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDeFiData()
  }, [userAddress])

  const fetchDeFiData = async () => {
    try {
      const [poolResponse, farmResponse] = await Promise.all([
        fetch('/api/amm'),
        fetch(`/api/farming${userAddress ? `?address=${userAddress}` : ''}`)
      ])
      
      const poolData = await poolResponse.json()
      const farmData = await farmResponse.json()
      
      setPoolData(poolData.success ? poolData.data : poolData)
      setFarmData(farmData.success ? farmData.data : farmData)
    } catch (error) {
      console.error('Failed to fetch DeFi data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading DeFi data...</div>

  return (
    <DashboardContainer>
      <DeFiCard>
        <CardTitle>
          <FontAwesomeIcon icon={faRotate} style={{ marginRight: '8px' }} />
          ALGO/DEGEN Pool
        </CardTitle>
        <StatRow>
          <span>TVL:</span>
          <span>${poolData?.pool?.tvl?.toLocaleString()}</span>
        </StatRow>
        <StatRow>
          <span>Price:</span>
          <span>{poolData?.pool?.price?.toFixed(6)} DEGEN/ALGO</span>
        </StatRow>
        <StatRow>
          <span>APR:</span>
          <span>{poolData?.pool?.apr}%</span>
        </StatRow>
        <ActionButton>Add Liquidity</ActionButton>
      </DeFiCard>

      <DeFiCard>
        <CardTitle>
          <FontAwesomeIcon icon={faSeedling} style={{ marginRight: '8px' }} />
          Yield Farming
        </CardTitle>
        {farmData?.farms?.map((farm: any) => (
          <div key={farm.id}>
            <StatRow>
              <span>APR:</span>
              <span style={{ color: 'var(--brutal-lime)' }}>{farm.apr.toFixed(1)}%</span>
            </StatRow>
            <StatRow>
              <span>TVL:</span>
              <span>${farm.tvl?.toLocaleString()}</span>
            </StatRow>
          </div>
        ))}
        <ActionButton>Stake LP Tokens</ActionButton>
      </DeFiCard>

      <DeFiCard>
        <CardTitle>
          <FontAwesomeIcon icon={faShield} style={{ marginRight: '8px' }} />
          Battle Rewards
        </CardTitle>
        <StatRow>
          <span>Base Reward:</span>
          <span>50 DEGEN</span>
        </StatRow>
        <StatRow>
          <span>Staking Bonus:</span>
          <span style={{ color: 'var(--brutal-lime)' }}>+50%</span>
        </StatRow>
        <div style={{ fontSize: '12px', marginTop: '12px' }}>
          Stake LP tokens to boost battle rewards!
        </div>
      </DeFiCard>
    </DashboardContainer>
  )
}