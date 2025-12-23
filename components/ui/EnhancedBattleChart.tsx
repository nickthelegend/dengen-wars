"use client"

import React, { useMemo, useCallback } from 'react'
import styled from 'styled-components'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts'

interface BattleChartData {
  time: number
  you: number
  opponent: number
}

interface EnhancedBattleChartProps {
  data: BattleChartData[]
  battleIntensity: number
  opponentStrategy: string
  playerScore: number
  opponentScore: number
  isActive: boolean
}

const ChartContainer = styled.div`
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%);
  padding: 20px;
  border-radius: 20px;
  border: 4px solid var(--border-primary);
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 30px rgba(0, 255, 65, 0.1), inset 0 0 30px rgba(255, 20, 147, 0.05);
  width: 100%;
  max-width: 100%;
  
  @media (max-width: 768px) {
    padding: 16px;
    border-width: 3px;
    border-radius: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
    border-width: 2px;
    border-radius: 12px;
  }
`

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    margin-bottom: 20px;
  }
  
  @media (max-width: 480px) {
    gap: 12px;
    margin-bottom: 16px;
  }
`

const ScoreDisplay = styled.div<{ $isLeading: boolean; $color: string }>`
  color: ${props => props.$color};
  font-size: 28px;
  font-weight: 900;
  font-family: var(--font-mono);
  text-shadow: 0 0 20px ${props => props.$color}, 0 0 40px ${props => props.$color};
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: ${props => props.$isLeading ? `rgba(${props.$color === '#00ff41' ? '0, 255, 65' : '255, 20, 147'}, 0.1)` : `rgba(${props.$color === '#00ff41' ? '0, 255, 65' : '255, 20, 147'}, 0.05)`};
  border: 2px solid ${props => props.$color};
  border-radius: 12px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.02);
    box-shadow: 0 0 30px ${props => props.$color}40;
  }
  
  @media (max-width: 768px) {
    font-size: 24px;
    padding: 10px 16px;
    gap: 8px;
  }
  
  @media (max-width: 480px) {
    font-size: 20px;
    padding: 8px 12px;
    gap: 6px;
    flex-direction: column;
    text-align: center;
  }
`

const BattleInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
  
  @media (max-width: 768px) {
    align-items: center;
  }
`

const StrategyBadge = styled.div`
  font-size: 12px;
  color: #888;
  font-family: var(--font-mono);
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid #444;
  
  @media (max-width: 480px) {
    font-size: 10px;
    padding: 3px 6px;
  }
`

const IntensityIndicator = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
  
  @media (max-width: 480px) {
    gap: 3px;
  }
`

const IntensityDot = styled.div<{ $active: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.$active ? '#ff4444' : '#333'};
  box-shadow: ${props => props.$active ? '0 0 8px #ff4444' : 'none'};
  transition: all 0.3s ease;
  
  @media (max-width: 480px) {
    width: 6px;
    height: 6px;
  }
`

const ChartWrapper = styled.div`
  height: 320px;
  width: 100%;
  
  @media (max-width: 768px) {
    height: 280px;
  }
  
  @media (max-width: 480px) {
    height: 240px;
  }
`

const EmptyState = styled.div`
  text-align: center;
  color: var(--text-primary);
  font-family: var(--font-mono);
  padding-top: 120px;
  height: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 768px) {
    padding-top: 80px;
    height: 280px;
  }
  
  @media (max-width: 480px) {
    padding-top: 60px;
    height: 240px;
  }
`

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 24px;
  text-shadow: 0 0 20px #00ff41;
  
  @media (max-width: 768px) {
    font-size: 48px;
    margin-bottom: 20px;
  }
  
  @media (max-width: 480px) {
    font-size: 36px;
    margin-bottom: 16px;
  }
`

const EmptyTitle = styled.div`
  font-size: 24px;
  font-weight: 900;
  text-shadow: 0 0 10px currentColor;
  margin-bottom: 12px;
  
  @media (max-width: 768px) {
    font-size: 20px;
    margin-bottom: 10px;
  }
  
  @media (max-width: 480px) {
    font-size: 18px;
    margin-bottom: 8px;
  }
`

const EmptySubtitle = styled.div`
  font-size: 16px;
  color: #00ff41;
  text-shadow: 0 0 8px #00ff41;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
  
  @media (max-width: 480px) {
    font-size: 12px;
  }
`

const CustomTooltip = styled.div`
  background: rgba(26, 26, 46, 0.95);
  border: 3px solid #00ff41;
  border-radius: 12px;
  padding: 12px;
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 900;
  box-shadow: 0 0 20px rgba(0, 255, 65, 0.3);
  backdrop-filter: blur(10px);
  
  @media (max-width: 768px) {
    font-size: 12px;
    padding: 10px;
    border-width: 2px;
  }
  
  @media (max-width: 480px) {
    font-size: 11px;
    padding: 8px;
    border-width: 1px;
  }
`

export function EnhancedBattleChart({
  data,
  battleIntensity,
  opponentStrategy,
  playerScore,
  opponentScore,
  isActive
}: EnhancedBattleChartProps) {
  
  const isLeading = playerScore >= opponentScore
  
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []
    
    // Smooth the data for better visual appeal
    return data.map((point, index) => {
      if (index === 0 || index === data.length - 1) return point
      
      // Simple smoothing for middle points
      const prev = data[index - 1]
      const next = data[index + 1]
      return {
        ...point,
        you: (prev.you + point.you + next.you) / 3,
        opponent: (prev.opponent + point.opponent + next.opponent) / 3
      }
    })
  }, [data])
  
  const customTooltip = useCallback(({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <CustomTooltip>
          <div style={{ color: '#fff', marginBottom: '8px' }}>⏱️ {label}s</div>
          {payload.map((entry: any, index: number) => (
            <div key={index} style={{ color: entry.color, marginBottom: '4px' }}>
              {entry.name === 'you' ? '🚀 YOU' : '🤖 AI'}: {Number(entry.value).toFixed(4)}%
            </div>
          ))}
        </CustomTooltip>
      )
    }
    return null
  }, [])
  
  if (!data || data.length <= 1) {
    return (
      <ChartContainer>
        <EmptyState>
          <EmptyIcon>⚡</EmptyIcon>
          <EmptyTitle>BATTLE INITIALIZING...</EmptyTitle>
          <EmptySubtitle>Real-time price tracking starting</EmptySubtitle>
        </EmptyState>
      </ChartContainer>
    )
  }
  
  return (
    <ChartContainer>
      <ChartHeader>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <ScoreDisplay $isLeading={isLeading} $color="#00ff41">
            {isLeading ? '🚀' : '📈'} YOU: {playerScore.toFixed(4)}%
          </ScoreDisplay>
          <ScoreDisplay $isLeading={!isLeading} $color="#ff1493">
            {!isLeading ? '🔥' : '🤖'} AI: {opponentScore.toFixed(4)}%
          </ScoreDisplay>
        </div>
        
        <BattleInfo>
          <StrategyBadge>🤖 {opponentStrategy.toUpperCase()} STRATEGY</StrategyBadge>
          <IntensityIndicator>
            {[1, 2, 3].map(i => (
              <IntensityDot key={i} $active={i <= battleIntensity} />
            ))}
          </IntensityIndicator>
        </BattleInfo>
      </ChartHeader>
      
      <ChartWrapper>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <defs>
              <linearGradient id="youGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00ff41" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#00ff41" stopOpacity={0.05}/>
              </linearGradient>
              <linearGradient id="opponentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff1493" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ff1493" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            
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
            
            <Tooltip content={customTooltip} />
            
            <Area 
              type="monotone" 
              dataKey="you" 
              stroke="#00ff41" 
              strokeWidth={4}
              fill="url(#youGradient)"
              dot={{ fill: '#00ff41', strokeWidth: 3, r: 5, filter: 'drop-shadow(0 0 6px #00ff41)' }}
              activeDot={{ r: 8, stroke: '#00ff41', strokeWidth: 3, fill: '#00ff88', filter: 'drop-shadow(0 0 10px #00ff41)' }}
              name="you"
            />
            
            <Area 
              type="monotone" 
              dataKey="opponent" 
              stroke="#ff1493" 
              strokeWidth={4}
              fill="url(#opponentGradient)"
              dot={{ fill: '#ff1493', strokeWidth: 3, r: 5, filter: 'drop-shadow(0 0 6px #ff1493)' }}
              activeDot={{ r: 8, stroke: '#ff1493', strokeWidth: 3, fill: '#ff4488', filter: 'drop-shadow(0 0 10px #ff1493)' }}
              name="opponent"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartWrapper>
    </ChartContainer>
  )
}
