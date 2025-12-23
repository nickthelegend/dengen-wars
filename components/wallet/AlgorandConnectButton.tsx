"use client"

import styled from "styled-components"
import { useWallet } from "@txnlab/use-wallet-react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLink } from '@fortawesome/free-solid-svg-icons'

const ConnectButton = styled.button<{ $variant?: "primary" | "secondary" }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 0;
  border: 4px solid var(--border-primary);
  background: ${props => props.$variant === "secondary" ? "var(--brutal-orange)" : "var(--brutal-violet)"};
  color: var(--text-primary);
  font-weight: 900;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  font-family: var(--font-mono);
  transition: all 0.1s ease;
  box-shadow: 3px 3px 0px 0px var(--border-primary);
  
  &:hover:not(:disabled) {
    background: var(--brutal-pink);
    transform: translate(2px, 2px);
    box-shadow: 1px 1px 0px 0px var(--border-primary);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`

const WalletIcon = styled.span`
  font-size: 16px;
`

interface AlgorandConnectButtonProps {
  variant?: "primary" | "secondary"
  children?: React.ReactNode
  className?: string
}

export function AlgorandConnectButton({ 
  variant = "primary", 
  children = "Connect Wallet",
  className 
}: AlgorandConnectButtonProps) {
  const { activeAccount, wallets } = useWallet()

  const handleConnect = async () => {
    const availableWallet = wallets.find(w => !w.isConnected)
    if (availableWallet) {
      await availableWallet.connect()
    }
  }

  const handleDisconnect = async () => {
    const connectedWallet = wallets.find(w => w.isConnected)
    if (connectedWallet) {
      await connectedWallet.disconnect()
    }
  }

  if (activeAccount?.address) {
    return (
      <ConnectButton $variant={variant} className={className} onClick={handleDisconnect}>
        <WalletIcon>
          <FontAwesomeIcon icon={faLink} />
        </WalletIcon>
        Disconnect
      </ConnectButton>
    )
  }

  return (
    <ConnectButton 
      $variant={variant} 
      onClick={handleConnect}
      className={className}
    >
      <WalletIcon>
        <FontAwesomeIcon icon={faLink} />
      </WalletIcon>
      {children}
    </ConnectButton>
  )
}