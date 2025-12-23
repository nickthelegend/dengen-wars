"use client"

import styled from 'styled-components'
import type { PowerUp } from '../../types/battle'

const PowerUpContainer = styled.div`
  background: var(--brutal-purple);
  border: 4px solid var(--border-primary);
  padding: 16px;
  box-shadow: 4px 4px 0px 0px var(--border-primary);
  margin-bottom: 16px;
`

const PowerUpGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
`

const PowerUpCard = styled.button<{ $rarity: string; $available: boolean }>`
  background: ${props => {
    switch (props.$rarity) {
      case 'legendary': return 'linear-gradient(135deg, #ffd700, #ffed4e)'
      case 'epic': return 'linear-gradient(135deg, #9333ea, #c084fc)'
      case 'rare': return 'linear-gradient(135deg, #3b82f6, #60a5fa)'
      default: return 'var(--light-bg)'
    }
  }};
  border: 3px solid var(--border-primary);
  padding: 12px;
  cursor: ${props => props.$available ? 'pointer' : 'not-allowed'};
  opacity: ${props => props.$available ? 1 : 0.5};
  transition: all 0.2s ease;
  
  &:hover {
    transform: ${props => props.$available ? 'translateY(-2px)' : 'none'};
  }
`

interface PowerUpPanelProps {
  availablePowerUps: PowerUp[]
  onUsePowerUp: (powerUp: PowerUp) => void
  cooldowns: Record<string, number>
}

export function PowerUpPanel({ availablePowerUps, onUsePowerUp, cooldowns }: PowerUpPanelProps) {
  return (
    <PowerUpContainer>
      <div style={{ fontSize: '14px', fontWeight: '900', marginBottom: '12px' }}>
        ⚡ POWER-UPS
      </div>
      <PowerUpGrid>
        {availablePowerUps.map(powerUp => {
          const cooldown = cooldowns[powerUp.id] || 0
          const available = cooldown === 0
          
          return (
            <PowerUpCard
              key={powerUp.id}
              $rarity={powerUp.rarity}
              $available={available}
              onClick={() => available && onUsePowerUp(powerUp)}
            >
              <div style={{ fontSize: '24px' }}>{powerUp.icon}</div>
              <div style={{ fontSize: '10px', fontWeight: '900' }}>
                {powerUp.name.split(' ')[1]}
              </div>
              {cooldown > 0 && <div style={{ fontSize: '8px' }}>{cooldown}s</div>}
            </PowerUpCard>
          )
        })}
      </PowerUpGrid>
    </PowerUpContainer>
  )
}