"use client"

import { useState } from "react"
import styled from "styled-components"
import { Button } from "../styled/GlobalStyles"
import { brutalToast } from "../ui/BrutalToast"

interface DegenSwapProps {
  isOpen: boolean
  onClose: () => void
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
`

const ModalContent = styled.div`
  background: var(--light-bg);
  border: 4px solid var(--border-primary);
  box-shadow: 8px 8px 0px 0px var(--border-primary);
  padding: 32px;
  max-width: 500px;
  width: 90%;
  font-family: var(--font-mono);
  position: relative;
`

const ModalTitle = styled.h2`
  font-size: 28px;
  font-weight: 900;
  color: var(--text-primary);
  margin: 0 0 24px 0;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-align: center;
`

const SwapContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
`

const SwapBox = styled.div`
  background: var(--brutal-cyan);
  border: 3px solid var(--border-primary);
  padding: 20px;
  box-shadow: 4px 4px 0px 0px var(--border-primary);
`

const SwapLabel = styled.div`
  font-size: 14px;
  font-weight: 900;
  color: var(--text-primary);
  margin-bottom: 12px;
  text-transform: uppercase;
`

const SwapInput = styled.input`
  width: 100%;
  padding: 16px;
  border: 3px solid var(--border-primary);
  background: var(--light-bg);
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-weight: 900;
  font-size: 18px;
  text-align: center;
  
  &:focus {
    outline: none;
    background: var(--brutal-yellow);
  }
`

const SwapArrow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 32px;
  color: var(--text-primary);
  margin: 8px 0;
`

const RateDisplay = styled.div`
  background: var(--brutal-yellow);
  border: 3px solid var(--border-primary);
  padding: 16px;
  text-align: center;
  font-weight: 900;
  color: var(--text-primary);
  margin-bottom: 20px;
  box-shadow: 3px 3px 0px 0px var(--border-primary);
`

const SwapButton = styled(Button)`
  width: 100%;
  background: var(--brutal-orange);
  font-size: 18px;
  padding: 16px;
  margin-bottom: 16px;
  
  &:hover {
    background: var(--brutal-red);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: var(--brutal-red);
  border: 2px solid var(--border-primary);
  color: var(--text-primary);
  width: 32px;
  height: 32px;
  cursor: pointer;
  font-weight: 900;
  font-size: 16px;
  
  &:hover {
    background: var(--brutal-pink);
  }
`

export function DegenSwap({ isOpen, onClose }: DegenSwapProps) {
  const [algoAmount, setAlgoAmount] = useState('')
  const [degenAmount, setDegenAmount] = useState('')
  const [isSwapping, setIsSwapping] = useState(false)

  const EXCHANGE_RATE = 1000 // 1 ALGO = 1000 DEGEN

  const handleAlgoChange = (value: string) => {
    setAlgoAmount(value)
    const algo = parseFloat(value) || 0
    setDegenAmount((algo * EXCHANGE_RATE).toString())
  }

  const handleSwap = async () => {
    if (!algoAmount || parseFloat(algoAmount) <= 0) {
      brutalToast.error("Enter a valid ALGO amount")
      return
    }

    setIsSwapping(true)
    
    try {
      // Simulate swap transaction
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      brutalToast.success(`Swapped ${algoAmount} ALGO for ${degenAmount} DEGEN!`)
      setAlgoAmount('')
      setDegenAmount('')
      onClose()
    } catch (error) {
      brutalToast.error("Swap failed. Please try again.")
    } finally {
      setIsSwapping(false)
    }
  }

  if (!isOpen) return null

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>×</CloseButton>
        <ModalTitle>🪙 DEGEN SWAP</ModalTitle>
        
        <SwapContainer>
          <SwapBox>
            <SwapLabel>From: ALGO</SwapLabel>
            <SwapInput
              type="number"
              placeholder="0.0"
              value={algoAmount}
              onChange={(e) => handleAlgoChange(e.target.value)}
            />
          </SwapBox>
          
          <SwapArrow>⬇️</SwapArrow>
          
          <SwapBox style={{ background: 'var(--brutal-lime)' }}>
            <SwapLabel>To: $DEGEN</SwapLabel>
            <SwapInput
              type="text"
              placeholder="0.0"
              value={degenAmount}
              readOnly
              style={{ background: 'var(--brutal-yellow)' }}
            />
          </SwapBox>
        </SwapContainer>

        <RateDisplay>
          📈 Rate: 1 ALGO = {EXCHANGE_RATE.toLocaleString()} DEGEN
        </RateDisplay>

        <SwapButton 
          onClick={handleSwap}
          disabled={!algoAmount || parseFloat(algoAmount) <= 0 || isSwapping}
        >
          {isSwapping ? '⏳ SWAPPING...' : '🔄 SWAP NOW'}
        </SwapButton>
      </ModalContent>
    </ModalOverlay>
  )
}