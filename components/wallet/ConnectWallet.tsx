"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@txnlab/use-wallet-react"
import { algodClient } from "../../lib/algorand-config"
import ConnectWalletModal from "./ConnectWalletModal"
import styled from "styled-components"
import { Button } from "../styled/GlobalStyles"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLink } from '@fortawesome/free-solid-svg-icons'

const ConnectButton = styled(Button)`
  background: var(--brutal-cyan);
  border: 3px solid var(--border-primary);
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-weight: 900;
  text-transform: uppercase;
  padding: 12px 24px;
  box-shadow: 4px 4px 0px 0px var(--border-primary);
  transition: all 0.1s ease;

  &:hover {
    background: var(--brutal-lime);
    transform: translate(2px, 2px);
    box-shadow: 2px 2px 0px 0px var(--border-primary);
  }
`

const AddressDisplay = styled.div`
  background: var(--brutal-lime);
  border: 3px solid var(--border-primary);
  padding: 12px 16px;
  font-family: var(--font-mono);
  font-weight: 900;
  text-transform: uppercase;
  box-shadow: 4px 4px 0px 0px var(--border-primary);
  cursor: pointer;
  transition: all 0.1s ease;

  &:hover {
    background: var(--brutal-cyan);
    transform: translate(2px, 2px);
    box-shadow: 2px 2px 0px 0px var(--border-primary);
  }
`

export function ConnectWallet() {
  const { wallets, activeAccount } = useWallet()
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    console.log('Wallets loaded:', wallets?.length || 0)
    console.log('Active account:', activeAccount?.address)
  }, [wallets, activeAccount])

  const handleConnectClick = () => {
    console.log('Connect button clicked, wallets available:', wallets?.length || 0)
    console.log('Wallets:', wallets)
    setIsModalOpen(true)
  }

  const handleAddressClick = () => {
    setIsModalOpen(true)
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (!activeAccount) {
    return (
      <>
        <ConnectButton onClick={handleConnectClick}>
          <FontAwesomeIcon icon={faLink} style={{ marginRight: '8px' }} />
          Connect Wallet ({wallets?.length || 0})
        </ConnectButton>
        <ConnectWalletModal
          wallets={wallets || []}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </>
    )
  }

  return (
    <>
      <AddressDisplay onClick={handleAddressClick}>
        {formatAddress(activeAccount.address)}
      </AddressDisplay>
      <ConnectWalletModal
        wallets={wallets || []}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}

export default ConnectWallet