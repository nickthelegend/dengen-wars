"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@txnlab/use-wallet-react"
import { AppLayout } from "../components/layout/AppLayout"
import styled from "styled-components"
import { Button } from "../components/styled/GlobalStyles"
import { useRouter } from "next/navigation"
import { brutalToast } from "../components/ui/BrutalToast"

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-bottom: 20px;
`

const HeroSection = styled.div`
  text-align: center;
  background: var(--brutal-yellow);
  padding: 40px 20px;
  border: 4px solid var(--border-primary);
  box-shadow: 8px 8px 0px 0px var(--border-primary);
  
  @media (max-width: 768px) {
    padding: 32px 16px;
    border-width: 3px;
    box-shadow: 6px 6px 0px 0px var(--border-primary);
  }
`

const HeroTitle = styled.h1`
  font-size: 48px;
  font-weight: 900;
  color: var(--text-primary);
  margin: 0 0 16px 0;
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 4px;
  
  @media (max-width: 768px) {
    font-size: 36px;
    letter-spacing: 2px;
  }
  
  @media (max-width: 480px) {
    font-size: 28px;
    letter-spacing: 1px;
  }
`

const HeroSubtitle = styled.p`
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 32px 0;
  font-family: var(--font-mono);
  
  @media (max-width: 768px) {
    font-size: 16px;
    margin-bottom: 24px;
  }
  
  @media (max-width: 480px) {
    font-size: 14px;
    margin-bottom: 20px;
  }
`

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`

const ActionCard = styled.div<{ $color: string }>`
  background: ${props => props.$color};
  border: 4px solid var(--border-primary);
  padding: 24px;
  box-shadow: 6px 6px 0px 0px var(--border-primary);
  cursor: pointer;
  transition: all 0.1s ease;
  
  &:hover {
    transform: translate(2px, 2px);
    box-shadow: 4px 4px 0px 0px var(--border-primary);
  }
  
  @media (max-width: 768px) {
    border-width: 3px;
    padding: 20px;
    box-shadow: 4px 4px 0px 0px var(--border-primary);
    
    &:hover {
      transform: translate(1px, 1px);
      box-shadow: 3px 3px 0px 0px var(--border-primary);
    }
  }
  
  @media (max-width: 480px) {
    border-width: 2px;
    padding: 16px;
    box-shadow: 2px 2px 0px 0px var(--border-primary);
    
    &:hover {
      transform: none;
      box-shadow: 2px 2px 0px 0px var(--border-primary);
    }
  }
`

const CardIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    font-size: 40px;
    margin-bottom: 12px;
  }
  
  @media (max-width: 480px) {
    font-size: 36px;
    margin-bottom: 10px;
  }
`

const CardTitle = styled.h3`
  font-size: 20px;
  font-weight: 900;
  color: var(--text-primary);
  margin: 0 0 12px 0;
  font-family: var(--font-mono);
  text-transform: uppercase;
  
  @media (max-width: 768px) {
    font-size: 18px;
    margin-bottom: 10px;
  }
  
  @media (max-width: 480px) {
    font-size: 16px;
    margin-bottom: 8px;
  }
`

const CardDescription = styled.p`
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 20px 0;
  font-family: var(--font-mono);
  line-height: 1.4;
  
  @media (max-width: 768px) {
    font-size: 13px;
    margin-bottom: 16px;
  }
  
  @media (max-width: 480px) {
    font-size: 12px;
    margin-bottom: 12px;
  }
`

const StatsSection = styled.div`
  background: var(--brutal-cyan);
  border: 4px solid var(--border-primary);
  padding: 24px;
  box-shadow: 6px 6px 0px 0px var(--border-primary);
  
  @media (max-width: 768px) {
    border-width: 3px;
    padding: 20px;
    box-shadow: 4px 4px 0px 0px var(--border-primary);
  }
  
  @media (max-width: 480px) {
    border-width: 2px;
    padding: 16px;
    box-shadow: 2px 2px 0px 0px var(--border-primary);
  }
`

const StatsTitle = styled.h2`
  font-size: 24px;
  font-weight: 900;
  color: var(--text-primary);
  margin: 0 0 20px 0;
  font-family: var(--font-mono);
  text-transform: uppercase;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 20px;
    margin-bottom: 16px;
  }
  
  @media (max-width: 480px) {
    font-size: 18px;
    margin-bottom: 12px;
  }
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
`

const StatItem = styled.div`
  text-align: center;
  background: var(--light-bg);
  border: 2px solid var(--border-primary);
  padding: 16px 12px;
  
  @media (max-width: 768px) {
    padding: 12px 8px;
  }
  
  @media (max-width: 480px) {
    padding: 10px 6px;
  }
`

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 900;
  color: var(--text-primary);
  font-family: var(--font-mono);
  
  @media (max-width: 768px) {
    font-size: 20px;
  }
  
  @media (max-width: 480px) {
    font-size: 18px;
  }
`

const StatLabel = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
  font-family: var(--font-mono);
  text-transform: uppercase;
  margin-top: 4px;
  
  @media (max-width: 480px) {
    font-size: 10px;
  }
`

export default function HomePage() {
  const { activeAccount } = useWallet()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalPlayers: 1247,
    activeBattles: 23,
    totalPrizePool: "50,000",
    tournaments: 8
  })

  const actions = [
    {
      icon: "⚔️",
      title: "Battle Arena",
      description: "Challenge other players in epic meme coin battles",
      color: "var(--brutal-red)",
      route: "/battle",
      requiresWallet: true
    },
    {
      icon: "🏆",
      title: "Tournaments",
      description: "Join tournaments and compete for massive prizes",
      color: "var(--brutal-violet)",
      route: "/tournament",
      requiresWallet: false
    },
    {
      icon: "👥",
      title: "My Team",
      description: "Manage your meme coin collection and strategies",
      color: "var(--brutal-lime)",
      route: "/team",
      requiresWallet: true
    },
    {
      icon: "💰",
      title: "DeFi Hub",
      description: "Stake, swap, and earn with your tokens",
      color: "var(--brutal-orange)",
      route: "/defi",
      requiresWallet: true
    }
  ]

  const handleActionClick = (action: typeof actions[0]) => {
    if (action.requiresWallet && !activeAccount?.address) {
      brutalToast.error("Connect your wallet first!")
      return
    }
    router.push(action.route)
  }

  const handleGetStarted = () => {
    if (!activeAccount?.address) {
      brutalToast.info("Connect your wallet to get started!")
      return
    }
    router.push("/team")
  }

  return (
    <AppLayout>
      <HomeContainer>
        <HeroSection>
          <HeroTitle>🐺 DEGEN LEAGUE</HeroTitle>
          <HeroSubtitle>
            Battle • Trade • Dominate the Meme Coin Arena
          </HeroSubtitle>
          <Button 
            $variant="primary" 
            $size="lg"
            onClick={handleGetStarted}
          >
            {activeAccount?.address ? "ENTER ARENA" : "CONNECT WALLET"}
          </Button>
        </HeroSection>

        <ActionGrid>
          {actions.map((action, index) => (
            <ActionCard 
              key={index}
              $color={action.color}
              onClick={() => handleActionClick(action)}
            >
              <CardIcon>{action.icon}</CardIcon>
              <CardTitle>{action.title}</CardTitle>
              <CardDescription>{action.description}</CardDescription>
              <Button $variant="outline" $fullWidth>
                {action.requiresWallet && !activeAccount?.address ? "CONNECT WALLET" : "ENTER"}
              </Button>
            </ActionCard>
          ))}
        </ActionGrid>

        <StatsSection>
          <StatsTitle>🔥 Live Stats</StatsTitle>
          <StatsGrid>
            <StatItem>
              <StatValue>{stats.totalPlayers}</StatValue>
              <StatLabel>Players</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{stats.activeBattles}</StatValue>
              <StatLabel>Live Battles</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{stats.totalPrizePool}</StatValue>
              <StatLabel>Prize Pool</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{stats.tournaments}</StatValue>
              <StatLabel>Tournaments</StatLabel>
            </StatItem>
          </StatsGrid>
        </StatsSection>
      </HomeContainer>
    </AppLayout>
  )
}