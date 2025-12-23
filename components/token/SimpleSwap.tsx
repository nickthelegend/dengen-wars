'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import styled from 'styled-components'
import { Button } from '../styled/GlobalStyles'
import { LoadingSpinner } from '../ui/LoadingSpinner'

const SwapCard = styled.div`
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

const PaymentAddress = styled.div`
  background: var(--brutal-cyan);
  border: 3px solid var(--border-primary);
  padding: 12px;
  margin-bottom: 16px;
  box-shadow: 3px 3px 0px 0px var(--border-primary);
  word-break: break-all;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-primary);
  font-family: var(--font-mono);
`

const Instructions = styled.div`
  background: var(--brutal-pink);
  border: 2px solid var(--border-primary);
  padding: 12px;
  margin-bottom: 16px;
  box-shadow: 2px 2px 0px 0px var(--border-primary);
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
  font-family: var(--font-mono);
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

interface SaleInfo {
  paymentAddress: string
  rate: number
  availableTokens: number
}

export default function SimpleSwap() {
  const { activeAddress } = useWallet()
  const [algoAmount, setAlgoAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [saleInfo, setSaleInfo] = useState<SaleInfo | null>(null)

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

  const handleSwap = async () => {
    if (!activeAddress || !algoAmount) return

    setLoading(true)
    setResult(null)

    try {
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
        fetchSaleInfo()
      } else {
        throw new Error(data.error)
      }

    } catch (error: any) {
      console.error('Swap failed:', error)
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
      <SwapCard>
        <CardTitle>Loading...</CardTitle>
      </SwapCard>
    )
  }

  return (
    <SwapCard>
      <CardTitle>🪙 DEGEN SWAP</CardTitle>
      
      <RateDisplay>
        <RateText>1 ALGO = {saleInfo.rate.toLocaleString()} DEGEN</RateText>
      </RateDisplay>

      <div style={{ fontSize: '12px', marginBottom: '16px', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
        Available: {saleInfo.availableTokens.toLocaleString()} DEGEN
      </div>

      <div style={{ fontSize: '12px', fontWeight: '900', marginBottom: '4px', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
        💳 PAYMENT ADDRESS:
      </div>
      <PaymentAddress>
        {saleInfo.paymentAddress}
      </PaymentAddress>

      <InputLabel>ALGO Amount</InputLabel>
      <Input
        type="number"
        placeholder="Enter ALGO amount"
        value={algoAmount}
        onChange={(e) => setAlgoAmount(e.target.value)}
        min="0.1"
        max="100"
        step="0.1"
      />

      {algoAmount && (
        <PreviewText>
          You will receive: {calculateDegenAmount().toLocaleString()} DEGEN
        </PreviewText>
      )}

      <Instructions>
        <strong>📋 INSTRUCTIONS:</strong><br/>
        1. Send {algoAmount || 'X'} ALGO to payment address above<br/>
        2. Click "Request DEGEN" button below<br/>
        3. DEGEN tokens will be sent to your wallet<br/>
        <strong>⚠️ Send ALGO first, then click button!</strong>
      </Instructions>

      <Button
        onClick={handleSwap}
        disabled={!activeAddress || !algoAmount || loading}
        style={{
          width: '100%',
          fontSize: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
      >
        {loading ? (
          <>
            <LoadingSpinner size="small" />
            Processing...
          </>
        ) : (
          '🚀 REQUEST DEGEN TOKENS'
        )}
      </Button>

      {!activeAddress && (
        <div style={{ 
          fontSize: '14px', 
          fontWeight: '700', 
          color: 'var(--brutal-red)', 
          fontFamily: 'var(--font-mono)', 
          textAlign: 'center', 
          marginTop: '16px' 
        }}>
          Connect your wallet to swap
        </div>
      )}

      {result && (
        <ResultBox $success={!result.error}>
          {result.error ? (
            <ResultText>❌ Error: {result.error}</ResultText>
          ) : (
            <>
              <ResultText>
                ✅ Swap successful!<br/>
                Received: {result.degenAmount.toLocaleString()} DEGEN
              </ResultText>
              <a 
                href={result.explorerUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  fontSize: '12px', 
                  fontWeight: '700', 
                  color: 'var(--text-primary)', 
                  fontFamily: 'var(--font-mono)', 
                  textDecoration: 'underline',
                  marginTop: '8px',
                  display: 'block'
                }}
              >
                View transaction
              </a>
            </>
          )}
        </ResultBox>
      )}
    </SwapCard>
  )
}