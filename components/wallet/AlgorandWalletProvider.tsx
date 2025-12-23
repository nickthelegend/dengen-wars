"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { peraWallet, algodClient } from "../../lib/algorand-config";

interface AlgorandWalletState {
  isConnected: boolean;
  address: string | null;
  balance: number;
  degenBalance: number;
  connecting: boolean;
  accounts: string[];
}

interface AlgorandWalletContextType {
  wallet: AlgorandWalletState;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  fetchBalance: (address: string) => Promise<void>;
}

const AlgorandWalletContext = createContext<AlgorandWalletContextType | undefined>(undefined);

export function useAlgorandWallet() {
  const context = useContext(AlgorandWalletContext);
  if (!context) {
    throw new Error("useAlgorandWallet must be used within an AlgorandWalletProvider");
  }
  return context;
}

interface AlgorandWalletProviderProps {
  children: ReactNode;
}

export function AlgorandWalletProvider({ children }: AlgorandWalletProviderProps) {
  const [wallet, setWallet] = useState<AlgorandWalletState>({
    isConnected: false,
    address: null,
    balance: 0,
    degenBalance: 0,
    connecting: false,
    accounts: [],
  });

  // Check for existing connection on mount and restore from localStorage
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // First check localStorage for persisted connection
        const savedAddress = localStorage.getItem('peraWallet_address')
        const savedAccounts = localStorage.getItem('peraWallet_accounts')
        
        if (savedAddress && savedAccounts) {
          const accounts = JSON.parse(savedAccounts)
          setWallet({
            isConnected: true,
            address: savedAddress,
            balance: 0,
            degenBalance: 0,
            connecting: false,
            accounts,
          })
          await fetchBalance(savedAddress)
          return
        }
        
        // Fallback to checking peraWallet connection
        if (peraWallet.isConnected && peraWallet.connector?.accounts) {
          const accounts = peraWallet.connector.accounts;
          setWallet({
            isConnected: true,
            address: accounts[0] || null,
            balance: 0,
            degenBalance: 0,
            connecting: false,
            accounts,
          });
          if (accounts[0]) {
            // Save to localStorage
            localStorage.setItem('peraWallet_address', accounts[0])
            localStorage.setItem('peraWallet_accounts', JSON.stringify(accounts))
            await fetchBalance(accounts[0]);
          }
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    };
    
    checkConnection();
  }, []);

  const connectWallet = async () => {
    setWallet(prev => ({ ...prev, connecting: true }));
    
    try {
      let connectedAccounts;
      
      // Check if already connected first
      if (peraWallet.isConnected && peraWallet.connector?.accounts && peraWallet.connector.accounts.length > 0) {
        connectedAccounts = peraWallet.connector.accounts;
      } else {
        try {
          connectedAccounts = await peraWallet.connect();
        } catch (error: any) {
          if (error.message?.includes('Session currently connected')) {
            connectedAccounts = peraWallet.connector?.accounts || [];
          } else {
            throw error;
          }
        }
      }
      
      setWallet(prev => ({
        ...prev,
        accounts: connectedAccounts,
        address: connectedAccounts[0] || null,
        isConnected: connectedAccounts.length > 0,
        connecting: false,
      }));
      
      if (connectedAccounts[0]) {
        // Save to localStorage for persistence
        localStorage.setItem('peraWallet_address', connectedAccounts[0])
        localStorage.setItem('peraWallet_accounts', JSON.stringify(connectedAccounts))
        await fetchBalance(connectedAccounts[0]);
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      setWallet(prev => ({ ...prev, connecting: false }));
    }
  };

  const disconnectWallet = async () => {
    try {
      await peraWallet.disconnect();
      // Clear localStorage
      localStorage.removeItem('peraWallet_address')
      localStorage.removeItem('peraWallet_accounts')
      setWallet({
        isConnected: false,
        address: null,
        balance: 0,
        degenBalance: 0,
        connecting: false,
        accounts: [],
      });
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    }
  };

  const fetchBalance = async (address: string) => {
    try {
      const accountInfo = await algodClient.accountInformation(address).do();
      const balanceInAlgos = Number(accountInfo.amount)/1e6; // Convert microAlgos to Algos

      // Find DEGEN token balance - try multiple possible asset IDs
      const possibleDegenAssetIds = [745007115, 745007115]; // Add more asset IDs if needed
      let degenBalance = 0;

      if (accountInfo.assets && accountInfo.assets.length > 0) {
        console.log('Available assets:', accountInfo.assets.map((asset: any) => ({
          id: asset.assetId || asset['asset-id'],
          amount: Number(asset.amount) / 1e6,
          name: 'Unknown' // Asset names not available in account info
        })));

        // Try to find DEGEN by asset ID
        let degenAsset = accountInfo.assets.find((asset: any) =>
          possibleDegenAssetIds.includes(asset.assetId || asset['asset-id'])
        );

        if (degenAsset) {
          degenBalance = Number(degenAsset.amount) / 1e6; // Convert microDEGEN to DEGEN
          console.log('Found DEGEN asset:', {
            id: degenAsset.assetId,
            balance: degenBalance
          });
        } else {
          console.log('No DEGEN asset found in wallet for asset IDs:', possibleDegenAssetIds);
        }
      } else {
        console.log('No assets found in wallet');
      }

      console.log('Setting wallet balances:', {
        balance: balanceInAlgos,
        degenBalance: degenBalance,
        address
      });

      setWallet(prev => ({
        ...prev,
        balance: balanceInAlgos,
        degenBalance: degenBalance
      }));
    } catch (error) {
      console.error("Failed to fetch balance:", error);
    }
  };

  // Listen for account changes
  useEffect(() => {
    peraWallet.connector?.on("disconnect", disconnectWallet);

    return () => {
      peraWallet.connector?.off("disconnect");
    };
  }, []);

  return (
    <AlgorandWalletContext.Provider
      value={{
        wallet,
        connectWallet,
        disconnectWallet,
        fetchBalance,
      }}
    >
      {children}
    </AlgorandWalletContext.Provider>
  );
}