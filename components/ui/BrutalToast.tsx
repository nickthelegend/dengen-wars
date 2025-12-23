"use client"

import { useState, useEffect } from "react"
import styled, { keyframes } from "styled-components"

interface ToastProps {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
  duration?: number
}

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`

const ToastContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const ToastItem = styled.div<{ $type: 'success' | 'error' | 'info', $isExiting: boolean }>`
  background: ${props => {
    switch (props.$type) {
      case 'success': return 'var(--brutal-lime)'
      case 'error': return 'var(--brutal-red)'
      case 'info': return 'var(--brutal-cyan)'
      default: return 'var(--light-bg)'
    }
  }};
  border: 4px solid var(--border-primary);
  box-shadow: 6px 6px 0px 0px var(--border-primary);
  padding: 16px 20px;
  font-family: var(--font-mono);
  font-weight: 900;
  text-transform: uppercase;
  color: var(--text-primary);
  min-width: 300px;
  max-width: 400px;
  animation: ${props => props.$isExiting ? slideOut : slideIn} 0.3s ease-out;
  cursor: pointer;
  transition: transform 0.1s ease;
  
  &:hover {
    transform: translate(2px, 2px);
    box-shadow: 4px 4px 0px 0px var(--border-primary);
  }
`

const ToastIcon = styled.span`
  margin-right: 12px;
  font-size: 18px;
`

const ToastMessage = styled.span`
  font-size: 14px;
  letter-spacing: 1px;
`

let toastId = 0
const toasts: ToastProps[] = []
const listeners: Array<(toasts: ToastProps[]) => void> = []

const addToast = (type: 'success' | 'error' | 'info', message: string, duration = 4000) => {
  const id = `toast-${++toastId}`
  const toast: ToastProps = { id, type, message, duration }
  
  toasts.push(toast)
  listeners.forEach(listener => listener([...toasts]))
  
  setTimeout(() => {
    removeToast(id)
  }, duration)
}

const removeToast = (id: string) => {
  const index = toasts.findIndex(toast => toast.id === id)
  if (index > -1) {
    toasts.splice(index, 1)
    listeners.forEach(listener => listener([...toasts]))
  }
}

export const brutalToast = {
  success: (message: string) => addToast('success', message),
  error: (message: string) => addToast('error', message),
  info: (message: string) => addToast('info', message),
}

export function BrutalToastContainer() {
  const [toastList, setToastList] = useState<ToastProps[]>([])
  const [exitingToasts, setExitingToasts] = useState<Set<string>>(new Set())

  useEffect(() => {
    const listener = (newToasts: ToastProps[]) => {
      setToastList(newToasts)
    }
    
    listeners.push(listener)
    
    return () => {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [])

  const handleToastClick = (id: string) => {
    setExitingToasts(prev => new Set(prev).add(id))
    setTimeout(() => {
      removeToast(id)
      setExitingToasts(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }, 300)
  }

  const getIcon = (type: 'success' | 'error' | 'info') => {
    switch (type) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'info': return 'ℹ️'
      default: return '📢'
    }
  }

  return (
    <ToastContainer>
      {toastList.map((toast) => (
        <ToastItem
          key={toast.id}
          $type={toast.type}
          $isExiting={exitingToasts.has(toast.id)}
          onClick={() => handleToastClick(toast.id)}
        >
          <ToastIcon>{getIcon(toast.type)}</ToastIcon>
          <ToastMessage>{toast.message}</ToastMessage>
        </ToastItem>
      ))}
    </ToastContainer>
  )
}