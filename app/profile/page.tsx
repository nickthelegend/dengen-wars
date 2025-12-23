'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { AppLayout } from '../../components/layout/AppLayout'
import styled from 'styled-components'
import { Button } from '../../components/styled/GlobalStyles'
import { useRouter } from 'next/navigation'

const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`

const ProfileHeader = styled.div`
  background: var(--brutal-lime);
  border: 4px solid var(--border-primary);
  padding: 32px;
  text-align: center;
  box-shadow: 8px 8px 0px 0px var(--border-primary);
`

const ProfileTitle = styled.h1`
  font-size: 32px;
  font-weight: 900;
  color: var(--text-primary);
  margin: 0 0 16px 0;
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 2px;
`

const WalletAddress = styled.p`
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  font-family: var(--font-mono);
  background: var(--light-bg);
  padding: 8px 16px;
  border: 2px solid var(--border-primary);
  display: inline-block;
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
`

const StatCard = styled.div`
  background: var(--light-bg);
  border: 4px solid var(--border-primary);
  padding: 24px;
  text-align: center;
  box-shadow: 6px 6px 0px 0px var(--border-primary);
`

const StatValue = styled.div`
  font-size: 36px;
  font-weight: 900;
  color: var(--brutal-red);
  font-family: var(--font-mono);
  margin-bottom: 8px;
`

const StatLabel = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 1px;
`

const TokenSection = styled.div`
  background: var(--brutal-cyan);
  border: 4px solid var(--border-primary);
  padding: 24px;
  box-shadow: 6px 6px 0px 0px var(--border-primary);
`

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 900;
  color: var(--text-primary);
  margin: 0 0 20px 0;
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 2px;
`

const TokenGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
`

const TokenCard = styled.div`
  background: var(--light-bg);
  border: 3px solid var(--border-primary);
  padding: 16px;
  text-align: center;
  box-shadow: 4px 4px 0px 0px var(--border-primary);
`

const TokenSymbol = styled.div`
  font-size: 18px;
  font-weight: 900;
  color: var(--brutal-yellow);
  font-family: var(--font-mono);
  margin-bottom: 8px;
`

const TokenBalance = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  font-family: var(--font-mono);
`

export default function ProfilePage() {
  const { activeAccount } = useWallet()
  const router = useRouter()
  const [balances, setBalances] = useState({ algo: 0, degen: 0 })
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    if (activeAccount?.address) {
      fetchBalances()
      // Refresh balances every 10 seconds
      const interval = setInterval(fetchBalances, 10000)
      return () => clearInterval(interval)
    }
  }, [activeAccount])

  // Refresh balances when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && activeAccount?.address) {
        fetchBalances()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [activeAccount])

  const fetchBalances = async () => {
    if (!activeAccount?.address) return
    
    try {
      const response = await fetch(`/api/user-balance?address=${activeAccount.address}`)
      const data = await response.json()
      
      if (data.success) {
        setBalances({
          algo: data.data.algoBalance,
          degen: data.data.degenBalance
        })
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Failed to fetch balances:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!activeAccount?.address) {
    return (
      <AppLayout>
        <ProfileContainer>
          <ProfileHeader>
            <ProfileTitle>🔗 CONNECT WALLET</ProfileTitle>
            <p style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              Please connect your wallet to view profile
            </p>
            <Button onClick={() => router.push('/')}>Go Home</Button>
          </ProfileHeader>
        </ProfileContainer>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <ProfileContainer>
        <ProfileHeader>
          <ProfileTitle>👤 PLAYER PROFILE</ProfileTitle>
          <WalletAddress>
            {activeAccount.address.slice(0, 8)}...{activeAccount.address.slice(-8)}
          </WalletAddress>
        </ProfileHeader>

        <TokenSection>
          <SectionTitle>💰 Token Balances</SectionTitle>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-primary)' }}>
              🔄 Loading balances...
            </div>
          ) : (
            <TokenGrid>
              <TokenCard>
                <TokenSymbol>ALGO</TokenSymbol>
                <TokenBalance>{balances.algo.toFixed(4)}</TokenBalance>
                <div style={{ fontSize: '12px', color: 'var(--text-primary)', marginTop: '4px' }}>
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </TokenCard>
              <TokenCard>
                <TokenSymbol>DEGEN</TokenSymbol>
                <TokenBalance>{balances.degen.toFixed(2)}</TokenBalance>
                <div style={{ fontSize: '12px', color: 'var(--text-primary)', marginTop: '4px' }}>
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </TokenCard>
            </TokenGrid>
          )}
        </TokenSection>

        <StatsGrid>
          <StatCard>
            <StatValue>0</StatValue>
            <StatLabel>Wins</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>0</StatValue>
            <StatLabel>Losses</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>0</StatValue>
            <StatLabel>Total Battles</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>0</StatValue>
            <StatLabel>Win Streak</StatLabel>
          </StatCard>
        </StatsGrid>

        <TokenSection>
          <SectionTitle>⚡ Quick Actions</SectionTitle>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <Button onClick={() => router.push('/buy-tokens')}>
              🪙 Buy DEGEN
            </Button>
            <Button onClick={() => router.push('/battle')}>
              ⚔️ Battle
            </Button>
            <Button onClick={() => router.push('/defi')}>
              💱 DeFi
            </Button>
          </div>
          <Button 
            onClick={fetchBalances}
            style={{ background: 'var(--brutal-orange)', fontSize: '14px' }}
          >
            🔄 Refresh Balances
          </Button>
        </TokenSection>
      </ProfileContainer>
    </AppLayout>
  )
}