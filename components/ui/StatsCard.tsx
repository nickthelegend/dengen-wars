"use client"

import styled from "styled-components"

const StatsCardContainer = styled.div<{ $variant?: 'default' | 'success' | 'warning' | 'error' }>`
  background: ${(props) => {
    switch (props.$variant) {
      case 'success': return 'var(--brutal-lime)'
      case 'warning': return 'var(--brutal-yellow)'
      case 'error': return 'var(--brutal-red)'
      default: return 'var(--light-bg)'
    }
  }};
  border: 3px solid var(--border-primary);
  border-radius: 0;
  padding: 20px;
  box-shadow: 4px 4px 0px 0px var(--border-primary);
  font-family: var(--font-mono);
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translate(2px, 2px);
    box-shadow: 2px 2px 0px 0px var(--border-primary);
  }

  @media (max-width: 768px) {
    padding: 16px;
    border-width: 2px;
    box-shadow: 3px 3px 0px 0px var(--border-primary);

    &:hover {
      transform: translate(1px, 1px);
      box-shadow: 1px 1px 0px 0px var(--border-primary);
    }
  }

  @media (max-width: 480px) {
    padding: 12px;
    border-width: 1px;
    box-shadow: 2px 2px 0px 0px var(--border-primary);
  }
`

const StatsHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;

  @media (max-width: 768px) {
    gap: 8px;
    margin-bottom: 10px;
  }

  @media (max-width: 480px) {
    gap: 6px;
    margin-bottom: 8px;
  }
`

const StatsIcon = styled.div`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 900;

  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
    font-size: 18px;
  }

  @media (max-width: 480px) {
    width: 24px;
    height: 24px;
    font-size: 16px;
  }
`

const StatsTitle = styled.h3`
  font-size: 16px;
  font-weight: 900;
  color: var(--text-primary);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;

  @media (max-width: 768px) {
    font-size: 14px;
    letter-spacing: 0.5px;
  }

  @media (max-width: 480px) {
    font-size: 12px;
  }
`

const StatsValue = styled.div`
  font-size: 28px;
  font-weight: 900;
  color: var(--text-primary);
  text-align: center;
  margin-bottom: 8px;

  @media (max-width: 768px) {
    font-size: 24px;
    margin-bottom: 6px;
  }

  @media (max-width: 480px) {
    font-size: 20px;
    margin-bottom: 4px;
  }
`

const StatsDescription = styled.p`
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
  margin: 0;
  opacity: 0.8;

  @media (max-width: 768px) {
    font-size: 11px;
  }

  @media (max-width: 480px) {
    font-size: 10px;
  }
`

interface StatsCardProps {
  title: string
  value: string | number
  icon?: string
  description?: string
  variant?: 'default' | 'success' | 'warning' | 'error'
  onClick?: () => void
}

export function StatsCard({
  title,
  value,
  icon,
  description,
  variant = 'default',
  onClick
}: StatsCardProps) {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if ((event.key === 'Enter' || event.key === ' ') && onClick) {
      event.preventDefault()
      onClick()
    }
  }

  return (
    <StatsCardContainer
      $variant={variant}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? "button" : "article"}
      tabIndex={onClick ? 0 : -1}
      aria-label={`${title}: ${value}${description ? ` - ${description}` : ''}`}
    >
      <StatsHeader>
        {icon && <StatsIcon aria-label={`${title} icon`}>{icon}</StatsIcon>}
        <StatsTitle>{title}</StatsTitle>
      </StatsHeader>
      <StatsValue aria-label={`Value: ${value}`}>{value}</StatsValue>
      {description && <StatsDescription aria-label={`Description: ${description}`}>{description}</StatsDescription>}
    </StatsCardContainer>
  )
}