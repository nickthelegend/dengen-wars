"use client"

import styled, { keyframes } from "styled-components"

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
`

const LoadingContainer = styled.div<{ $size?: "sm" | "md" | "lg" }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: ${props => {
    switch (props.$size) {
      case "sm": return "8px"
      case "lg": return "24px"
      default: return "16px"
    }
  }};
`

const Spinner = styled.div<{ $size?: "sm" | "md" | "lg" }>`
  width: ${props => {
    switch (props.$size) {
      case "sm": return "16px"
      case "lg": return "32px"
      default: return "24px"
    }
  }};
  height: ${props => {
    switch (props.$size) {
      case "sm": return "16px"
      case "lg": return "32px"
      default: return "24px"
    }
  }};
  border: 3px solid var(--light-bg);
  border-top: 3px solid var(--brutal-yellow);
  border-radius: 0;
  animation: ${spin} 1s linear infinite;
  
  @media (max-width: 768px) {
    border-width: 2px;
  }
`

const LoadingText = styled.span<{ $size?: "sm" | "md" | "lg" }>`
  font-family: var(--font-mono);
  font-weight: 900;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: ${props => {
    switch (props.$size) {
      case "sm": return "12px"
      case "lg": return "18px"
      default: return "14px"
    }
  }};
  animation: ${bounce} 1.5s ease-in-out infinite;
`

const DotsContainer = styled.div`
  display: flex;
  gap: 4px;
`

const Dot = styled.div<{ $delay: number }>`
  width: 6px;
  height: 6px;
  background: var(--brutal-yellow);
  border: 1px solid var(--border-primary);
  animation: ${bounce} 1.4s ease-in-out infinite;
  animation-delay: ${props => props.$delay}s;
  
  @media (max-width: 768px) {
    width: 4px;
    height: 4px;
  }
`

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  text?: string
  showDots?: boolean
}

export function LoadingSpinner({ 
  size = "md", 
  text = "Loading", 
  showDots = true 
}: LoadingSpinnerProps) {
  return (
    <LoadingContainer $size={size}>
      <Spinner $size={size} />
      <LoadingText $size={size}>{text}</LoadingText>
      {showDots && (
        <DotsContainer>
          <Dot $delay={0} />
          <Dot $delay={0.2} />
          <Dot $delay={0.4} />
        </DotsContainer>
      )}
    </LoadingContainer>
  )
}

export function FullPageLoader({ text = "Loading Degen League" }: { text?: string }) {
  return (
    <LoadingContainer 
      $size="lg" 
      style={{ 
        minHeight: "50vh", 
        flexDirection: "column",
        gap: "24px"
      }}
    >
      <div style={{ fontSize: "48px" }}>🐺</div>
      <LoadingSpinner size="lg" text={text} />
    </LoadingContainer>
  )
}