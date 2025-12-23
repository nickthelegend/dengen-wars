"use client"

import React from 'react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle, faRotate } from '@fortawesome/free-solid-svg-icons'

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: var(--brutal-red);
  border: 4px solid var(--border-primary);
  padding: 40px;
  text-align: center;
  box-shadow: 8px 8px 0px 0px var(--border-primary);
`

const ErrorTitle = styled.h1`
  font-size: 32px;
  font-weight: 900;
  color: var(--text-primary);
  margin: 0 0 16px 0;
  font-family: var(--font-mono);
  text-transform: uppercase;
`

const ErrorMessage = styled.p`
  font-size: 16px;
  color: var(--text-primary);
  margin: 0 0 24px 0;
  font-family: var(--font-mono);
`

const RetryButton = styled.button`
  background: var(--brutal-yellow);
  border: 4px solid var(--border-primary);
  padding: 12px 24px;
  font-weight: 900;
  font-family: var(--font-mono);
  cursor: pointer;
  box-shadow: 4px 4px 0px 0px var(--border-primary);
  
  &:hover {
    transform: translate(2px, 2px);
    box-shadow: 2px 2px 0px 0px var(--border-primary);
  }
`

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  retryCount: number
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, retryCount: 0 }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, retryCount: 0 }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: undefined,
      retryCount: prevState.retryCount + 1
    }))
  }

  render() {
    if (this.state.hasError) {
      // If custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <ErrorContainer>
          <ErrorTitle>
            <FontAwesomeIcon icon={faExclamationTriangle} style={{ marginRight: '8px' }} />
            Something Went Wrong
          </ErrorTitle>
          <ErrorMessage>
            The application encountered an unexpected error. You can try again or refresh the page.
          </ErrorMessage>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <RetryButton onClick={this.handleRetry}>
              <FontAwesomeIcon icon={faRotate} style={{ marginRight: '8px' }} />
              Try Again ({this.state.retryCount}/3)
            </RetryButton>
            <RetryButton onClick={() => window.location.reload()}>
              <FontAwesomeIcon icon={faRotate} style={{ marginRight: '8px' }} />
              Reload Page
            </RetryButton>
          </div>
        </ErrorContainer>
      )
    }

    return this.props.children
  }
}