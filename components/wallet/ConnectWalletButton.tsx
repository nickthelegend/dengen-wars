"use client"

import styled from "styled-components"
import { useAlgorandWallet } from "./AlgorandWalletProvider"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCoins, faRotate, faLink } from '@fortawesome/free-solid-svg-icons'

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

interface ConnectWalletButtonProps {
  variant?: "primary" | "secondary"
  children?: React.ReactNode
  className?: string
}

export function ConnectWalletButton({
  variant = "primary",
  children = "Connect Wallet",
  className
}: ConnectWalletButtonProps) {
  const { wallet, connectWallet, disconnectWallet, fetchBalance } = useAlgorandWallet()

  if (wallet.isConnected) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Balance Display */}
        <div style={{
          background: 'var(--brutal-cyan)',
          border: '3px solid var(--border-primary)',
          padding: '8px 12px',
          fontSize: '12px',
          fontWeight: '700',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-primary)',
          textAlign: 'center',
          boxShadow: '2px 2px 0px 0px var(--border-primary)'
        }}>
          <div>
            <FontAwesomeIcon icon={faCoins} style={{ marginRight: '4px' }} />
            {wallet.balance.toFixed(2)} ALGO
          </div>
          <div>
            <FontAwesomeIcon icon={faCoins} style={{ marginRight: '4px' }} />
            {wallet.degenBalance.toFixed(2)} DEGEN
          </div>
          <button
            onClick={() => wallet.address && fetchBalance(wallet.address)}
            style={{
              marginTop: '4px',
              padding: '2px 8px',
              fontSize: '10px',
              background: 'var(--brutal-yellow)',
              border: '2px solid var(--border-primary)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontWeight: '700'
            }}
          >
            <FontAwesomeIcon icon={faRotate} style={{ marginRight: '4px' }} />
            Refresh
          </button>
        </div>

        {/* Disconnect Button */}
        <ConnectButton $variant={variant} className={className} onClick={disconnectWallet}>
          <WalletIcon>
            <FontAwesomeIcon icon={faLink} />
          </WalletIcon>
          Disconnect
        </ConnectButton>
      </div>
    )
  }

  return (
    <ConnectButton 
      $variant={variant} 
      onClick={connectWallet} 
      disabled={wallet.connecting}
      className={className}
    >
      <WalletIcon>
        <FontAwesomeIcon icon={faLink} />
      </WalletIcon>
      {wallet.connecting ? "Connecting..." : children}
    </ConnectButton>
  )
}
