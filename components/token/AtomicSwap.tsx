'use client'

import { useState } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import algosdk from 'algosdk'
import styled from 'styled-components'
import { Button } from '../styled/GlobalStyles'
import { useAlgorandWallet } from '../wallet/AlgorandWalletProvider'

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

const PresetButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 16px;
`

const PresetButton = styled.button<{ $active?: boolean }>`
  padding: 8px 12px;
  border: 2px solid var(--border-primary);
  background: ${props => props.$active ? 'var(--brutal-cyan)' : 'var(--light-bg)'};
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--brutal-cyan);
    transform: translate(-1px, -1px);
  }

  &:active {
    transform: translate(0px, 0px);
  }
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

const InfoBox = styled.div`
  background: var(--brutal-cyan);
  border: 2px solid var(--border-primary);
  padding: 12px;
  margin-bottom: 16px;
  box-shadow: 2px 2px 0px 0px var(--border-primary);
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
  font-family: var(--font-mono);
  text-align: center;
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

export default function AtomicSwap() {
  const { activeAddress, signTransactions } = useWallet()
  const { fetchBalance } = useAlgorandWallet()
  const [algoAmount, setAlgoAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleAtomicSwap = async () => {
    if (!activeAddress || !algoAmount) return

    // Debug: Check wallet state
    console.log('=== WALLET DEBUG INFO ===')
    console.log('Wallet state:', {
      activeAddress,
      signTransactions: typeof signTransactions,
      algoAmount,
      walletConnected: !!activeAddress
    })

    // Validation: Check wallet connection
    if (!activeAddress) {
      throw new Error('Wallet not connected - please connect your wallet first')
    }
    if (!signTransactions) {
      throw new Error('Wallet signTransactions function not available')
    }

    setLoading(true)
    setResult(null)

    try {
      // Step 1: Call POST endpoint to create atomic swap
      const response = await fetch('/api/atomic-swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerAddress: activeAddress,
          algoAmount: parseFloat(algoAmount)
        })
      })

      const data = await response.json()

      console.log('API Response:', data)
      console.log('API Response data structure:', {
        hasData: !!data.data,
        hasTransactions: !!(data.data && data.data.transactions),
        hasSignedCreator: !!(data.data && data.data.signedCreatorTransaction),
        signedCreatorLength: data.data && data.data.signedCreatorTransaction ? data.data.signedCreatorTransaction.length : 0
      })

      if (!data.success) {
        throw new Error(data.error)
      }

      // Step 2: Handle transaction signing and submission
      let submitResponse: Response

      if (data.data.transactions) {
        // New format: Complete transaction group (3 transactions: opt-in, payment, transfer)
        const txnGroup = data.data.transactions.map((txnData: any) => {
          // Validate transaction data before creating Uint8Array
          if (!txnData.txn || !Array.isArray(txnData.txn) || txnData.txn.length === 0) {
            throw new Error('Invalid transaction data received from server')
          }
          return new Uint8Array(txnData.txn)
        })

        console.log('Transaction group to sign:', txnGroup.length, 'transactions')
        console.log('Transaction details:', txnGroup.map((txn: Uint8Array, i: number) => ({
          index: i,
          length: txn.length,
          type: 'Uint8Array'
        })))

        // Step 3: Pass complete transaction group to wallet
        console.log('=== SIGNING DEBUG ===')
        console.log('Calling signTransactions with:', txnGroup)
        console.log('Wallet activeAddress:', activeAddress)
        console.log('Wallet signTransactions function:', typeof signTransactions)
        console.log('Transaction group valid:', txnGroup.every((txn: Uint8Array) => txn instanceof Uint8Array && txn.length > 0))

        // Handle the case where wallet might return different number of transactions
        let signedUserTransactions: number[][] = []
        let signedCreatorTransaction: number[] = []
        let signedTxns: any = null

        // Pera wallet compatibility: Use only payment transaction
        console.log('=== USING PERA WALLET COMPATIBLE METHOD ===')
        const paymentTxn = txnGroup[1] // Payment transaction only
        console.log('Payment transaction to sign:', paymentTxn)
        console.log('About to call signTransactions...')
        
        try {
          console.log('Calling signTransactions with payment txn...')
          signedTxns = await signTransactions([paymentTxn])
          console.log('signTransactions completed successfully')
          console.log('=== DETAILED SIGNING RESPONSE ===')
          console.log('signTransactions returned:', signedTxns)
          console.log('Signed transactions type:', typeof signedTxns)
          console.log('Is array:', Array.isArray(signedTxns))
          console.log('Number of signed transactions:', signedTxns ? signedTxns.length : 0)

          if (signedTxns) {
            signedTxns.forEach((txn: any, i: number) => {
              console.log(`=== SIGNED TRANSACTION ${i} DETAILS ===`)
              console.log('Type:', typeof txn)
              console.log('Is Uint8Array:', txn instanceof Uint8Array)
              console.log('Is Array:', Array.isArray(txn))
              console.log('Length:', txn ? txn.length : 'null/undefined')
              console.log('Constructor:', txn ? txn.constructor.name : 'null')
              if (txn && txn.length > 0) {
                console.log('First 10 bytes:', Array.from(txn).slice(0, 10))
              }
            })
          } else {
            console.log('signTransactions returned null/undefined')
          }
        } catch (signError: any) {
          console.error('=== SIGNING ERROR CAUGHT ===')
          console.error('Error during signTransactions:', signError)
          console.error('Error details:', {
            message: signError.message,
            stack: signError.stack,
            name: signError.name
          })
          console.error('This error prevented any further processing')
          throw new Error(`Wallet signing failed: ${signError.message}`)
        }
        
        console.log('=== POST SIGNING ANALYSIS ===')
        console.log('signedTxns after signing:', signedTxns)
        console.log('signedTxns is array:', Array.isArray(signedTxns))
        console.log('signedTxns length:', signedTxns ? signedTxns.length : 'null/undefined')

        // Process single payment transaction result
        if (!signedTxns || !Array.isArray(signedTxns) || signedTxns.length === 0) {
          console.log('Payment transaction signing failed')
          throw new Error('Wallet failed to sign payment transaction')
        } else {
          console.log('=== PROCESSING PAYMENT TRANSACTION ===')
          signedUserTransactions = [Array.from(signedTxns[0])]
          signedCreatorTransaction = data.data.signedCreatorTransaction
          
          console.log('Payment signed successfully')
          console.log('User transaction length:', signedUserTransactions[0].length)
          console.log('Creator transaction length:', signedCreatorTransaction.length)
        }
        
        // Old fallback code (now unused)
        if (false) {
          console.log('Wallet signing failed or returned empty results, using fallback method')

          // Fallback: Use single transaction method (just payment, creator handles the rest)
          console.log('Using fallback: single transaction method')
          const unsignedTxn = txnGroup[1] // Use the payment transaction (index 1)
          console.log('Fallback transaction to sign:', unsignedTxn)

          try {
            const fallbackSignedTxns = await signTransactions([unsignedTxn])
            console.log('Fallback signing result:', fallbackSignedTxns)

            if (fallbackSignedTxns && fallbackSignedTxns[0]) {
              console.log('=== FALLBACK TRANSACTION DETAILS ===')
              console.log('Fallback txn type:', typeof fallbackSignedTxns[0])
              console.log('Fallback txn constructor:', fallbackSignedTxns[0].constructor.name)
              console.log('Fallback txn length:', fallbackSignedTxns[0].length)
              console.log('Fallback txn first 10 bytes:', Array.from(fallbackSignedTxns[0]).slice(0, 10))
              
              signedUserTransactions = [Array.from(fallbackSignedTxns[0])]

              // Extract signed creator transaction from API response
              if (data.data && data.data.signedCreatorTransaction) {
                // Validate creator transaction data
                if (!Array.isArray(data.data.signedCreatorTransaction) || data.data.signedCreatorTransaction.length === 0) {
                  throw new Error('Invalid creator transaction format from server')
                }
                signedCreatorTransaction = data.data.signedCreatorTransaction
                console.log('Fallback successful: single transaction signed')
                console.log('Creator transaction from API:', signedCreatorTransaction)
                console.log('Creator transaction type:', typeof signedCreatorTransaction)
                console.log('Creator transaction length:', signedCreatorTransaction.length)
              } else if (data.data && data.data.transactions && data.data.transactions[2]) {
                // Fallback: extract from transactions array (index 2 is creator transaction)
                const creatorTxnData = data.data.transactions[2].txn
                if (!Array.isArray(creatorTxnData) || creatorTxnData.length === 0) {
                  throw new Error('Invalid creator transaction in transactions array')
                }
                signedCreatorTransaction = creatorTxnData
                console.log('Fallback: extracted creator transaction from transactions array')
                console.log('Creator transaction from transactions:', signedCreatorTransaction)
              } else {
                console.error('No creator transaction found in API response')
                console.error('API response structure:', Object.keys(data.data || {}))
                throw new Error('Creator transaction not available in API response.')
              }

              console.log('Sending to backend:', {
                signedUserTransactions: signedUserTransactions.length,
                signedCreatorTransaction: signedCreatorTransaction ? signedCreatorTransaction.length : 0
              })

              if (!signedCreatorTransaction || signedCreatorTransaction.length === 0) {
                console.error('Creator transaction is empty!')
                throw new Error('Creator transaction not available. Please try again.')
              }
            } else {
              console.error('Fallback signing returned empty result')
              throw new Error('Wallet signing failed. Please try refreshing the page or using a different wallet.')
            }
          } catch (fallbackError: any) {
            console.error('Fallback signing failed:', fallbackError)
            throw new Error(`Wallet signing failed: ${fallbackError.message}`)
          }
        } else {
          // Normal processing for successful group signing
          if (signedTxns.length === 3 && signedTxns[0] && signedTxns[1] && signedTxns[2]) {
            // Full atomic group: opt-in, payment, creator
            signedUserTransactions = [
              Array.from(signedTxns[0]), // Opt-in
              Array.from(signedTxns[1])  // Payment
            ]
            signedCreatorTransaction = Array.from(signedTxns[2])
          } else if (signedTxns.length === 2 && signedTxns[0] && signedTxns[1]) {
            // Partial group: payment, creator (no opt-in needed)
            signedUserTransactions = [Array.from(signedTxns[0])] // Payment only
            signedCreatorTransaction = Array.from(signedTxns[1])
          } else if (signedTxns.length === 1 && signedTxns[0]) {
            // Only creator transaction (user didn't sign anything)
            signedUserTransactions = []
            signedCreatorTransaction = Array.from(signedTxns[0])
          }
        }

        console.log('=== FINAL TRANSACTION DATA TO SEND ===')
        console.log('signedUserTransactions length:', signedUserTransactions.length)
        signedUserTransactions.forEach((txn, i) => {
          console.log(`User txn ${i} - type:`, typeof txn, 'length:', txn.length, 'first 10:', txn.slice(0, 10))
        })
        console.log('signedCreatorTransaction type:', typeof signedCreatorTransaction)
        console.log('signedCreatorTransaction length:', signedCreatorTransaction.length)
        console.log('signedCreatorTransaction first 10:', signedCreatorTransaction.slice(0, 10))
        
        console.log('=== SENDING TO BACKEND ===')
        console.log('Payload signedUserTransaction:', signedUserTransactions)
        console.log('Payload signedCreatorTransaction:', signedCreatorTransaction)

        // Step 4: Send signed transactions to PUT endpoint
        submitResponse = await fetch('/api/atomic-swap', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            signedUserTransaction: signedUserTransactions,
            signedCreatorTransaction
          })
        })
      } else {
        // Fallback to old format for backward compatibility
        console.log('Using fallback transaction format')
        const unsignedTransactionBytes = new Uint8Array(data.data.unsignedTransaction)
        const unsignedTxn = algosdk.decodeUnsignedTransaction(unsignedTransactionBytes)
        console.log('Decoded unsigned transaction:', unsignedTxn)

        const signedTxns = await signTransactions([unsignedTxn])
        console.log('Signed transactions result:', signedTxns)

        const signedUserTransactions = signedTxns && signedTxns[0] ? [Array.from(signedTxns[0])] : []
        const signedCreatorTransaction = data.data.signedCreatorTransaction

        console.log('Fallback transaction data:', {
          signedUserTransactions,
          signedCreatorTransaction
        })

        // Step 4: Send signed transactions to PUT endpoint
        submitResponse = await fetch('/api/atomic-swap', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            signedUserTransaction: signedUserTransactions,
            signedCreatorTransaction
          })
        })
      }

      console.log('=== BACKEND RESPONSE ===')
      const submitResult = await submitResponse.json()
      console.log('Submit result:', submitResult)
      console.log('Submit response status:', submitResponse.status)
      
      if (submitResult.success) {
        setResult({
          success: true,
          txId: submitResult.data.txId,
          explorerUrl: submitResult.data.explorerUrl,
          degenAmount: parseFloat(algoAmount) * 100
        })
        setAlgoAmount('')

        // Refresh wallet balance after successful transaction
        if (activeAddress) {
          setTimeout(() => {
            fetchBalance(activeAddress)
          }, 2000) // Wait 2 seconds for transaction to be confirmed
        }
      } else {
        throw new Error(submitResult.error)
      }

    } catch (error: any) {
      console.error('Atomic swap failed:', error)
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const calculateDegenAmount = () => {
    if (!algoAmount) return 0
    return parseFloat(algoAmount) * 100
  }

  const handlePresetClick = (degenAmount: number) => {
    const requiredAlgo = degenAmount / 100 // Since 1 ALGO = 100 DEGEN
    setAlgoAmount(requiredAlgo.toString())
  }

  const presetOptions = [
    { degen: 10, algo: 0.1 },
    { degen: 25, algo: 0.25 },
    { degen: 50, algo: 0.5 }
  ]

  return (
    <SwapCard>
      <CardTitle>⚡ ATOMIC SWAP</CardTitle>
      
      <RateDisplay>
        <RateText>1 ALGO = 100 DEGEN</RateText>
      </RateDisplay>

      <InfoBox>
        🔄 Atomic Transaction - Instant & Safe!<br/>
        Both transactions execute together or both fail
      </InfoBox>

      <InputLabel>Quick Buy Options</InputLabel>
      <PresetButtons>
        {presetOptions.map((option) => (
          <PresetButton
            key={option.degen}
            $active={parseFloat(algoAmount) === option.algo}
            onClick={() => handlePresetClick(option.degen)}
          >
            {option.degen} DEGEN<br/>
            <small>{option.algo} ALGO</small>
          </PresetButton>
        ))}
      </PresetButtons>

      <InputLabel>Or Enter ALGO Amount</InputLabel>
      <Input
        type="number"
        placeholder="Enter ALGO amount"
        value={algoAmount}
        onChange={(e) => setAlgoAmount(e.target.value)}
        min="0.01"
        max="1"
        step="0.01"
      />

      {algoAmount && (
        <PreviewText>
          You will receive: {calculateDegenAmount().toLocaleString()} DEGEN
        </PreviewText>
      )}

      <Button 
        onClick={handleAtomicSwap}
        disabled={!activeAddress || !algoAmount || loading}
        style={{ width: '100%', fontSize: '16px' }}
      >
        {loading ? '🔄 SWAPPING...' : '⚡ ATOMIC SWAP'}
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
                ✅ Atomic swap successful!<br/>
                Received: {result.degenAmount.toLocaleString()} DEGEN
              </ResultText>
              <ExplorerLink 
                href={result.explorerUrl} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                View transaction on explorer
              </ExplorerLink>
            </>
          )}
        </ResultBox>
      )}
    </SwapCard>
  )
}