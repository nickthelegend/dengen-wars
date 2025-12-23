"use client"

import { useState, useRef, useEffect } from "react"
import styled from "styled-components"

const TooltipContainer = styled.div`
  position: relative;
  display: inline-block;
`

const TooltipTrigger = styled.div`
  cursor: pointer;
  display: inline-block;
`

const TooltipContent = styled.div<{ $position: 'top' | 'bottom' | 'left' | 'right' }>`
  position: absolute;
  background: var(--light-bg);
  border: 3px solid var(--border-primary);
  border-radius: 0;
  padding: 12px;
  box-shadow: 4px 4px 0px 0px var(--border-primary);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
  max-width: 200px;
  word-wrap: break-word;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  pointer-events: none;

  ${(props) => {
    switch (props.$position) {
      case 'top':
        return `
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(10px);
          margin-bottom: 8px;
        `
      case 'bottom':
        return `
          top: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(-10px);
          margin-top: 8px;
        `
      case 'left':
        return `
          right: 100%;
          top: 50%;
          transform: translateY(-50%) translateX(10px);
          margin-right: 8px;
        `
      case 'right':
        return `
          left: 100%;
          top: 50%;
          transform: translateY(-50%) translateX(-10px);
          margin-left: 8px;
        `
    }
  }}

  &::after {
    content: '';
    position: absolute;
    border: 6px solid transparent;

    ${(props) => {
      switch (props.$position) {
        case 'top':
          return `
            border-top-color: var(--border-primary);
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
          `
        case 'bottom':
          return `
            border-bottom-color: var(--border-primary);
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
          `
        case 'left':
          return `
            border-left-color: var(--border-primary);
            left: 100%;
            top: 50%;
            transform: translateY(-50%);
          `
        case 'right':
          return `
            border-right-color: var(--border-primary);
            right: 100%;
            top: 50%;
            transform: translateY(-50%);
          `
      }
    }}
  }

  ${TooltipContainer}:hover & {
    opacity: 1;
    visibility: visible;

    ${(props) => {
      switch (props.$position) {
        case 'top':
          return 'transform: translateX(-50%) translateY(0);'
        case 'bottom':
          return 'transform: translateX(-50%) translateY(0);'
        case 'left':
          return 'transform: translateY(-50%) translateX(0);'
        case 'right':
          return 'transform: translateY(-50%) translateX(0);'
      }
    }}
  }

  @media (max-width: 768px) {
    padding: 10px;
    font-size: 11px;
    max-width: 150px;
    border-width: 2px;
    box-shadow: 3px 3px 0px 0px var(--border-primary);

    &::after {
      border-width: 4px;
    }
  }

  @media (max-width: 480px) {
    padding: 8px;
    font-size: 10px;
    max-width: 120px;
    border-width: 1px;
    box-shadow: 2px 2px 0px 0px var(--border-primary);

    &::after {
      border-width: 3px;
    }
  }
`

interface TooltipProps {
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  children: React.ReactNode
}

export function Tooltip({
  content,
  position = 'top',
  children
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false)
      }
    }

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isVisible])

  return (
    <TooltipContainer>
      <TooltipTrigger
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent
        ref={tooltipRef}
        $position={position}
        style={{
          opacity: isVisible ? 1 : 0,
          visibility: isVisible ? 'visible' : 'hidden'
        }}
      >
        {content}
      </TooltipContent>
    </TooltipContainer>
  )
}
