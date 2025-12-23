"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "../../components/layout/AppLayout"
import styled from "styled-components"
import { Card, Button } from "../../components/styled/GlobalStyles"
import { MemeCard } from "../../components/meme/MemeCard"
import { useWallet } from "@txnlab/use-wallet-react"
import { CoinGridSkeleton } from "../../components/ui/skeleton"
import { useSimpleApi } from "../../hooks/useApi"
import { ErrorBoundary } from "../../components/ErrorBoundary"

const TeamContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--mobile-gap);
  padding-bottom: 120px; /* Account for bottom navigation */

  @media (max-width: 768px) {
    gap: var(--mobile-gap);
    padding-bottom: 100px;
  }

  @media (max-width: 480px) {
    gap: var(--mobile-gap);
    padding-bottom: 80px;
  }
`

const TeamHeader = styled.div`
  text-align: center;
  background: linear-gradient(135deg, var(--brutal-violet) 0%, var(--brutal-red) 100%);
  padding: 32px;
  border: 4px solid var(--border-primary);
  box-shadow: 8px 8px 0px 0px var(--border-primary);
  font-family: var(--font-mono);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%);
    animation: shine 3s infinite;
  }
  
  @keyframes shine {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`

const TeamTitle = styled.h1`
  font-size: 40px;
  font-weight: 900;
  color: var(--text-primary);
  margin: 0 0 16px 0;
  text-transform: uppercase;
  letter-spacing: 4px;
  text-shadow: 0 0 20px #00ff41, 2px 2px 0px var(--border-primary);
  position: relative;
  z-index: 1;
`

const TeamSubtitle = styled.p`
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0 0 10px #ff1493;
  position: relative;
  z-index: 1;
`

const CurrentTeamSection = styled.div`
  background: var(--light-bg);
  border: 4px solid var(--border-primary);
  padding: 24px;
  box-shadow: 4px 4px 0px 0px var(--border-primary);
`

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 900;
  color: var(--text-primary);
  margin: 0 0 16px 0;
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 2px;
  background: var(--brutal-cyan);
  padding: 8px 16px;
  border: 3px solid var(--border-primary);
  display: inline-block;
`

const TeamSlots = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--mobile-gap);
  margin-bottom: var(--mobile-margin);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--mobile-gap);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: var(--mobile-gap);
  }
`

const TeamSlot = styled.div<{ $filled?: boolean }>`
  background: ${props => props.$filled ? "var(--brutal-lime)" : "var(--light-bg)"};
  border: 4px solid var(--border-primary);
  padding: 12px;
  text-align: center;
  min-height: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  cursor: ${props => props.$filled ? "pointer" : "default"};
  transition: all 0.1s ease;
  box-shadow: 2px 2px 0px 0px var(--border-primary);
  
  &:hover {
    transform: ${props => props.$filled ? "translate(1px, 1px)" : "none"};
    box-shadow: ${props => props.$filled ? "1px 1px 0px 0px var(--border-primary)" : "2px 2px 0px 0px var(--border-primary)"};
  }
`

const SlotIcon = styled.div`
  font-size: 24px;
  margin-bottom: 4px;
`

const SlotText = styled.div`
  font-size: 12px;
  font-weight: 900;
  color: var(--text-primary);
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const BeastName = styled.div`
  font-size: 14px;
  font-weight: 900;
  color: var(--text-primary);
  font-family: var(--font-mono);
  text-transform: uppercase;
  margin-bottom: 4px;
`

const BeastLevel = styled.div`
  font-size: 10px;
  font-weight: 900;
  color: var(--text-primary);
  font-family: var(--font-mono);
  background: var(--brutal-pink);
  padding: 2px 6px;
  border: 2px solid var(--border-primary);
`

const MyBeastsSection = styled.div`
  background: var(--light-bg);
  border: 4px solid var(--border-primary);
  padding: 24px;
  box-shadow: 4px 4px 0px 0px var(--border-primary);
`

const BeastGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--mobile-gap);

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: var(--mobile-gap);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: var(--mobile-gap);
  }
`

const SaveTeamButton = styled(Button)`
  background: var(--brutal-lime);
  font-size: 18px;
  padding: 16px 32px;
  margin-top: 20px;
  
  &:hover {
    background: var(--brutal-cyan);
  }
`

const SelectableCoinCard = styled.div<{ $selected: boolean }>`
  cursor: pointer;
  border: ${props => props.$selected ? '4px solid #00ff41' : '2px solid transparent'};
  background: ${props => props.$selected ? 'rgba(0, 255, 65, 0.1)' : 'transparent'};
  padding: ${props => props.$selected ? '4px' : '6px'};
  transition: all 0.2s ease;
  border-radius: 12px;
  position: relative;
  
  ${props => props.$selected && `
    box-shadow: 0 0 20px rgba(0, 255, 65, 0.3), inset 0 0 20px rgba(0, 255, 65, 0.1);
    
    &::before {
      content: '✓';
      position: absolute;
      top: 8px;
      left: 8px;
      background: #00ff41;
      color: #000;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 14px;
      z-index: 10;
      box-shadow: 0 0 10px #00ff41;
    }
  `}
  
  &:hover {
    background: ${props => props.$selected ? 'rgba(0, 255, 65, 0.15)' : 'rgba(0, 255, 65, 0.05)'};
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 255, 65, 0.2);
  }
`

export default function TeamPage() {
  return (
    <ErrorBoundary>
      <TeamPageContent />
    </ErrorBoundary>
  )
}

function TeamPageContent() {
  const [currentTeam, setCurrentTeam] = useState<any[]>([null, null, null])
  const [selectedCoins, setSelectedCoins] = useState<number[]>([])
  const [memeCoins, setMemeCoins] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [favoriteCoins, setFavoriteCoins] = useState<number[]>([])
  const [teamPresets, setTeamPresets] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const { activeAccount } = useWallet()
  const { loading: apiLoading, error: apiError, call: apiCall } = useSimpleApi()

  const fetchMemeCoins = async (search = '') => {
    const url = search ? `/api/meme-coins?search=${encodeURIComponent(search)}` : '/api/meme-coins'
    const result = await apiCall(async () => {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch meme coins')
      }
      const data = await response.json()
      return data.coins || []
    })

    if (result && Array.isArray(result)) {
      setMemeCoins(result)
    }
  }

  useEffect(() => {
    fetchMemeCoins()
  }, [])
  
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchMemeCoins(searchTerm)
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }, [searchTerm])
  
  useEffect(() => {
    if (activeAccount?.address) {
      initializeUser()
    }
  }, [activeAccount?.address])
  
  const initializeUser = async () => {
    try {
      if (!activeAccount?.address) return
      
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: activeAccount.address, walletAddress: activeAccount.address })
      })
      
      const data = await response.json()
      const user = data.data || data.user
      if (user) {
        setCurrentUser(user)
        setFavoriteCoins(user.favorites?.map((f: any) => f.coinId) || [])
        setTeamPresets(user.presets || [])
      }
    } catch (error) {
      console.error('Failed to initialize user:', error)
    }
  }

  const handleCoinSelect = (coinId: number) => {
    const coin = memeCoins.find(c => c.id === coinId)
    if (!coin) return
    
    if (selectedCoins.includes(coinId)) {
      const newTeam = currentTeam.map(slot => slot?.id === coinId ? null : slot)
      setCurrentTeam(newTeam)
      setSelectedCoins(prev => prev.filter(id => id !== coinId))
    } else if (selectedCoins.length < 3) {
      const emptySlotIndex = currentTeam.findIndex(slot => slot === null)
      if (emptySlotIndex !== -1) {
        const newTeam = [...currentTeam]
        newTeam[emptySlotIndex] = coin
        setCurrentTeam(newTeam)
        setSelectedCoins(prev => [...prev, coinId])
      }
    }
  }

  const handleSlotClick = (index: number) => {
    if (currentTeam[index]) {
      const coinId = currentTeam[index].id
      const newTeam = [...currentTeam]
      newTeam[index] = null
      setCurrentTeam(newTeam)
      setSelectedCoins(prev => prev.filter(id => id !== coinId))
    }
  }

  const handleSaveTeam = () => {
    if (currentTeam.filter(Boolean).length !== 3) return
    localStorage.setItem('selectedTeam', JSON.stringify(currentTeam.filter(Boolean)))
    // Show success message before redirecting
    alert('✅ Team saved successfully! Redirecting to battle...')
    window.location.href = '/battle'
  }
  
  const toggleFavorite = async (coinId: number, coinName: string) => {
    if (!currentUser) return
    
    try {
      if (favoriteCoins.includes(coinId)) {
        await fetch('/api/favorites', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser.id, coinId })
        })
        setFavoriteCoins(favoriteCoins.filter(id => id !== coinId))
      } else {
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser.id, coinId, coinName })
        })
        setFavoriteCoins([...favoriteCoins, coinId])
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }
  
  const saveTeamPreset = async () => {
    if (!currentUser || currentTeam.filter(Boolean).length !== 3) return
    
    try {
      const response = await fetch('/api/presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          name: `Team ${teamPresets.length + 1}`,
          coins: currentTeam.filter(Boolean)
        })
      })
      
      const data = await response.json()
      if (data.preset) {
        setTeamPresets([...teamPresets, data.preset])
      }
    } catch (error) {
      console.error('Failed to save preset:', error)
    }
  }
  
  const loadTeamPreset = (preset: any) => {
    const coins = [
      { id: preset.coin1Id, ticker: preset.coin1Name },
      { id: preset.coin2Id, ticker: preset.coin2Name },
      { id: preset.coin3Id, ticker: preset.coin3Name }
    ]
    setCurrentTeam(coins)
    setSelectedCoins([preset.coin1Id, preset.coin2Id, preset.coin3Id])
  }

  if (!activeAccount?.address) {
    return (
      <AppLayout>
        <TeamContainer>
          <TeamHeader>
            <TeamTitle>🔗 CONNECT WALLET</TeamTitle>
            <TeamSubtitle>Connect your wallet to build your team</TeamSubtitle>
          </TeamHeader>
        </TeamContainer>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <TeamContainer>
        <TeamHeader>
          <TeamTitle>⚔️ MEME COIN BATTLE</TeamTitle>
          <TeamSubtitle>Select 3 meme coins and battle other players</TeamSubtitle>
        </TeamHeader>

        <CurrentTeamSection>
          <SectionTitle>CURRENT TEAM</SectionTitle>
          <TeamSlots>
            {currentTeam.map((coin, index) => (
              <TeamSlot 
                key={index} 
                $filled={!!currentTeam[index]}
                onClick={() => handleSlotClick(index)}
              >
                {currentTeam[index] ? (
                  <>
                    <SlotIcon>
                      {coin.image ? (
                        <img
                          src={coin.image}
                          alt={coin.name}
                          style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                      ) : (
                        '🪙'
                      )}
                    </SlotIcon>
                    <div>
                      <BeastName>{coin.ticker}</BeastName>
                      <BeastLevel>${coin.price?.toFixed(6) || '0'}</BeastLevel>
                    </div>
                  </>
                ) : (
                  <>
                    <SlotIcon>➕</SlotIcon>
                    <SlotText>EMPTY SLOT</SlotText>
                  </>
                )}
              </TeamSlot>
            ))}
          </TeamSlots>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <SaveTeamButton
              style={{ flex: 1 }}
              disabled={currentTeam.filter(Boolean).length !== 3}
              onClick={handleSaveTeam}
            >
              💾 SAVE & START BATTLE ({currentTeam.filter(Boolean).length}/3)
            </SaveTeamButton>
            <Button
              disabled={currentTeam.filter(Boolean).length !== 3}
              onClick={saveTeamPreset}
              style={{ background: 'var(--brutal-orange)', fontSize: '14px', padding: '16px' }}
            >
              💾 SAVE
            </Button>
          </div>
          
          {teamPresets.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: '900', marginBottom: '8px', color: 'var(--text-primary)' }}>SAVED TEAMS:</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {teamPresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => loadTeamPreset(preset)}
                    style={{
                      background: 'var(--brutal-cyan)',
                      border: '2px solid var(--border-primary)',
                      padding: '8px 12px',
                      fontSize: '12px',
                      fontWeight: '900',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-mono)'
                    }}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </CurrentTeamSection>

        <MyBeastsSection>
          <SectionTitle>AVAILABLE MEME COINS</SectionTitle>
          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="Search coins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '3px solid var(--border-primary)',
                background: 'var(--light-bg)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontWeight: '700',
                fontSize: '14px',
                textTransform: 'uppercase',
                boxShadow: '3px 3px 0px 0px var(--border-primary)'
              }}
            />
          </div>
          <BeastGrid>
            {apiLoading ? (
              <CoinGridSkeleton />
            ) : apiError ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-primary)' }}>
                <h3>⚠️ Failed to Load Coins</h3>
                <p>{apiError}</p>
                <Button onClick={() => fetchMemeCoins(searchTerm)} style={{ marginTop: '10px' }}>
                  🔄 RETRY
                </Button>
              </div>
            ) : memeCoins.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-primary)' }}>
                <h3>🪙 No Meme Coins Found</h3>
                <p>No meme coins available at the moment. Check back later!</p>
              </div>
            ) : (
              memeCoins.map((coin, index) => (
                <SelectableCoinCard 
                  key={`${coin.id}-${index}`}
                  $selected={selectedCoins.includes(coin.id)}
                  onClick={() => handleCoinSelect(coin.id)}
                >
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite(coin.id, coin.ticker)
                      }}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: favoriteCoins.includes(coin.id) ? 'rgba(255, 215, 0, 0.2)' : 'rgba(0, 0, 0, 0.5)',
                        border: '2px solid ' + (favoriteCoins.includes(coin.id) ? '#ffd700' : '#666'),
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        fontSize: '16px',
                        cursor: 'pointer',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                        boxShadow: favoriteCoins.includes(coin.id) ? '0 0 10px rgba(255, 215, 0, 0.5)' : 'none'
                      }}
                    >
                      {favoriteCoins.includes(coin.id) ? '⭐' : '☆'}
                    </button>
                    <MemeCard asset={coin} />
                  </div>
                </SelectableCoinCard>
              ))
            )}
          </BeastGrid>
        </MyBeastsSection>
      </TeamContainer>
    </AppLayout>
  )
}