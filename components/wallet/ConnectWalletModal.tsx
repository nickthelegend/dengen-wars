"use client"

import { type Wallet, useWallet } from "@txnlab/use-wallet-react"
import { createPortal } from "react-dom"
import styled from "styled-components"
import { brutalToast } from "../ui/BrutalToast"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLink } from '@fortawesome/free-solid-svg-icons'

interface ConnectWalletModalProps {
  wallets: Wallet[]
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
  z-index: 999999;
  backdrop-filter: blur(4px);
`

const ModalContent = styled.div`
  background: var(--light-bg);
  border: 4px solid var(--border-primary);
  box-shadow: 8px 8px 0px 0px var(--border-primary);
  padding: 32px;
  max-width: 400px;
  width: 90%;
  font-family: var(--font-mono);
  position: relative;
  z-index: 1000000;
`

const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 900;
  color: var(--text-primary);
  margin: 0 0 24px 0;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-align: center;
`

const WalletList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
`

const WalletButton = styled.div<{ $connected?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: ${props => props.$connected ? 'var(--brutal-lime)' : 'var(--light-bg)'};
  border: 3px solid var(--border-primary);
  cursor: pointer;
  font-family: var(--font-mono);
  font-weight: 900;
  text-transform: uppercase;
  box-shadow: 3px 3px 0px 0px var(--border-primary);
  transition: all 0.1s ease;
  
  &:hover {
    background: var(--brutal-cyan);
    transform: translate(1px, 1px);
    box-shadow: 2px 2px 0px 0px var(--border-primary);
  }
`

const WalletIcon = styled.img`
  width: 24px;
  height: 24px;
`

const DisconnectButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  background: var(--brutal-red);
  border: 3px solid var(--border-primary);
  cursor: pointer;
  font-family: var(--font-mono);
  font-weight: 900;
  text-transform: uppercase;
  color: var(--text-primary);
  box-shadow: 3px 3px 0px 0px var(--border-primary);
  transition: all 0.1s ease;
  margin-top: 12px;
  
  &:hover {
    background: var(--brutal-pink);
    transform: translate(1px, 1px);
    box-shadow: 2px 2px 0px 0px var(--border-primary);
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

const ConnectWalletModal = ({
  wallets,
  isOpen,
  onClose,
}: ConnectWalletModalProps) => {
  const { activeAccount } = useWallet()

  if (!isOpen) return null

  const handleWalletClick = async (wallet: Wallet) => {
    try {
      if (wallet.isConnected) {
        await wallet.setActive()
        brutalToast.success("Wallet set as active")
      } else {
        await wallet.connect()
        brutalToast.success("Wallet connected successfully")
      }
      onClose()
    } catch (error) {
      console.error(error)
      brutalToast.error("Failed to connect wallet")
    }
  }

  const disconnectWallets = async () => {
    try {
      for (const wallet of wallets) {
        if (wallet.isConnected) {
          await wallet.disconnect()
        }
      }
      brutalToast.success("Disconnected from all wallets")
      onClose()
    } catch (error) {
      console.error(error)
      brutalToast.error("Failed to disconnect wallets")
    }
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
        <CloseButton onClick={onClose}>×</CloseButton>
        <ModalTitle>
          <FontAwesomeIcon icon={faLink} style={{ marginRight: '8px' }} />
          Connect Wallet
        </ModalTitle>

        <WalletList>
          {wallets.map((wallet) => (
            <WalletButton
              key={wallet.id}
              $connected={wallet.isConnected}
              onClick={() => handleWalletClick(wallet)}
            >
              <span>
                {wallet.metadata.name}
                {wallet.activeAccount && ` [${wallet.activeAccount.address.slice(0, 3)}...${wallet.activeAccount.address.slice(-3)}]`}
                {wallet.isActive && ` (active)`}
              </span>
              <WalletIcon
                src={wallet.metadata.icon || "/placeholder.svg"}
                alt={`${wallet.metadata.name} Icon`}
              />
            </WalletButton>
          ))}
        </WalletList>

        {activeAccount && (
          <DisconnectButton onClick={disconnectWallets}>
            Disconnect [{activeAccount.address.slice(0, 3)}...{activeAccount.address.slice(-3)}]
          </DisconnectButton>
        )}
      </ModalContent>
    </ModalOverlay>,
    document.body
  )
}

export default ConnectWalletModal