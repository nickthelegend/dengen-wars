"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "../../components/layout/AppLayout"
import { useWallet } from "@txnlab/use-wallet-react"
import styled from "styled-components"
import { Button } from "../../components/styled/GlobalStyles"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCrosshairs, faTrophy, faChartBar, faChartLine, faCoins, faRobot, faFire, faBolt, faGauge, faShare, faLink, faExclamationTriangle, faUser, faCrown, faHandshake, faRocket, faChartSimple } from '@fortawesome/free-solid-svg-icons'

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
  position: relative;
`

const IconWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  font-size: 1.2em;
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

const TeamsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
`

const TeamSection = styled.div`
  background: var(--light-bg);
  border: 4px solid var(--border-primary);
  padding: 20px;
  box-shadow: 4px 4px 0px 0px var(--border-primary);
`

const TeamTitle = styled.h2`
  font-size: 20px;
  font-weight: 900;
  color: var(--text-primary);
  margin: 0 0 16px 0;
  font-family: var(--font-mono);
  text-transform: uppercase;
  background: var(--brutal-cyan);
  padding: 8px;
  border: 2px solid var(--border-primary);
`

const CoinItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  background: var(--brutal-lime);
  border: 2px solid var(--border-primary);
`

const CoinName = styled.span`
  font-weight: 900;
  font-family: var(--font-mono);
  color: var(--text-primary);
`

const PriceChange = styled.span<{ $positive: boolean }>`
  font-weight: 900;
  font-family: var(--font-mono);
  color: ${props => props.$positive ? 'var(--primary-green)' : 'var(--red-primary)'};
`

const GraphContainer = styled.div`
  background: var(--light-bg);
  border: 4px solid var(--border-primary);
  padding: 20px;
  box-shadow: 4px 4px 0px 0px var(--border-primary);
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`

const WinnerSection = styled.div<{ $winner?: boolean }>`
  background: ${props => props.$winner ? 'var(--brutal-lime)' : 'var(--brutal-red)'};
  border: 4px solid var(--border-primary);
  padding: 20px;
  text-align: center;
  box-shadow: 4px 4px 0px 0px var(--border-primary);
`

const WinnerText = styled.h2`
  font-size: 24px;
  font-weight: 900;
  color: var(--text-primary);
  margin: 0;
  font-family: var(--font-mono);
  text-transform: uppercase;
`

export default function BattleMemePage() {
  const [timeLeft, setTimeLeft] = useState(60) // 1 minute battle
  const [battleActive, setBattleActive] = useState(false)
  const [playerTeam, setPlayerTeam] = useState<any[]>([])
  const [opponentTeam, setOpponentTeam] = useState<any[]>([])
  const [playerScore, setPlayerScore] = useState(0)
  const [opponentScore, setOpponentScore] = useState(0)
  const [winner, setWinner] = useState<string | null>(null)
  const [priceHistory, setPriceHistory] = useState<{time: number, you: number, opponent: number}[]>([])
  const [opponentStrategy, setOpponentStrategy] = useState<string>('aggressive')
  const [battleIntensity, setBattleIntensity] = useState(1)
  const [winStreak, setWinStreak] = useState(0)
  const [totalBattles, setTotalBattles] = useState(0)
  const [totalWins, setTotalWins] = useState(0)
  const [degenBalance, setDegenBalance] = useState(0)
  const [stakeAmount, setStakeAmount] = useState(10)
  const [currentBattleId, setCurrentBattleId] = useState<string | null>(null)
  const { activeAccount } = useWallet()

  useEffect(() => {
    const savedTeam = localStorage.getItem('selectedTeam')
    if (savedTeam) {
      const team = JSON.parse(savedTeam)
      setPlayerTeam(team)
      generateOpponentTeam()
    }

    // Load battle stats
    const streak = localStorage.getItem('winStreak')
    const battles = localStorage.getItem('totalBattles')
    const wins = localStorage.getItem('totalWins')
    if (streak) setWinStreak(parseInt(streak))
    if (battles) setTotalBattles(parseInt(battles))
    if (wins) setTotalWins(parseInt(wins))

    // Load DEGEN balance
    if (activeAccount?.address) {
      fetchDegenBalance()
    }
  }, [activeAccount?.address])

  const fetchDegenBalance = async () => {
    if (!activeAccount?.address) return

    try {
      const response = await fetch(`/api/user-degen-balance?walletAddress=${activeAccount.address}`)
      const data = await response.json()
      if (data.success) {
        setDegenBalance(data.data.degenBalance)
      }
    } catch (error) {
      console.error('Failed to fetch DEGEN balance:', error)
    }
  }

  useEffect(() => {
    if (battleActive && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
        // Simulate price changes
        updatePrices()
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      endBattle()
    }
  }, [battleActive, timeLeft])

  const generateOpponentTeam = async () => {
    try {
      const response = await fetch('/api/meme-coins')
      const data = await response.json()
      const coins = data.coins || []
      
      // Smart opponent selection based on market cap and recent performance
      const strategies = ['conservative', 'aggressive', 'balanced']
      const strategy = strategies[Math.floor(Math.random() * strategies.length)]
      setOpponentStrategy(strategy)
      
      let selectedCoins: any[] = []
      if (strategy === 'conservative') {
        // Pick top market cap coins
        selectedCoins = coins.filter((c: any) => c.rank <= 30).slice(0, 3)
      } else if (strategy === 'aggressive') {
        // Pick smaller cap, more volatile coins
        selectedCoins = coins.filter((c: any) => c.rank > 30).slice(0, 3)
      } else {
        // Balanced mix
        const topCoin = coins.find((c: any) => c.rank <= 20)
        const midCoin = coins.find((c: any) => c.rank > 20 && c.rank <= 50)
        const smallCoin = coins.find((c: any) => c.rank > 50)
        selectedCoins = [topCoin, midCoin, smallCoin].filter(Boolean)
      }
      
      const randomTeam = selectedCoins.map(coin => ({
        ...coin,
        initialPrice: coin.price,
        currentPrice: coin.price
      }))
      
      setOpponentTeam(randomTeam)
    } catch (error) {
      console.error('Failed to generate opponent team:', error)
    }
  }

  const updatePrices = async () => {
    try {
      const allCoins = [...playerTeam, ...opponentTeam]
      const symbols = [...new Set(allCoins.map(coin => coin.ticker))]
      
      const response = await fetch('/api/battle-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols })
      })
      
      const data = await response.json()
      const prices = data.prices || {}
      
      let updatedPlayerTeam: any[] = []
      let updatedOpponentTeam: any[] = []
      
      setPlayerTeam(prev => {
        updatedPlayerTeam = prev.map(coin => ({
          ...coin,
          currentPrice: prices[coin.ticker] || coin.currentPrice
        }))
        return updatedPlayerTeam
      })
      
      setOpponentTeam(prev => {
        updatedOpponentTeam = prev.map(coin => ({
          ...coin,
          currentPrice: prices[coin.ticker] || coin.currentPrice
        }))
        return updatedOpponentTeam
      })
      
      setTimeout(() => {
        if (updatedPlayerTeam.length > 0 && updatedOpponentTeam.length > 0) {
          const playerCurrentScore = calculateTeamScore(updatedPlayerTeam)
          const opponentCurrentScore = calculateTeamScore(updatedOpponentTeam)
          
          setPlayerScore(playerCurrentScore)
          setOpponentScore(opponentCurrentScore)
          
          setPriceHistory(prev => [...prev, {
            time: 60 - timeLeft,
            you: Number(playerCurrentScore.toFixed(4)),
            opponent: Number(opponentCurrentScore.toFixed(4))
          }])
          
          // Dynamic battle intensity based on score difference
          const scoreDiff = Math.abs(playerCurrentScore - opponentCurrentScore)
          setBattleIntensity(scoreDiff > 2 ? 3 : scoreDiff > 1 ? 2 : 1)
        }
      }, 100)
      
    } catch (error) {
      console.error('Price update failed:', error)
    }
  }

  const calculateTeamScore = (team: any[]) => {
    if (!team || team.length === 0) return 0
    return team.reduce((total, coin) => {
      if (!coin.initialPrice || !coin.currentPrice) return total
      const change = ((coin.currentPrice - coin.initialPrice) / coin.initialPrice) * 100
      return total + change
    }, 0) / team.length
  }

  const startBattle = async () => {
    if (playerTeam.length !== 3 || !activeAccount?.address) return
    if (degenBalance < stakeAmount) {
      alert('Insufficient DEGEN balance! You need at least ' + stakeAmount + ' DEGEN to battle.')
      return
    }

    try {
      // Create battle stake first
      const stakeResponse = await fetch('/api/battle-stake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: activeAccount.address,
          stakeAmount,
          battleType: 'ai'
        })
      })

      const stakeData = await stakeResponse.json()
      if (!stakeData.success) {
        alert('Failed to create stake: ' + stakeData.error)
        return
      }

      setCurrentBattleId(stakeData.data.battleId)
      setDegenBalance(prev => prev - stakeAmount) // Update local balance

      // Initialize battle
      setBattleActive(true)
      setTimeLeft(60)
      setWinner(null)
      setPriceHistory([])
      setPlayerScore(0)
      setOpponentScore(0)

      // Initialize with current API prices
      setPlayerTeam(prev => prev.map(coin => ({
        ...coin,
        initialPrice: coin.price || 0.1,
        currentPrice: coin.price || 0.1
      })))

      setOpponentTeam(prev => prev.map(coin => ({
        ...coin,
        initialPrice: coin.price || 0.1,
        currentPrice: coin.price || 0.1
      })))

      setTimeout(() => {
        const initialPlayerScore = calculateTeamScore(playerTeam)
        const initialOpponentScore = calculateTeamScore(opponentTeam)
        setPriceHistory([{time: 0, you: Number(initialPlayerScore.toFixed(4)), opponent: Number(initialOpponentScore.toFixed(4))}])
      }, 100)

    } catch (error) {
      console.error('Failed to start battle:', error)
      alert('Failed to start battle. Please try again.')
    }
  }

  const endBattle = async () => {
    setBattleActive(false)
    const playerFinalScore = calculateTeamScore(playerTeam)
    const opponentFinalScore = calculateTeamScore(opponentTeam)

    setPlayerScore(playerFinalScore)
    setOpponentScore(opponentFinalScore)

    const newTotalBattles = totalBattles + 1
    setTotalBattles(newTotalBattles)
    localStorage.setItem('totalBattles', newTotalBattles.toString())

    let battleResult = 'tie'
    if (playerFinalScore > opponentFinalScore) {
      setWinner('player')
      battleResult = 'win'
      const newStreak = winStreak + 1
      const newWins = totalWins + 1
      setWinStreak(newStreak)
      setTotalWins(newWins)
      localStorage.setItem('winStreak', newStreak.toString())
      localStorage.setItem('totalWins', newWins.toString())
    } else if (opponentFinalScore > playerFinalScore) {
      setWinner('opponent')
      battleResult = 'loss'
      setWinStreak(0)
      localStorage.setItem('winStreak', '0')
    } else {
      setWinner('tie')
      battleResult = 'tie'
    }

    // Settle battle stake and award winner
    if (currentBattleId && activeAccount?.address) {
      try {
        const settlementResponse = await fetch('/api/battle-stake', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            battleId: currentBattleId,
            winnerAddress: battleResult === 'win' ? activeAccount.address : 'ai_opponent',
            loserAddress: battleResult === 'loss' ? activeAccount.address : 'ai_opponent',
            stakeAmount
          })
        })

        const settlementData = await settlementResponse.json()
        if (settlementData.success) {
          // Update local balance based on result
          if (battleResult === 'win') {
            setDegenBalance(prev => prev + stakeAmount * 2) // Get stake back + opponent's stake
          } else if (battleResult === 'tie') {
            setDegenBalance(prev => prev + stakeAmount) // Get stake back
          }
          // If loss, stake is already deducted
        }
      } catch (error) {
        console.error('Failed to settle battle stake:', error)
      }
    }

    // Save battle to database
    try {
      if (activeAccount?.address) {
        const userResponse = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: activeAccount.address })
        })

        const userData = await userResponse.json()
        if (userData.success && userData.data) {
          await fetch('/api/meme-battles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: userData.data.id,
              teamData: { playerTeam, opponentTeam },
              opponentStrategy,
              playerScore: playerFinalScore,
              opponentScore: opponentFinalScore,
              result: battleResult,
              stakeAmount,
              battleId: currentBattleId
            })
          })
        }
      }
    } catch (error) {
      console.error('Failed to save battle:', error)
    }

    // Reset battle ID
    setCurrentBattleId(null)
  }

  if (!activeAccount?.address) {
    return (
      <AppLayout>
        <BattleContainer>
          <BattleHeader>
            <BattleTitle>
              <IconWrapper>
                <FontAwesomeIcon icon={faLink} />
              </IconWrapper>
              CONNECT WALLET
            </BattleTitle>
            <p style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', margin: '10px 0 0 0' }}>
              Connect your wallet to start battling!
            </p>
          </BattleHeader>
        </BattleContainer>
      </AppLayout>
    )
  }

  if (playerTeam.length !== 3) {
    return (
      <AppLayout>
        <BattleContainer>
          <BattleHeader>
            <BattleTitle>
              <IconWrapper>
                <FontAwesomeIcon icon={faExclamationTriangle} />
              </IconWrapper>
              NO TEAM SELECTED
            </BattleTitle>
            <p style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', margin: '10px 0 0 0' }}>
              Go to Team page and select 3 meme coins first!
            </p>
          </BattleHeader>
        </BattleContainer>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <BattleContainer>
        <BattleHeader>
          <BattleTitle>
            <IconWrapper>
              <FontAwesomeIcon icon={faCrosshairs} />
            </IconWrapper>
            MEME COIN BATTLE
          </BattleTitle>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '12px', fontSize: '14px', fontFamily: 'var(--font-mono)' }}>
            <div>
              <IconWrapper>
                <FontAwesomeIcon icon={faTrophy} />
              </IconWrapper>
              Streak: {winStreak}
            </div>
            <div>
              <IconWrapper>
                <FontAwesomeIcon icon={faChartBar} />
              </IconWrapper>
              Battles: {totalBattles}
            </div>
            <div>
              <IconWrapper>
                <FontAwesomeIcon icon={faChartLine} />
              </IconWrapper>
              Win Rate: {totalBattles > 0 ? ((totalWins / totalBattles) * 100).toFixed(1) : 0}%
            </div>
            <div>
              <IconWrapper>
                <FontAwesomeIcon icon={faCoins} />
              </IconWrapper>
              DEGEN: {degenBalance.toFixed(2)}
            </div>
          </div>

          {!battleActive && (
            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <div style={{ marginBottom: '12px', fontSize: '16px', fontFamily: 'var(--font-mono)' }}>
                <label style={{ color: 'var(--text-primary)' }}>
                  Stake Amount: {stakeAmount} DEGEN
                </label>
                <input
                  type="range"
                  min="10"
                  max={Math.min(degenBalance, 100)}
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(Number(e.target.value))}
                  style={{ marginLeft: '12px', width: '120px' }}
                />
              </div>
              <Button onClick={startBattle} style={{ fontSize: '18px' }}>
                <IconWrapper>
                  <FontAwesomeIcon icon={faCrosshairs} />
                </IconWrapper>
                START BATTLE ({stakeAmount} DEGEN STAKE)
              </Button>
            </div>
          )}

          {battleActive && (
            <Timer>{Math.floor(timeLeft/60)}:{(timeLeft%60).toString().padStart(2,'0')}</Timer>
          )}
        </BattleHeader>

        <TeamsContainer>
          <TeamSection>
            <TeamTitle>
              <IconWrapper>
                <FontAwesomeIcon icon={faUser} />
              </IconWrapper>
              YOUR TEAM
            </TeamTitle>
            {playerTeam.map((coin, index) => (
              <CoinItem key={index}>
                <CoinName>{coin.name || coin.ticker}</CoinName>
                {battleActive && (
                  <PriceChange $positive={(coin.currentPrice - coin.initialPrice) >= 0}>
                    {((coin.currentPrice - coin.initialPrice) / coin.initialPrice * 100).toFixed(4)}%
                  </PriceChange>
                )}
              </CoinItem>
            ))}
            {winner && (
              <div style={{ marginTop: '16px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 900 }}>
                Score: {playerScore.toFixed(4)}%
              </div>
            )}
          </TeamSection>

          <TeamSection>
            <TeamTitle>
              <IconWrapper>
                <FontAwesomeIcon icon={faRobot} />
              </IconWrapper>
              OPPONENT ({opponentStrategy.toUpperCase()})
              {battleActive && (
                <div style={{ fontSize: '12px', marginTop: '4px', color: '#888' }}>
                  {battleIntensity === 3 ? (
                    <>
                      <IconWrapper>
                        <FontAwesomeIcon icon={faFire} />
                      </IconWrapper>
                      INTENSE
                    </>
                  ) : battleIntensity === 2 ? (
                    <>
                      <IconWrapper>
                        <FontAwesomeIcon icon={faBolt} />
                      </IconWrapper>
                      HEATED
                    </>
                  ) : (
                    <>
                      <IconWrapper>
                        <FontAwesomeIcon icon={faGauge} />
                      </IconWrapper>
                      STEADY
                    </>
                  )}
                </div>
              )}
            </TeamTitle>
            {opponentTeam.map((coin, index) => (
              <CoinItem key={index}>
                <CoinName>{coin.name || coin.ticker}</CoinName>
                {battleActive && (
                  <PriceChange $positive={(coin.currentPrice - coin.initialPrice) >= 0}>
                    {((coin.currentPrice - coin.initialPrice) / coin.initialPrice * 100).toFixed(4)}%
                  </PriceChange>
                )}
              </CoinItem>
            ))}
            {winner && (
              <div style={{ marginTop: '16px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 900 }}>
                Score: {opponentScore.toFixed(4)}%
              </div>
            )}
          </TeamSection>
        </TeamsContainer>

        {winner && (
          <>
            <WinnerSection $winner={winner === 'player'}>
              <WinnerText>
                {winner === 'player' ? (
                  <>
                    <IconWrapper>
                      <FontAwesomeIcon icon={faCrown} />
                    </IconWrapper>
                    YOU WIN!
                  </>
                ) : winner === 'opponent' ? (
                  <>
                    <IconWrapper>
                      <FontAwesomeIcon icon={faExclamationTriangle} />
                    </IconWrapper>
                    YOU LOSE!
                  </>
                ) : (
                  <>
                    <IconWrapper>
                      <FontAwesomeIcon icon={faHandshake} />
                    </IconWrapper>
                    TIE!
                  </>
                )}
              </WinnerText>
              <div style={{ marginTop: '16px', fontSize: '18px', fontFamily: 'var(--font-mono)' }}>
                Final Score: {playerScore.toFixed(4)}% vs {opponentScore.toFixed(4)}%
              </div>
              <div style={{ marginTop: '12px', fontSize: '16px', fontFamily: 'var(--font-mono)', color: winner === 'player' ? 'var(--primary-green)' : winner === 'tie' ? 'var(--text-primary)' : 'var(--brutal-red)' }}>
                {winner === 'player' && (
                  <>
                    <IconWrapper>
                      <FontAwesomeIcon icon={faCoins} />
                    </IconWrapper>
                    +{stakeAmount * 2} DEGEN (stake returned + opponent's stake)
                  </>
                )}
                {winner === 'tie' && (
                  <>
                    <IconWrapper>
                      <FontAwesomeIcon icon={faCoins} />
                    </IconWrapper>
                    +{stakeAmount} DEGEN (stake returned)
                  </>
                )}
                {winner === 'opponent' && (
                  <>
                    <IconWrapper>
                      <FontAwesomeIcon icon={faExclamationTriangle} />
                    </IconWrapper>
                    -{stakeAmount} DEGEN (stake lost)
                  </>
                )}
              </div>
            </WinnerSection>
            <Button
              onClick={() => navigator.share ? navigator.share({title: 'Meme Coin Battle Result', text: `I ${winner === 'player' ? 'won' : 'lost'} a ${stakeAmount} DEGEN stake with ${playerScore.toFixed(4)}% vs ${opponentScore.toFixed(4)}%!`}) : null}
              style={{ marginTop: '16px', fontSize: '18px' }}
            >
              <IconWrapper>
                <FontAwesomeIcon icon={faShare} />
              </IconWrapper>
              SHARE RESULTS
            </Button>
          </>
        )}

        <GraphContainer>
          {priceHistory.length > 1 ? (
            <div style={{ 
              background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)', 
              padding: '16px', 
              borderRadius: '20px', 
              border: '4px solid var(--border-primary)', 
              position: 'relative', 
              overflow: 'hidden',
              boxShadow: '0 0 30px rgba(0, 255, 65, 0.1), inset 0 0 30px rgba(255, 20, 147, 0.05)',
              width: '100%',
              maxWidth: '100%'
            }}>
              {/* Battle Intensity Indicator */}
              <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '4px' }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    background: i <= battleIntensity ? '#ff4444' : '#333',
                    boxShadow: i <= battleIntensity ? '0 0 8px #ff4444' : 'none'
                  }} />
                ))}
              </div>
              
              {/* Strategy Display */}
              <div style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '12px', color: '#888', fontFamily: 'var(--font-mono)' }}>
                <IconWrapper>
                  <FontAwesomeIcon icon={faRobot} />
                </IconWrapper>
                {opponentStrategy.toUpperCase()} STRATEGY
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '80px', marginBottom: '32px' }}>
                <div style={{ 
                  color: '#00ff41', 
                  fontSize: '32px', 
                  fontWeight: '900', 
                  fontFamily: 'var(--font-mono)',
                  textShadow: '0 0 20px #00ff41, 0 0 40px #00ff41',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 20px',
                  background: playerScore >= opponentScore ? 'rgba(0, 255, 65, 0.1)' : 'rgba(0, 255, 65, 0.05)',
                  border: '2px solid #00ff41',
                  borderRadius: '12px'
                }}>
                  {playerScore >= opponentScore ? (
                    <>
                      <IconWrapper>
                        <FontAwesomeIcon icon={faRocket} />
                      </IconWrapper>
                      YOU
                    </>
                  ) : (
                    <>
                      <IconWrapper>
                        <FontAwesomeIcon icon={faChartSimple} />
                      </IconWrapper>
                      YOU
                    </>
                  )}: {playerScore.toFixed(4)}%
                </div>
                <div style={{ 
                  color: '#ff1493', 
                  fontSize: '32px', 
                  fontWeight: '900', 
                  fontFamily: 'var(--font-mono)',
                  textShadow: '0 0 20px #ff1493, 0 0 40px #ff1493',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 20px',
                  background: opponentScore >= playerScore ? 'rgba(255, 20, 147, 0.1)' : 'rgba(255, 20, 147, 0.05)',
                  border: '2px solid #ff1493',
                  borderRadius: '12px'
                }}>
                  {opponentScore >= playerScore ? (
                    <>
                      <IconWrapper>
                        <FontAwesomeIcon icon={faFire} />
                      </IconWrapper>
                      AI
                    </>
                  ) : (
                    <>
                      <IconWrapper>
                        <FontAwesomeIcon icon={faRobot} />
                      </IconWrapper>
                      AI
                    </>
                  )}: {opponentScore.toFixed(4)}%
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={320} maxHeight={320}>
                <LineChart data={priceHistory} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#444" opacity={0.3} />
                  <XAxis 
                    dataKey="time" 
                    stroke="#00ff41" 
                    fontSize={14}
                    fontFamily="var(--font-mono)"
                    tickFormatter={(value) => `${value}s`}
                    axisLine={{ stroke: '#00ff41', strokeWidth: 2 }}
                    tickLine={{ stroke: '#00ff41' }}
                  />
                  <YAxis 
                    stroke="#ff1493" 
                    fontSize={14}
                    fontFamily="var(--font-mono)"
                    tickFormatter={(value) => `${value.toFixed(3)}%`}
                    domain={['dataMin - 0.05', 'dataMax + 0.05']}
                    axisLine={{ stroke: '#ff1493', strokeWidth: 2 }}
                    tickLine={{ stroke: '#ff1493' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(26, 26, 46, 0.95)', 
                      border: '3px solid #00ff41', 
                      borderRadius: '12px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '14px',
                      fontWeight: '900',
                      boxShadow: '0 0 20px rgba(0, 255, 65, 0.3)'
                    }}
                    formatter={(value: any, name: string) => [
                      `${Number(value).toFixed(4)}%`,
                      name === 'you' ? (
                        <>
                          <IconWrapper>
                            <FontAwesomeIcon icon={faRocket} />
                          </IconWrapper>
                          YOU
                        </>
                      ) : (
                        <>
                          <IconWrapper>
                            <FontAwesomeIcon icon={faRobot} />
                          </IconWrapper>
                          AI
                        </>
                      )
                    ]}
                    labelFormatter={(label) => (
                      <>
                        <IconWrapper>
                          <FontAwesomeIcon icon={faBolt} />
                        </IconWrapper>
                        {label}s
                      </>
                    )}
                    labelStyle={{ color: '#fff', fontWeight: '900' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="you" 
                    stroke="#00ff41" 
                    strokeWidth={4}
                    dot={{ fill: '#00ff41', strokeWidth: 3, r: 5, filter: 'drop-shadow(0 0 6px #00ff41)' }}
                    activeDot={{ r: 8, stroke: '#00ff41', strokeWidth: 3, fill: '#00ff88', filter: 'drop-shadow(0 0 10px #00ff41)' }}
                    name="you"
                    filter="drop-shadow(0 0 4px #00ff41)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="opponent" 
                    stroke="#ff1493" 
                    strokeWidth={4}
                    dot={{ fill: '#ff1493', strokeWidth: 3, r: 5, filter: 'drop-shadow(0 0 6px #ff1493)' }}
                    activeDot={{ r: 8, stroke: '#ff1493', strokeWidth: 3, fill: '#ff4488', filter: 'drop-shadow(0 0 10px #ff1493)' }}
                    name="opponent"
                    filter="drop-shadow(0 0 4px #ff1493)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              color: 'var(--text-primary)', 
              fontFamily: 'var(--font-mono)', 
              paddingTop: '120px',
              background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)',
              borderRadius: '20px',
              border: '4px solid var(--border-primary)',
              boxShadow: '0 0 30px rgba(0, 255, 65, 0.1)'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '24px', textShadow: '0 0 20px #00ff41' }}>
                <FontAwesomeIcon icon={faBolt} />
              </div>
              <div style={{ fontSize: '24px', fontWeight: '900', textShadow: '0 0 10px currentColor' }}>BATTLE INITIALIZING...</div>
              <div style={{ fontSize: '16px', color: '#00ff41', marginTop: '12px', textShadow: '0 0 8px #00ff41' }}>Real-time price tracking starting</div>
            </div>
          )}
        </GraphContainer>
      </BattleContainer>
    </AppLayout>
  )
}