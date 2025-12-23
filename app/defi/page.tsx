"use client"

import { useWallet } from '@txnlab/use-wallet-react'
import { AppLayout } from '../../components/layout/AppLayout'
import { DeFiDashboard } from '../../components/defi/DeFiDashboard'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCoins } from '@fortawesome/free-solid-svg-icons'

const DeFiContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`

const DeFiHeader = styled.div`
  text-align: center;
  background: linear-gradient(135deg, var(--brutal-lime) 0%, var(--brutal-cyan) 100%);
  padding: 32px;
  border: 4px solid var(--border-primary);
  box-shadow: 8px 8px 0px 0px var(--border-primary);
`

const DeFiTitle = styled.h1`
  font-size: 40px;
  font-weight: 900;
  color: var(--text-primary);
  margin: 0 0 16px 0;
  text-transform: uppercase;
  font-family: var(--font-mono);
`

export default function DeFiPage() {
  const { activeAccount } = useWallet()

  return (
    <AppLayout>
      <DeFiContainer>
        <DeFiHeader>
          <DeFiTitle>
            <FontAwesomeIcon icon={faCoins} style={{ marginRight: '8px' }} />
            DeFi Hub
          </DeFiTitle>
        </DeFiHeader>
        <DeFiDashboard userAddress={activeAccount?.address} />
      </DeFiContainer>
    </AppLayout>
  )
}