"use client"

import styled from "styled-components"

const TokenCardContainer = styled.div<{ $selected?: boolean }>`
  background: ${(props) => (props.$selected ? "var(--brutal-yellow)" : "var(--light-bg)")};
  border: 4px solid var(--border-primary);
  border-radius: 0;
  padding: 20px;
  cursor: pointer;
  transition: all 0.1s ease;
  box-shadow: ${(props) => (props.$selected ? "6px 6px 0px 0px var(--border-primary)" : "4px 4px 0px 0px var(--border-primary)")};
  font-family: var(--font-mono);

  &:hover {
    transform: translate(2px, 2px) scale(1.02);
    box-shadow: 2px 2px 0px 0px var(--border-primary);
    background: var(--brutal-cyan);
    border-color: var(--brutal-lime);
  }

  &:active {
    transform: translate(1px, 1px) scale(1.01);
    box-shadow: 1px 1px 0px 0px var(--border-primary);
  }

  @media (max-width: 768px) {
    padding: 16px;
    border-width: 3px;
    box-shadow: ${(props) => (props.$selected ? "4px 4px 0px 0px var(--border-primary)" : "3px 3px 0px 0px var(--border-primary)")};

    &:hover {
      transform: translate(1px, 1px);
      box-shadow: 1px 1px 0px 0px var(--border-primary);
    }
  }

  @media (max-width: 480px) {
    padding: 12px;
    border-width: 2px;
    box-shadow: ${(props) => (props.$selected ? "3px 3px 0px 0px var(--border-primary)" : "2px 2px 0px 0px var(--border-primary)")};

    &:hover {
      transform: none;
      box-shadow: 1px 1px 0px 0px var(--border-primary);
    }
  }
`

const TokenLogo = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 0;
  background: var(--brutal-pink);
  border: 3px solid var(--border-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin: 0 auto 12px;
  font-weight: 900;
  box-shadow: 2px 2px 0px 0px var(--border-primary);
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1) rotate(5deg);
    background: var(--brutal-lime);
    box-shadow: 3px 3px 0px 0px var(--border-primary);
  }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    font-size: 20px;
    margin-bottom: 10px;
    border-width: 2px;
    box-shadow: 1px 1px 0px 0px var(--border-primary);
  }

  @media (max-width: 480px) {
    width: 32px;
    height: 32px;
    font-size: 16px;
    margin-bottom: 8px;
    border-width: 1px;
  }
`

const TokenSymbol = styled.h3`
  font-family: var(--font-mono);
  font-weight: 900;
  font-size: 18px;
  color: var(--text-primary);
  margin-bottom: 4px;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 1px;

  @media (max-width: 768px) {
    font-size: 16px;
    margin-bottom: 3px;
    letter-spacing: 0.5px;
  }

  @media (max-width: 480px) {
    font-size: 14px;
    margin-bottom: 2px;
  }
`

const TokenPrice = styled.p`
  font-family: var(--font-mono);
  font-size: 14px;
  color: var(--text-primary);
  margin-bottom: 4px;
  text-align: center;
  font-weight: 900;

  @media (max-width: 768px) {
    font-size: 13px;
    margin-bottom: 3px;
  }

  @media (max-width: 480px) {
    font-size: 12px;
    margin-bottom: 2px;
  }
`

const TokenChange = styled.p<{ $positive: boolean }>`
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 900;
  color: var(--text-primary);
  background: ${(props) => (props.$positive ? "var(--brutal-lime)" : "var(--brutal-red)")};
  text-align: center;
  margin-bottom: 8px;
  padding: 4px 8px;
  border: 2px solid var(--border-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-block;
  width: 100%;
  box-sizing: border-box;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: scale(1.05);
    box-shadow: 2px 2px 0px 0px var(--border-primary);
    background: ${(props) => (props.$positive ? "var(--brutal-cyan)" : "var(--brutal-pink)")};
  }

  @media (max-width: 768px) {
    font-size: 11px;
    margin-bottom: 6px;
    padding: 3px 6px;
    border-width: 1px;
  }

  @media (max-width: 480px) {
    font-size: 10px;
    margin-bottom: 4px;
    padding: 2px 4px;
  }
`

const TokenPoints = styled.p`
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 900;
  color: var(--text-primary);
  text-align: center;
  background: var(--brutal-violet);
  padding: 6px 12px;
  border: 2px solid var(--border-primary);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 2px 4px 0px 0px var(--border-primary);
    background: var(--brutal-pink);
  }

  @media (max-width: 768px) {
    font-size: 13px;
    padding: 5px 10px;
    border-width: 1px;
  }

  @media (max-width: 480px) {
    font-size: 12px;
    padding: 4px 8px;
  }
`

interface TokenCardProps {
  symbol: string
  logo: string
  price: number
  change: number
  points: number
  selected?: boolean
  onClick?: () => void
}

export function TokenCard({ symbol, logo, price, change, points, selected, onClick }: TokenCardProps) {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if ((event.key === 'Enter' || event.key === ' ') && onClick) {
      event.preventDefault()
      onClick()
    }
  }

  return (
    <TokenCardContainer
      $selected={selected}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Token ${symbol}: Price $${price.toFixed(4)}, Change ${change >= 0 ? '+' : ''}${change.toFixed(2)}%, Points ${points}`}
      aria-pressed={selected}
    >
      <TokenLogo aria-label={`${symbol} logo`}>{logo}</TokenLogo>
      <TokenSymbol>{symbol}</TokenSymbol>
      <TokenPrice aria-label={`Price: $${price.toFixed(4)}`}>${price.toFixed(4)}</TokenPrice>
      <TokenChange $positive={change >= 0} aria-label={`Price change: ${change >= 0 ? '+' : ''}${change.toFixed(2)}%`}>
        {change >= 0 ? "+" : ""}
        {change.toFixed(2)}%
      </TokenChange>
      <TokenPoints aria-label={`Points: ${points}`}>{points} pts</TokenPoints>
    </TokenCardContainer>
  )
}
