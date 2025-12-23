"use client"

import { useState, useEffect } from 'react'
import { useSupabaseSocket } from '../../hooks/useSupabaseSocket'
import { useWallet } from '@txnlab/use-wallet-react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '../../components/layout/AppLayout'
import styled from 'styled-components'
import { Button } from '../../components/styled/GlobalStyles'

const MatchmakingContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`

const MatchmakingHeader = styled.div`
  text-align: center;
  background: linear-gradient(135deg, var(--brutal-violet) 0%, var(--brutal-cyan) 100%);
  padding: 32px;
  border: 4px solid var(--border-primary);
  box-shadow: 8px 8px 0px 0px var(--border-primary);
  font-family: var(--font-mono);
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%);
  }
`

const MatchmakingTitle = styled.h1`
  font-size: 40px;
  font-weight: 900;
  color: var(--text-primary);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 3px;
  text-shadow: 0 0 20px #00ff41, 2px 2px 0px var(--border-primary);
  position: relative;
  z-index: 1;
`

const StatusSection = styled.div`
  background: var(--light-bg);
  border: 4px solid var(--border-primary);
  padding: 24px;
  box-shadow: 4px 4px 0px 0px var(--border-primary);
`

const StatusItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  background: var(--brutal-lime);
  border: 2px solid var(--border-primary);
  font-family: var(--font-mono);
  font-weight: 900;
`

const SearchingSection = styled.div`
  text-align: center;
  background: var(--brutal-yellow);
  border: 4px solid var(--border-primary);
  padding: 40px;
  box-shadow: 4px 4px 0px 0px var(--border-primary);
`

const MatchFoundSection = styled.div`
  text-align: center;
  background: var(--brutal-lime);
  border: 4px solid var(--border-primary);
  padding: 40px;
  box-shadow: 4px 4px 0px 0px var(--border-primary);
`

const CountdownText = styled.div`
  font-size: 64px;
  font-weight: 900;
  color: var(--text-primary);
  font-family: var(--font-mono);
  text-shadow: 0 0 20px #ff1493;
  margin: 20px 0;
`

export default function MatchmakingPage() {
  const { isConnected, currentRoom, joinQueue, leaveQueue } = useSupabaseSocket()
  const { activeAccount } = useWallet()
  const router = useRouter()
  const [inQueue, setInQueue] = useState(false)
  const [matchFound, setMatchFound] = useState(false)
  const [opponent, setOpponent] = useState<any>(null)
  const [queueSize, setQueueSize] = useState(0)
  const [countdown, setCountdown] = useState(3)
  const [selectedBattleType, setSelectedBattleType] = useState<'pvp' | 'pve'>('pvp')

  const handleJoinQueue = () => {
    if (!activeAccount?.address) return

    const savedTeam = localStorage.getItem('selectedTeam')
    if (!savedTeam) {
      alert('Please select a team first!')
      router.push('/team')
      return
    }

    const playerData = {
      id: activeAccount.address,
      username: activeAccount.address.slice(0, 8) + '...',
      walletAddress: activeAccount.address,
      team: JSON.parse(savedTeam)
    }

    joinQueue(playerData, selectedBattleType)
    setInQueue(true)
  }

  const handleLeaveQueue = () => {
    if (!activeAccount?.address) return
    leaveQueue(activeAccount.address)
    setInQueue(false)
  }

  useEffect(() => {
    if (currentRoom && currentRoom.status === 'waiting') {
      setMatchFound(true)
      setOpponent(currentRoom.players.find((p: any) => p.id !== activeAccount?.address))

      setTimeout(() => {
        router.push(`/battle/room/${currentRoom.id}`)
      }, 3000)

      const countdownInterval = setInterval(() => {
        setCountdown(prev => prev - 1)
      }, 1000)

      setTimeout(() => clearInterval(countdownInterval), 3000)
    }
  }, [currentRoom, activeAccount?.address, router])

  if (!activeAccount?.address) {
    return (
      <AppLayout>
        <MatchmakingContainer>
          <MatchmakingHeader>
            <MatchmakingTitle>🔒 WALLET REQUIRED</MatchmakingTitle>
            <div style={{ marginTop: '16px', fontSize: '16px', position: 'relative', zIndex: 1 }}>
              Connect your Pera wallet to join multiplayer battles
            </div>
          </MatchmakingHeader>
        </MatchmakingContainer>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <MatchmakingContainer>
        <MatchmakingHeader>
          <MatchmakingTitle>⚔️ MULTIPLAYER ARENA</MatchmakingTitle>
          <div style={{ marginTop: '16px', fontSize: '16px', position: 'relative', zIndex: 1 }}>
            Battle other players in real-time crypto combat
          </div>
        </MatchmakingHeader>

        <StatusSection>
          <StatusItem>
            <span>Connection Status:</span>
            <span style={{ color: isConnected ? 'var(--primary-green)' : 'var(--red-primary)' }}>
              {isConnected ? '🟢 CONNECTED' : '🔴 DISCONNECTED'}
            </span>
          </StatusItem>
          
          <StatusItem>
            <span>Players in Queue:</span>
            <span style={{ color: 'var(--text-primary)' }}>{queueSize}</span>
          </StatusItem>
        </StatusSection>

        {!inQueue && !matchFound && (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h3 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginBottom: '16px' }}>
                Choose Battle Type:
              </h3>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '20px' }}>
                <Button
                  onClick={() => setSelectedBattleType('pvp')}
                  style={{
                    background: selectedBattleType === 'pvp' ? 'var(--brutal-lime)' : 'var(--light-bg)',
                    color: selectedBattleType === 'pvp' ? 'var(--text-primary)' : 'var(--text-primary)',
                    fontSize: '16px',
                    padding: '12px 24px'
                  }}
                >
                  ⚔️ PVP Battle
                </Button>
                <Button
                  onClick={() => setSelectedBattleType('pve')}
                  style={{
                    background: selectedBattleType === 'pve' ? 'var(--brutal-lime)' : 'var(--light-bg)',
                    color: selectedBattleType === 'pve' ? 'var(--text-primary)' : 'var(--text-primary)',
                    fontSize: '16px',
                    padding: '12px 24px'
                  }}
                >
                  🤖 PVE Battle
                </Button>
              </div>
              <div style={{
                background: 'var(--brutal-cyan)',
                border: '2px solid var(--border-primary)',
                padding: '12px',
                marginBottom: '20px',
                fontFamily: 'var(--font-mono)',
                fontSize: '14px'
              }}>
                {selectedBattleType === 'pvp'
                  ? 'Battle against other players in real-time combat!'
                  : 'Battle against AI opponents with dynamic strategies!'
                }
              </div>
            </div>
            <Button
              onClick={handleJoinQueue}
              disabled={!isConnected}
              style={{ fontSize: '20px', padding: '16px 32px' }}
            >
              🎯 FIND {selectedBattleType.toUpperCase()} MATCH
            </Button>
          </div>
        )}

        {inQueue && !matchFound && (
          <SearchingSection>
            <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginBottom: '20px' }}>
              🔍 SEARCHING FOR OPPONENT...
            </div>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              border: '6px solid var(--border-primary)', 
              borderTop: '6px solid var(--brutal-red)', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <Button
              onClick={handleLeaveQueue}
              style={{ background: 'var(--red-primary)', fontSize: '16px' }}
            >
              ❌ LEAVE QUEUE
            </Button>
          </SearchingSection>
        )}

        {matchFound && (
          <MatchFoundSection>
            <div style={{ fontSize: '32px', fontWeight: '900', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginBottom: '20px' }}>
              🎉 MATCH FOUND!
            </div>
            <div style={{ 
              background: 'var(--light-bg)', 
              border: '3px solid var(--border-primary)', 
              padding: '16px', 
              marginBottom: '20px',
              fontFamily: 'var(--font-mono)'
            }}>
              <div style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Opponent:</div>
              <div style={{ color: 'var(--text-primary)', fontWeight: '900', fontSize: '18px' }}>{opponent?.username}</div>
            </div>
            <CountdownText>{countdown}</CountdownText>
            <div style={{ fontSize: '16px', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>Starting battle...</div>
          </MatchFoundSection>
        )}
      </MatchmakingContainer>
    </AppLayout>
  )
}