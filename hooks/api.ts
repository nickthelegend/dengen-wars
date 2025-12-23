import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { User, MemeCoin, TokenBalanceResponse, BattlePriceResponse, ApiResponse } from '../types/api'

// Meme Coins API
export function useMemeCoins(search?: string) {
  return useQuery<{ coins: MemeCoin[] }>({
    queryKey: ['memeCoins', search],
    queryFn: async () => {
      const url = search ? `/api/meme-coins?search=${encodeURIComponent(search)}` : '/api/meme-coins'
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch meme coins')
      return response.json()
    },
    staleTime: 2 * 60 * 1000, // 2 minutes for price data
  })
}

// User Data API
export function useUser(address?: string) {
  return useQuery<ApiResponse<User>>({
    queryKey: ['user', address],
    queryFn: async () => {
      if (!address) return null
      const response = await fetch(`/api/users?address=${address}`)
      if (!response.ok) throw new Error('Failed to fetch user')
      return response.json()
    },
    enabled: !!address,
    staleTime: 30 * 1000,
  })
}

// Token Balances API
export function useTokenBalances(address?: string) {
  return useQuery({
    queryKey: ['tokenBalances', address],
    queryFn: async () => {
      if (!address) return null
      const response = await fetch(`/api/token-balances?address=${address}`)
      if (!response.ok) throw new Error('Failed to fetch balances')
      return response.json()
    },
    enabled: !!address,
    staleTime: 10 * 1000, // 10 seconds for balance data
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
  })
}

// Battle Prices API
export function useBattlePrices(symbols: string[]) {
  return useQuery({
    queryKey: ['battlePrices', symbols],
    queryFn: async () => {
      const response = await fetch('/api/battle-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols })
      })
      if (!response.ok) throw new Error('Failed to fetch battle prices')
      return response.json()
    },
    enabled: symbols.length > 0,
    staleTime: 5 * 1000, // 5 seconds for real-time prices
    refetchInterval: 5 * 1000,
  })
}

// Mutations
export function useCreateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (userData: { username?: string; walletAddress?: string }) => {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })
      if (!response.ok) throw new Error('Failed to create user')
      return response.json()
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['user', variables.walletAddress], data)
    }
  })
}