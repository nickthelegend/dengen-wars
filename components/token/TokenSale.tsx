'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import algosdk from 'algosdk'
import styled from 'styled-components'
import { Button } from '../styled/GlobalStyles'

const TokenSaleCard = styled.div`
  background: var(--brutal-yellow);
  border: 4px solid var(--border-primary);
  padding: 32px;
  box-shadow: 8px 8px 0px 0px var(--border-primary);
  max-width: 400px;
  width: 100%;
`

const CardTitle = styled.h2`
  font-size: 24px;
  font-weight: 900;
  color: var(--text-primary);
  margin: 0 0 20px 0;
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 2px;
  text-align: center;
`

const RateDisplay = styled.div`
  background: var(--light-bg);
  border: 3px solid var(--border-primary);
  padding: 12px;
  text-align: center;
  margin-bottom: 20px;
  box-shadow: 3px 3px 0px 0px var(--border-primary);
`

const RateText = styled.div`
  font-size: 16px;
  font-weight: 900;
  color: var(--text-primary);
  font-family: var(--font-mono);
`

const InfoText = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
  font-family: var(--font-mono);
  margin-bottom: 16px;
`

const InputLabel = styled.label`
  font-size: 14px;
  font-weight: 900;
  color: var(--text-primary);
  font-family: var(--font-mono);
  text-transform: uppercase;
  display: block;
  margin-bottom: 8px;
`

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 3px solid var(--border-primary);
  background: var(--light-bg);
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 16px;
  margin-bottom: 12px;
  box-shadow: 3px 3px 0px 0px var(--border-primary);
  
  &:focus {
    outline: none;
    background: var(--brutal-cyan);
  }
`

const PreviewText = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: var(--primary-green);
  font-family: var(--font-mono);
  margin-bottom: 20px;
  text-align: center;
`

const ConnectMessage = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: var(--brutal-red);
  font-family: var(--font-mono);
  text-align: center;
  margin-top: 16px;
`

const ResultBox = styled.div<{ $success?: boolean }>`
  background: ${props => props.$success ? 'var(--primary-green)' : 'var(--brutal-red)'};
  border: 3px solid var(--border-primary);
  padding: 16px;
  margin-top: 16px;
  box-shadow: 3px 3px 0px 0px var(--border-primary);
`

const ResultText = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  font-family: var(--font-mono);
`

const ExplorerLink = styled.a`
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
  font-family: var(--font-mono);
  text-decoration: underline;
  margin-top: 8px;
  display: block;
  
  &:hover {
    color: var(--brutal-cyan);
  }
`

interface TokenSaleInfo {
  assetId: number
  rate: number
  minPurchase: number
  maxPurchase: number
  availableTokens: number
  paymentAddress: string
  pricePerToken: number
}

export default function TokenSale() {
  const { activeAddress, signTransactions } = useWallet()
  const [saleInfo, setSaleInfo] = useState<TokenSaleInfo | null>(null)
  const [algoAmount, setAlgoAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    fetchSaleInfo()
  }, [])

  const fetchSaleInfo = async () => {
    try {
      const response = await fetch('/api/token-sales')
      const data = await response.json()
      if (data.success) {
        setSaleInfo(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch sale info:', error)
    }
  }

  const handlePurchase = async () => {
    if (!activeAddress || !saleInfo || !algoAmount) return

    setLoading(true)
    setResult(null)

    try {
      // Simplified approach: Just call the backend API
      // The backend will handle sending DEGEN tokens
      const response = await fetch('/api/token-sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerAddress: activeAddress,
          algoAmount: parseFloat(algoAmount)
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setResult(data.data)
        setAlgoAmount('')
        fetchSaleInfo() // Refresh available tokens
      } else {
        throw new Error(data.error)
      }

    } catch (error: any) {
      console.error('Purchase failed:', error)
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const calculateDegenAmount = () => {
    if (!algoAmount || !saleInfo) return 0
    return parseFloat(algoAmount) * saleInfo.rate
  }

  if (!saleInfo) {
    return (
      <TokenSaleCard>
        <CardTitle>Loading...</CardTitle>
      </TokenSaleCard>
    )
  }

  return (
    <TokenSaleCard>
      <CardTitle>🪙 BUY DEGEN TOKENS</CardTitle>
      
      <RateDisplay>
        <RateText>1 ALGO = {saleInfo.rate.toLocaleString()} DEGEN</RateText>
      </RateDisplay>

      <InfoText>
        Available: {saleInfo.availableTokens.toLocaleString()} DEGEN<br/>
        Min: {saleInfo.minPurchase} ALGO | Max: {saleInfo.maxPurchase} ALGO
      </InfoText>
      
      <div style={{
        background: 'var(--brutal-cyan)',
        border: '3px solid var(--border-primary)',
        padding: '12px',
        marginBottom: '16px',
        boxShadow: '3px 3px 0px 0px var(--border-primary)',
        wordBreak: 'break-all'
      }}>
        <div style={{ fontSize: '12px', fontWeight: '900', marginBottom: '4px', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
          💳 PAYMENT ADDRESS:
        </div>
        <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
          {saleInfo.paymentAddress}
        </div>
      </div>

      <InputLabel>ALGO Amount</InputLabel>
      <Input
        type="number"
        placeholder="Enter ALGO amount"
        value={algoAmount}
        onChange={(e) => setAlgoAmount(e.target.value)}
        min={saleInfo.minPurchase}
        max={saleInfo.maxPurchase}
        step="0.1"
      />

      {algoAmount && (
        <PreviewText>
          You will receive: {calculateDegenAmount().toLocaleString()} DEGEN
        </PreviewText>
      )}

      <div style={{ 
        marginBottom: '16px', 
        fontSize: '12px', 
        color: 'var(--text-primary)', 
        fontFamily: 'var(--font-mono)',
        background: 'var(--brutal-pink)',
        border: '2px solid var(--border-primary)',
        padding: '12px',
        boxShadow: '2px 2px 0px 0px var(--border-primary)'
      }}>
        <strong>📋 INSTRUCTIONS:</strong><br/>
        1. Send {algoAmount || 'X'} ALGO to payment address above<br/>
        2. Click "Request DEGEN" button below<br/>
        3. DEGEN tokens will be sent to your wallet<br/>
        <strong>⚠️ Send ALGO first, then click button!</strong>
      </div>

      <Button 
        onClick={handlePurchase}
        disabled={!activeAddress || !algoAmount || loading}
        style={{ width: '100%', fontSize: '16px' }}
      >
        {loading ? '🔄 PROCESSING...' : '🚀 REQUEST DEGEN TOKENS'}
      </Button>

      {!activeAddress && (
        <ConnectMessage>
          Connect your wallet to buy tokens
        </ConnectMessage>
      )}

      {result && (
        <ResultBox $success={!result.error}>
          {result.error ? (
            <ResultText>Error: {result.error}</ResultText>
          ) : (
            <>
              <ResultText>
                ✅ Purchase successful!<br/>
                Received: {result.degenAmount.toLocaleString()} DEGEN
              </ResultText>
              <ExplorerLink 
                href={result.explorerUrl} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                View transaction
              </ExplorerLink>
            </>
          )}
        </ResultBox>
      )}
    </TokenSaleCard>
  )
}