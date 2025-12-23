"use client"

import { useState, useEffect } from 'react'
import { useSupabaseSocket } from '../../../../hooks/useSupabaseSocket'
import { useParams, useRouter } from 'next/navigation'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts'
import { AppLayout } from '../../../../components/layout/AppLayout'
import styled from 'styled-components'
import { Button } from '../../../../components/styled/GlobalStyles'
import { supabase } from '../../../../lib/supabase'

const BattleContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const BattleHeader = styled.div`
  text-align: center;
  background: var(--brutal-red);
  padding: 20px;
  border: 4px solid var(--border-primary);
  box-shadow: 4px 4px 0px 0px var(--border-primary);
`

const BattleTitle = styled.h1`
  font-size: 28px;
  font-weight: 900;
  color: var(--text-primary);
  margin: 0;
  font-family: var(--font-mono);
  text-transform: uppercase;
`

const Timer = styled.div`
  font-size: 48px;
  font-weight: 900;
  color: var(--text-primary);
  font-family: var(--font-mono);
  background: var(--brutal-yellow);
  padding: 16px;
  border: 4px solid var(--border-primary);
  margin: 20px 0;
`

const PlayersContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
`

const PlayerSection = styled.div<{ $isWinning?: boolean }>`
  background: ${props => props.$isWinning ? 'var(--brutal-lime)' : 'var(--light-bg)'};
  border: 4px solid var(--border-primary);
  padding: 20px;
  box-shadow: 4px 4px 0px 0px var(--border-primary);
`

const PlayerTitle = styled.h3`
  font-size: 18px;
  font-weight: 900;
  color: var(--text-primary);
  margin: 0 0 12px 0;
  font-family: var(--font-mono);
  text-transform: uppercase;
`

const ScoreDisplay = styled.div<{ $color: string }>`
  font-size: 24px;
  font-weight: 900;
  color: ${props => props.$color};
  font-family: var(--font-mono);
  text-shadow: 0 0 10px ${props => props.$color};
`

const WinnerSection = styled.div<{ $winner?: boolean }>`
  background: ${props => props.$winner ? 'var(--brutal-lime)' : 'var(--brutal-red)'};
  border: 4px solid var(--border-primary);
  padding: 20px;
  text-align: center;
  box-shadow: 4px 4px 0px 0px var(--border-primary);
`

const WinnerText = styled.h2`
  font-size: 32px;
  font-weight: 900;
  color: var(--text-primary);
  margin: 0;
  font-family: var(--font-mono);
  text-transform: uppercase;
`

const GraphContainer = styled.div`
  background: var(--light-bg);
  border: 4px solid var(--border-primary);
  padding: 20px;
  box-shadow: 4px 4px 0px 0px var(--border-primary);
`

export default function BattleRoomPage() {
  const { roomId } = useParams()
  const { currentRoom, joinBattleRoom } = useSupabaseSocket()
  const router = useRouter()
  const [battleState, setBattleState] = useState('waiting')
  const [players, setPlayers] = useState<any[]>([])
  const [priceData, setPriceData] = useState<any[]>([])
  const [timeLeft, setTimeLeft] = useState(60)
  const [results, setResults] = useState<any>(null)

  useEffect(() => {
    if (!roomId || typeof roomId !== 'string') return

    // Join the battle room channel
    joinBattleRoom(roomId)

    // Set up listeners for battle events
    if (!supabase) {
      console.warn('Supabase not available. Real-time features disabled.')
      return
    }

    const channel = supabase.channel(`battle-${roomId}`)

    channel
      .on('broadcast', { event: 'battle-start' }, ({ payload }) => {
        setBattleState('active')
        if (currentRoom) {
          setPlayers(currentRoom.players)
        }
      })
      .on('broadcast', { event: 'price-update' }, ({ payload }) => {
        setPriceData(prev => [...prev, payload])
        setTimeLeft(prev => Math.max(0, prev - 1))
      })
      .on('broadcast', { event: 'battle-end' }, ({ payload }) => {
        setBattleState('finished')
        setResults(payload)
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [roomId, joinBattleRoom, currentRoom])

  const formatChartData = () => {
    return priceData.map((entry, index) => ({
      time: index,
      ...entry.prices
    }))
  }

  const getTeamScore = (playerIndex: number) => {
    if (priceData.length < 2) return 0
    
    const startPrices = priceData[0].prices
    const currentPrices = priceData[priceData.length - 1].prices
    const team = players[playerIndex]?.team || []
    
    return team.reduce((score: number, coin: any) => {
      const start = startPrices[coin.symbol] || 0
      const current = currentPrices[coin.symbol] || 0
      const change = start > 0 ? ((current - start) / start) * 100 : 0
      return score + change
    }, 0)
  }

  if (battleState === 'waiting') {
    return (
      <AppLayout>
        <BattleContainer>
          <BattleHeader>
            <BattleTitle>⏳ WAITING FOR BATTLE...</BattleTitle>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              border: '6px solid var(--border-primary)', 
              borderTop: '6px solid var(--brutal-red)', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite',
              margin: '20px auto'
            }}></div>
          </BattleHeader>
        </BattleContainer>
      </AppLayout>
    )
  }

  if (battleState === 'finished') {
    return (
      <AppLayout>
        <BattleContainer>
          <WinnerSection $winner={results?.winner?.id === players.find(p => p.id === results?.winner?.id)?.id}>
            <WinnerText>🏆 BATTLE COMPLETE!</WinnerText>
          </WinnerSection>
          
          <PlayersContainer>
            <PlayerSection $isWinning={results?.winner?.id === players[0]?.id}>
              <PlayerTitle>{players[0]?.username}</PlayerTitle>
              <ScoreDisplay $color={results?.winner?.id === players[0]?.id ? 'var(--primary-green)' : 'var(--text-primary)'}>
                {results?.player1Score}%
              </ScoreDisplay>
            </PlayerSection>
            <PlayerSection $isWinning={results?.winner?.id === players[1]?.id}>
              <PlayerTitle>{players[1]?.username}</PlayerTitle>
              <ScoreDisplay $color={results?.winner?.id === players[1]?.id ? 'var(--primary-green)' : 'var(--text-primary)'}>
                {results?.player2Score}%
              </ScoreDisplay>
            </PlayerSection>
          </PlayersContainer>
          
          <div style={{ textAlign: 'center', background: 'var(--brutal-yellow)', border: '4px solid var(--border-primary)', padding: '20px' }}>
            {results?.tie ? (
              <div style={{ fontSize: '24px', fontWeight: '900', fontFamily: 'var(--font-mono)' }}>🤝 IT'S A TIE!</div>
            ) : (
              <div style={{ fontSize: '24px', fontWeight: '900', fontFamily: 'var(--font-mono)' }}>
                🎉 Winner: {results?.winner?.username}
              </div>
            )}
          </div>

          <Button
            onClick={() => router.push('/matchmaking')}
            style={{ fontSize: '18px', padding: '16px 32px' }}
          >
            🔄 PLAY AGAIN
          </Button>
        </BattleContainer>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <BattleContainer>
        <BattleHeader>
          <BattleTitle>⚔️ LIVE PVP BATTLE</BattleTitle>
          <Timer>⏱️ {timeLeft}s</Timer>
        </BattleHeader>

        <PlayersContainer>
          <PlayerSection $isWinning={getTeamScore(0) >= getTeamScore(1)}>
            <PlayerTitle>👤 {players[0]?.username}</PlayerTitle>
            <ScoreDisplay $color="#00ff41">
              {getTeamScore(0).toFixed(4)}%
            </ScoreDisplay>
          </PlayerSection>
          <PlayerSection $isWinning={getTeamScore(1) >= getTeamScore(0)}>
            <PlayerTitle>👤 {players[1]?.username}</PlayerTitle>
            <ScoreDisplay $color="#ff1493">
              {getTeamScore(1).toFixed(4)}%
            </ScoreDisplay>
          </PlayerSection>
        </PlayersContainer>

        {priceData.length > 0 && (
          <GraphContainer>
            <div style={{ 
              background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)', 
              padding: '16px', 
              borderRadius: '20px', 
              border: '4px solid var(--border-primary)', 
              boxShadow: '0 0 30px rgba(0, 255, 65, 0.1)'
            }}>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={formatChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#444" opacity={0.3} />
                  <XAxis 
                    dataKey="time" 
                    stroke="#00ff41" 
                    fontSize={14}
                    fontFamily="var(--font-mono)"
                  />
                  <YAxis 
                    stroke="#ff1493" 
                    fontSize={14}
                    fontFamily="var(--font-mono)"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(26, 26, 46, 0.95)', 
                      border: '3px solid #00ff41', 
                      borderRadius: '12px',
                      fontFamily: 'var(--font-mono)'
                    }}
                  />
                  {players[0]?.team?.map((coin: any, index: number) => (
                    <Line
                      key={`p1-${coin.symbol}`}
                      type="monotone"
                      dataKey={coin.symbol}
                      stroke="#00ff41"
                      strokeWidth={3}
                      dot={false}
                    />
                  ))}
                  {players[1]?.team?.map((coin: any, index: number) => (
                    <Line
                      key={`p2-${coin.symbol}`}
                      type="monotone"
                      dataKey={coin.symbol}
                      stroke="#ff1493"
                      strokeWidth={3}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GraphContainer>
        )}
      </BattleContainer>
    </AppLayout>
  )
}