"use client"

import { useState, useEffect } from 'react'
import styled, { keyframes } from 'styled-components'
import type { Achievement } from '../../types/achievements'

const slideIn = keyframes`
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`

const ToastContainer = styled.div<{ $rarity: string }>`
  position: fixed;
  top: 20px;
  right: 20px;
  background: ${props => {
    switch (props.$rarity) {
      case 'platinum': return 'linear-gradient(135deg, #e5e7eb, #f3f4f6)'
      case 'gold': return 'linear-gradient(135deg, #fbbf24, #f59e0b)'
      case 'silver': return 'linear-gradient(135deg, #6b7280, #9ca3af)'
      default: return 'linear-gradient(135deg, #cd7f32, #a0522d)'
    }
  }};
  border: 4px solid var(--border-primary);
  padding: 16px;
  box-shadow: 8px 8px 0px 0px var(--border-primary);
  animation: ${slideIn} 0.5s ease-out;
  z-index: 1000;
  max-width: 300px;
`

const ToastHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`

const ToastIcon = styled.div`
  font-size: 24px;
`

const ToastTitle = styled.div`
  font-size: 16px;
  font-weight: 900;
  color: var(--text-primary);
  font-family: var(--font-mono);
`

const ToastDescription = styled.div`
  font-size: 12px;
  color: var(--text-primary);
  font-family: var(--font-mono);
  margin-bottom: 8px;
`

const ToastReward = styled.div`
  font-size: 10px;
  color: var(--text-primary);
  font-weight: 900;
  background: rgba(0, 0, 0, 0.2);
  padding: 4px 8px;
  border-radius: 4px;
`

interface AchievementToastProps {
  achievement: Achievement
  onClose: () => void
}

export function AchievementToast({ achievement, onClose }: AchievementToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <ToastContainer $rarity={achievement.rarity}>
      <ToastHeader>
        <ToastIcon>{achievement.icon}</ToastIcon>
        <ToastTitle>ACHIEVEMENT UNLOCKED!</ToastTitle>
      </ToastHeader>
      <ToastDescription>{achievement.description}</ToastDescription>
      {achievement.reward && (
        <ToastReward>
          +{achievement.reward.amount} {achievement.reward.type.toUpperCase()}
        </ToastReward>
      )}
    </ToastContainer>
  )
}