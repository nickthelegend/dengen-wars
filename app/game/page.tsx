'use client'

import dynamic from 'next/dynamic'
import styled from 'styled-components'

// Dynamically import the game component to prevent SSR issues
const GameComponent = dynamic(() => import('./GameComponent'), {
  ssr: false,
  loading: () => <LoadingScreen>Loading game...</LoadingScreen>
})

const LoadingScreen = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: var(--light-bg);
  font-family: var(--font-mono);
  font-weight: 700;
  color: var(--text-primary);
  font-size: 24px;
`

export default function GamePage() {
  return <GameComponent />
}