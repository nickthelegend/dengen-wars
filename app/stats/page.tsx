"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "../../components/layout/AppLayout"
import { useWallet } from "@txnlab/use-wallet-react"
import styled from "styled-components"

const StatsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`

const StatsHeader = styled.div`
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

const StatsTitle = styled.h1`
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

const BattleHistorySection = styled.div`
  background: var(--light-bg);
  border: 4px solid var(--border-primary);
  padding: 24px;
  box-shadow: 4px 4px 0px 0px var(--border-primary);
`

const BattleItem = styled.div<{ $result: string }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  margin-bottom: 12px;
  background: ${props => 
    props.$result === 'win' ? 'linear-gradient(135deg, rgba(0, 255, 65, 0.2) 0%, rgba(0, 255, 65, 0.1) 100%)' : 
    props.$result === 'loss' ? 'linear-gradient(135deg, rgba(255, 20, 147, 0.2) 0%, rgba(255, 20, 147, 0.1) 100%)' : 
    'linear-gradient(135deg, rgba(255, 180, 0, 0.2) 0%, rgba(255, 180, 0, 0.1) 100%)'};
  border: 3px solid ${props => 
    props.$result === 'win' ? '#00ff41' : 
    props.$result === 'loss' ? '#ff1493' : 
    '#ffb400'};
  border-radius: 12px;
  font-family: var(--font-mono);
  font-size: 14px;
  box-shadow: ${props => 
    props.$result === 'win' ? '0 0 15px rgba(0, 255, 65, 0.3)' : 
    props.$result === 'loss' ? '0 0 15px rgba(255, 20, 147, 0.3)' : 
    '0 0 15px rgba(255, 180, 0, 0.3)'};
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => 
      props.$result === 'win' ? '0 4px 20px rgba(0, 255, 65, 0.4)' : 
      props.$result === 'loss' ? '0 4px 20px rgba(255, 20, 147, 0.4)' : 
      '0 4px 20px rgba(255, 180, 0, 0.4)'};
  }
`

export default function StatsPage() {
  const [battles, setBattles] = useState<any[]>([])
  const [multiplayerBattles, setMultiplayerBattles] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'ai' | 'pvp'>('ai')
  const { activeAccount } = useWallet()

  useEffect(() => {
    if (activeAccount?.address) {
      loadUserStats()
    } else {
      setLoading(false)
    }
  }, [activeAccount?.address])

  const loadUserStats = async () => {
    try {
      if (!activeAccount?.address) {
        setLoading(false)
        return
      }

      const userResponse = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: activeAccount.address })
      })

      const userData = await userResponse.json()
      if (userData.user) {
        setUser(userData.user)
        
        const battlesResponse = await fetch(`/api/meme-battles?userId=${userData.user.id}`)
        const battlesData = await battlesResponse.json()
        setBattles(battlesData.battles || [])
        
        const multiplayerResponse = await fetch(`/api/multiplayer-battles?userId=${userData.user.id}`)
        const multiplayerData = await multiplayerResponse.json()
        setMultiplayerBattles(multiplayerData.battles || [])
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <StatsContainer>
          <StatsHeader>
            <StatsTitle>📊 LOADING STATS...</StatsTitle>
          </StatsHeader>
        </StatsContainer>
      </AppLayout>
    )
  }

  if (!activeAccount?.address) {
    return (
      <AppLayout>
        <StatsContainer>
          <StatsHeader>
            <StatsTitle>🔗 CONNECT WALLET</StatsTitle>
            <div style={{ marginTop: '16px', fontSize: '16px' }}>
              Connect your Pera wallet to view your battle stats
            </div>
          </StatsHeader>
        </StatsContainer>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <StatsContainer>
        <StatsHeader>
          <StatsTitle>📊 BATTLE STATS</StatsTitle>
          {user && (
            <div style={{ marginTop: '16px', display: 'flex', gap: '20px', justifyContent: 'center', fontSize: '16px' }}>
              <div>🏆 Wins: {user.wins}</div>
              <div>💀 Losses: {user.losses}</div>
              <div>🔥 Streak: {user.winStreak}</div>
              <div>📈 Rate: {user.totalBattles > 0 ? ((user.wins / user.totalBattles) * 100).toFixed(1) : 0}%</div>
            </div>
          )}
        </StatsHeader>

        <BattleHistorySection>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <button
              onClick={() => setActiveTab('ai')}
              style={{
                padding: '8px 16px',
                background: activeTab === 'ai' ? 'var(--brutal-lime)' : 'var(--light-bg)',
                border: '3px solid var(--border-primary)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontWeight: '900',
                cursor: 'pointer'
              }}
            >
              🤖 AI BATTLES
            </button>
            <button
              onClick={() => setActiveTab('pvp')}
              style={{
                padding: '8px 16px',
                background: activeTab === 'pvp' ? 'var(--brutal-lime)' : 'var(--light-bg)',
                border: '3px solid var(--border-primary)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontWeight: '900',
                cursor: 'pointer'
              }}
            >
              ⚔️ PVP BATTLES
            </button>
          </div>
          <h2 style={{ margin: '0 0 16px 0', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            {activeTab === 'ai' ? 'AI BATTLES' : 'PVP BATTLES'}
          </h2>
          {activeTab === 'ai' ? (
            battles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-primary)' }}>
                No AI battles yet. Start your first battle!
              </div>
            ) : (
              battles.map((battle) => (
                <BattleItem key={battle.id} $result={battle.winnerId === user?.id ? 'win' : battle.winnerId ? 'loss' : 'tie'}>
                  <div>
                    <div style={{ fontWeight: '900' }}>
                      {battle.winnerId === user?.id ? '🎉 VICTORY' : battle.winnerId ? '💀 DEFEAT' : '🤝 TIE'}
                    </div>
                    <div style={{ fontSize: '10px', color: '#666' }}>
                      {new Date(battle.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div>{battle.player1Score.toFixed(2)}% vs {battle.player2Score.toFixed(2)}%</div>
                    <div style={{ fontSize: '10px', color: '#666' }}>
                      {battle.strategy.toUpperCase()} AI
                    </div>
                  </div>
                </BattleItem>
              ))
            )
          ) : (
            multiplayerBattles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-primary)' }}>
                No PvP battles yet. Challenge other players!
              </div>
            ) : (
              multiplayerBattles.map((battle) => {
                const isPlayer1 = battle.player1Id === user?.id
                const opponent = isPlayer1 ? battle.player2 : battle.player1
                const myScore = isPlayer1 ? battle.player1Score : battle.player2Score
                const opponentScore = isPlayer1 ? battle.player2Score : battle.player1Score
                const result = battle.winnerId === user?.id ? 'win' : battle.winnerId ? 'loss' : 'tie'
                
                return (
                  <BattleItem key={battle.id} $result={result}>
                    <div>
                      <div style={{ fontWeight: '900' }}>
                        {result === 'win' ? '🎉 VICTORY' : result === 'loss' ? '💀 DEFEAT' : '🤝 TIE'}
                      </div>
                      <div style={{ fontSize: '10px', color: '#666' }}>
                        vs {opponent.username.slice(0, 8)}... • {new Date(battle.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div>{myScore.toFixed(2)}% vs {opponentScore.toFixed(2)}%</div>
                      <div style={{ fontSize: '10px', color: '#666' }}>
                        MULTIPLAYER
                      </div>
                    </div>
                  </BattleItem>
                )
              })
            )
          )}
        </BattleHistorySection>
      </StatsContainer>
    </AppLayout>
  )
}