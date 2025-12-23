"use client"

import { useState, useEffect } from "react"
import styled from "styled-components"
import { Button } from "../styled/GlobalStyles"
import { useWallet } from "@txnlab/use-wallet-react"
import { useRouter } from "next/navigation"
import { algodClient } from "../../lib/algorand-config"
import { SimpleConnectButton } from "../wallet/SimpleConnectButton"
import Image from "next/image"

const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: var(--light-bg);
  border-bottom: 4px solid var(--border-primary);
  position: sticky;
  top: 0;
  z-index: 100;
  font-family: var(--font-mono);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 12px;
    border-bottom-width: 3px;
    flex-wrap: wrap;
    gap: 8px;
  }

  @media (max-width: 480px) {
    padding: 10px 8px;
    border-bottom-width: 2px;
    gap: 6px;
  }
`

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  
  @media (max-width: 768px) {
    gap: 8px;
  }
`

const BalanceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--brutal-lime);
  border: 3px solid var(--border-primary);
  border-radius: 0;
  padding: 8px 12px;
  box-shadow: 3px 3px 0px 0px var(--border-primary);
  font-weight: 900;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.1s ease;
  
  &:hover {
    transform: translate(1px, 1px);
    box-shadow: 2px 2px 0px 0px var(--border-primary);
  }
  
  @media (max-width: 768px) {
    border-width: 2px;
    padding: 6px 10px;
    box-shadow: 2px 2px 0px 0px var(--border-primary);
    font-size: 12px;
    
    &:hover {
      transform: none;
      box-shadow: 2px 2px 0px 0px var(--border-primary);
    }
  }
  
  @media (max-width: 480px) {
    padding: 4px 8px;
    font-size: 11px;
    gap: 6px;
  }
`

const TokenIcon = styled.div`
  width: 24px;
  height: 24px;
  background: var(--brutal-yellow);
  border: 2px solid var(--border-primary);
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 900;
  font-family: var(--font-mono);
  
  @media (max-width: 768px) {
    width: 20px;
    height: 20px;
    font-size: 10px;
    border-width: 1px;
  }
  
  @media (max-width: 480px) {
    width: 18px;
    height: 18px;
    font-size: 9px;
  }
`

const Balance = styled.span`
  font-weight: 900;
  color: var(--text-primary);
  font-family: var(--font-mono);
  
  @media (max-width: 480px) {
    font-size: 12px;
  }
`

const AddButton = styled.button`
  width: 24px;
  height: 24px;
  border-radius: 0;
  background: var(--brutal-yellow);
  border: 2px solid var(--border-primary);
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 900;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  transition: all 0.1s ease;
  
  &:hover {
    background: var(--brutal-cyan);
    transform: translate(1px, 1px);
  }
  
  @media (max-width: 768px) {
    width: 20px;
    height: 20px;
    font-size: 14px;
    border-width: 1px;
  }
  
  @media (max-width: 480px) {
    width: 18px;
    height: 18px;
    font-size: 12px;
  }
`

const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`

const PopupContent = styled.div`
  background: var(--light-bg);
  border: 4px solid var(--border-primary);
  box-shadow: 8px 8px 0px 0px var(--border-primary);
  padding: 32px;
  max-width: 400px;
  width: 90%;
  font-family: var(--font-mono);
  
  @media (max-width: 768px) {
    border-width: 3px;
    box-shadow: 4px 4px 0px 0px var(--border-primary);
    padding: 24px;
  }
  
  @media (max-width: 480px) {
    border-width: 2px;
    box-shadow: 2px 2px 0px 0px var(--border-primary);
    padding: 20px;
  }
`

const PopupTitle = styled.h2`
  font-size: 24px;
  font-weight: 900;
  color: var(--text-primary);
  margin: 0 0 16px 0;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 20px;
    margin-bottom: 12px;
  }
  
  @media (max-width: 480px) {
    font-size: 18px;
    margin-bottom: 10px;
  }
`

const PopupText = styled.p`
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 24px 0;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 13px;
    margin-bottom: 20px;
  }
  
  @media (max-width: 480px) {
    font-size: 12px;
    margin-bottom: 16px;
  }
`

const PopupButtons = styled.div`
  display: flex;
  gap: 12px;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 8px;
  }
`

const PopupButton = styled(Button)`
  flex: 1;
  font-size: 14px;
  padding: 12px;
  text-transform: uppercase;
  
  @media (max-width: 768px) {
    font-size: 13px;
    padding: 10px;
  }
  
  @media (max-width: 480px) {
    font-size: 12px;
    padding: 8px;
  }
`



const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    gap: 8px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  @media (max-width: 480px) {
    gap: 6px;
    width: 100%;
    justify-content: space-between;
  }
`

const ProfileButton = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--brutal-cyan);
  border: 3px solid var(--border-primary);
  border-radius: 0;
  padding: 8px 12px;
  font-size: 12px;
  color: var(--text-primary);
  cursor: pointer;
  font-family: var(--font-mono);
  font-weight: 900;
  text-transform: uppercase;
  box-shadow: 2px 2px 0px 0px var(--border-primary);
  transition: all 0.1s ease;
  white-space: nowrap;
  
  &:hover {
    background: var(--brutal-lime);
    transform: translate(1px, 1px);
    box-shadow: 1px 1px 0px 0px var(--border-primary);
  }
  
  @media (max-width: 768px) {
    border-width: 2px;
    padding: 6px 10px;
    font-size: 11px;
    box-shadow: 2px 2px 0px 0px var(--border-primary);
    
    &:hover {
      transform: none;
      box-shadow: 2px 2px 0px 0px var(--border-primary);
    }
  }
  
  @media (max-width: 480px) {
    padding: 4px 8px;
    font-size: 10px;
    gap: 4px;
  }
`

const NetworkIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--brutal-violet);
  border: 2px solid var(--border-primary);
  border-radius: 0;
  padding: 6px 10px;
  font-size: 10px;
  color: var(--text-primary);
  cursor: pointer;
  font-family: var(--font-mono);
  font-weight: 900;
  text-transform: uppercase;
  box-shadow: 2px 2px 0px 0px var(--border-primary);
  transition: all 0.1s ease;
  
  &:hover {
    background: var(--brutal-pink);
    transform: translate(1px, 1px);
    box-shadow: 1px 1px 0px 0px var(--border-primary);
  }
  
  @media (max-width: 768px) {
    border-width: 1px;
    padding: 4px 8px;
    font-size: 9px;
    box-shadow: 1px 1px 0px 0px var(--border-primary);
    
    &:hover {
      transform: none;
      box-shadow: 1px 1px 0px 0px var(--border-primary);
    }
  }
`

const NetworkDot = styled.div<{ $network: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${(props) => {
    switch (props.$network) {
      case "algorand":
        return "#007BFF"
      case "algorandTestnet":
        return "#17A2B8"
      default:
        return "#6B7280"
    }
  }};

  @media (max-width: 768px) {
    width: 6px;
    height: 6px;
  }
`


export function Header() {
  const { activeAccount } = useWallet()
  const router = useRouter()
  const [showWamPopup, setShowWamPopup] = useState(false)
  const [degenBalance, setDegenBalance] = useState('0')
  const [isDark, setIsDark] = useState(false)
  const DEGEN_ASA_ID = parseInt(process.env.DEGEN_ASSET_ID || '745007115')

  const handleWamClick = () => {
    router.push('/buy-tokens')
  }

  const handleGoToDeposit = () => {
    setShowWamPopup(false)
    router.push('/profile')
  }

  const handleProfileClick = () => {
    router.push('/profile')
  }

  const handleNetworkSwitch = () => {
    // Algorand doesn't need network switching like EVM chains
  }

  const toggleTheme = () => {
    setIsDark(!isDark)
  }

  const fetchDegenBalance = async () => {
    if (!activeAccount?.address) return

    try {
      const response = await fetch(`/api/user-degen-balance?walletAddress=${activeAccount.address}`)
      const data = await response.json()

      if (data.success) {
        const balance = Number(data.data.degenBalance || 0)
        setDegenBalance(balance.toFixed(2))
      } else {
        setDegenBalance('0')
      }
    } catch (error) {
      console.error('Error fetching DEGEN balance:', error)
      setDegenBalance('0')
    }
  }

  useEffect(() => {
    fetchDegenBalance()
  }, [activeAccount?.address])

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  const getNetworkName = () => {
    return "ALGO" // Algorand network
  }

  return (
    <>
      {showWamPopup && (
        <PopupOverlay onClick={() => setShowWamPopup(false)}>
          <PopupContent onClick={(e) => e.stopPropagation()}>
            <PopupTitle>💰 BUY $DEGEN</PopupTitle>
            <PopupText>
              Get more $DEGEN tokens to create beasts and battle other trainers!
            </PopupText>
            <PopupButtons>
              <PopupButton onClick={() => setShowWamPopup(false)}>
                Cancel
              </PopupButton>
              <PopupButton onClick={handleGoToDeposit}>
                Go to Deposit
              </PopupButton>
            </PopupButtons>
          </PopupContent>
        </PopupOverlay>
      )}
    
    <HeaderContainer>
      <LeftSection>
      </LeftSection>

      <RightSection>
        {activeAccount?.address && (
          <BalanceContainer onClick={handleWamClick}>
            <TokenIcon>$D</TokenIcon>
            <Balance>{degenBalance}</Balance>
            <AddButton onClick={(e) => { e.stopPropagation(); router.push('/buy-tokens'); }}>+</AddButton>
          </BalanceContainer>
        )}
        <SimpleConnectButton />
      </RightSection>
    </HeaderContainer>
    
    </>
  )
}
