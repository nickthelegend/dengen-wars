"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useWallet } from "@txnlab/use-wallet-react"
import { algodClient } from "../../lib/algorand-config"

interface UnifiedWalletState {
  isConnected: boolean
  address: string | null
  balance: number
  degenBalance: number
  connecting: boolean
}

interface UnifiedWalletContextType {
  wallet: UnifiedWalletState
  connectWallet: () => Promise<void>
  disconnectWallet: () => Promise<void>
  fetchBalance: (address: string) => Promise<void>
}

const UnifiedWalletContext = createContext<UnifiedWalletContextType | undefined>(undefined)

export function useUnifiedWallet() {
  const context = useContext(UnifiedWalletContext)
  if (!context) {
    throw new Error("useUnifiedWallet must be used within a UnifiedWalletProvider")
  }
  return context
}

interface UnifiedWalletProviderProps {
  children: ReactNode
}

export function UnifiedWalletProvider({ children }: UnifiedWalletProviderProps) {
  const { wallets, activeAccount, signTransactions, sendTransactions } = useWallet()
  const [wallet, setWallet] = useState<UnifiedWalletState>({
    isConnected: false,
    address: null,
    balance: 0,
    degenBalance: 0,
    connecting: false,
  })

  // Sync with @txnlab/use-wallet-react state
  useEffect(() => {
    if (activeAccount?.address) {
      setWallet(prev => ({
        ...prev,
        isConnected: true,
        address: activeAccount.address,
      }))
      fetchBalance(activeAccount.address)
    } else {
      setWallet(prev => ({
        ...prev,
        isConnected: false,
        address: null,
        balance: 0,
        degenBalance: 0,
      }))
    }
  }, [activeAccount?.address])

  const connectWallet = async () => {
    setWallet(prev => ({ ...prev, connecting: true }))
    
    try {
      if (wallets && wallets.length > 0) {
        // Try to connect with the first available wallet
        const firstWallet = wallets[0]
        if (firstWallet && !firstWallet.isConnected) {
          await firstWallet.connect()
        }
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    } finally {
      setWallet(prev => ({ ...prev, connecting: false }))
    }
  }

  const disconnectWallet = async () => {
    try {
      if (wallets) {
        for (const wallet of wallets) {
          if (wallet.isConnected) {
            await wallet.disconnect()
          }
        }
      }
    } catch (error) {
      console.error("Failed to disconnect wallet:", error)
    }
  }

  const fetchBalance = async (address: string) => {
    try {
      const accountInfo = await algodClient.accountInformation(address).do()
      const balanceInAlgos = Number(accountInfo.amount) / 1e6

      // Find DEGEN token balance
      const possibleDegenAssetIds = [745007115]
      let degenBalance = 0

      if (accountInfo.assets && accountInfo.assets.length > 0) {
        const degenAsset = accountInfo.assets.find((asset: any) =>
          possibleDegenAssetIds.includes(asset.assetId || asset['asset-id'])
        )

        if (degenAsset) {
          degenBalance = Number(degenAsset.amount) / 1e6
        }
      }

      setWallet(prev => ({
        ...prev,
        balance: balanceInAlgos,
        degenBalance: degenBalance
      }))
    } catch (error) {
      console.error("Failed to fetch balance:", error)
    }
  }

  return (
    <UnifiedWalletContext.Provider
      value={{
        wallet,
        connectWallet,
        disconnectWallet,
        fetchBalance,
      }}
    >
      {children}
    </UnifiedWalletContext.Provider>
  )
}