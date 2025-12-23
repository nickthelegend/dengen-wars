import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface Player {
  id: string
  username: string
  walletAddress: string
  team: any[]
}

interface BattleRoom {
  id: string
  players: [Player, Player]
  status: 'waiting' | 'active' | 'finished'
  battleType: 'pvp' | 'pve'
}

export function useSupabaseSocket() {
  const [isConnected, setIsConnected] = useState(false)
  const [currentRoom, setCurrentRoom] = useState<BattleRoom | null>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!supabase) {
      console.warn('Supabase not available. Real-time features disabled.')
      return
    }

    // Subscribe to battle rooms channel
    const channel = supabase.channel('battle-rooms')
    channelRef.current = channel

    channel
      .on('system', { event: 'CHANNEL_JOIN' }, () => {
        setIsConnected(true)
      })
      .on('system', { event: 'CHANNEL_LEAVE' }, () => {
        setIsConnected(false)
      })
      .on('broadcast', { event: 'match-found' }, ({ payload }) => {
        handleMatchFound(payload)
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  const handleMatchFound = (payload: any) => {
    const room: BattleRoom = {
      id: payload.roomId,
      players: payload.players,
      status: 'waiting',
      battleType: payload.battleType
    }
    setCurrentRoom(room)

    // Join the specific battle room channel
    joinBattleRoom(payload.roomId)
  }

  const joinBattleRoom = (roomId: string) => {
    if (!supabase) return

    if (channelRef.current) {
      channelRef.current.unsubscribe()
    }

    const battleChannel = supabase.channel(`battle-${roomId}`)
    channelRef.current = battleChannel

    battleChannel
      .on('broadcast', { event: 'battle-start' }, ({ payload }) => {
        if (currentRoom) {
          setCurrentRoom({ ...currentRoom, status: 'active' })
        }
      })
      .on('broadcast', { event: 'price-update' }, ({ payload }) => {
        // Handle price updates
        console.log('Price update:', payload)
      })
      .on('broadcast', { event: 'battle-end' }, ({ payload }) => {
        if (currentRoom) {
          setCurrentRoom({ ...currentRoom, status: 'finished' })
        }
      })
      .subscribe()
  }

  const joinQueue = (player: Player, battleType: 'pvp' | 'pve' = 'pvp') => {
    if (!supabase) return

    const channel = supabase.channel('battle-rooms')
    channel.send({
      type: 'broadcast',
      event: 'join-queue',
      payload: {
        ...player,
        battleType
      }
    })
  }

  const leaveQueue = (playerId: string) => {
    if (!supabase) return

    const channel = supabase.channel('battle-rooms')
    channel.send({
      type: 'broadcast',
      event: 'leave-queue',
      payload: { id: playerId }
    })
  }

  const sendBattleAction = (roomId: string, action: any) => {
    if (!supabase) return

    const channel = supabase.channel(`battle-${roomId}`)
    channel.send({
      type: 'broadcast',
      event: 'battle-action',
      payload: {
        roomId,
        ...action
      }
    })
  }

  return {
    isConnected,
    currentRoom,
    joinQueue,
    leaveQueue,
    sendBattleAction,
    joinBattleRoom
  }
}