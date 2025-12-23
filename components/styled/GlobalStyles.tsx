"use client"

import styled, { createGlobalStyle } from "styled-components"

export const GlobalStyle = createGlobalStyle`
  :root {
    --brutal-yellow: #FFE500;
    --brutal-lime: #9dfc7c;
    --brutal-cyan: #79F7FF;
    --brutal-pink: #fa8cef;
    --brutal-red: #fa7a7a;
    --brutal-orange: #FF965B;
    --brutal-violet: #918efa;
    --dark-bg: #000000;
    --light-bg: #ffffff;
    --text-primary: #000000;
    --text-secondary: #666666;
    --border-primary: #000000;
    --font-mono: 'Courier New', monospace;
    --shadow-brutal: 6px 6px 0px 0px var(--border-primary);
    --shadow-brutal-sm: 3px 3px 0px 0px var(--border-primary);
    --shadow-brutal-lg: 8px 8px 0px 0px var(--border-primary);

    /* Mobile-first touch targets */
    --min-touch-target: 44px;
    --min-tap-target: 44px;

    /* Mobile spacing */
    --mobile-padding: 16px;
    --mobile-margin: 16px;
    --mobile-gap: 12px;
  }

  .dark {
    --dark-bg: #ffffff;
    --light-bg: #000000;
    --text-primary: #ffffff;
    --text-secondary: #cccccc;
    --border-primary: #ffffff;
  }

  /* Base mobile styles */
  * {
    -webkit-tap-highlight-color: rgba(255, 229, 0, 0.3);
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  /* Enable text selection for content */
  p, span, div, h1, h2, h3, h4, h5, h6 {
    -webkit-user-select: text;
    -khtml-user-select: text;
    -moz-user-select: text;
    -ms-user-select: text;
    user-select: text;
  }

  /* Touch-friendly interactions */
  button, a, input, textarea, select {
    min-height: var(--min-touch-target);
    min-width: var(--min-touch-target);
  }

  /* Responsive breakpoints - Mobile First */
  @media (min-width: 481px) {
    :root {
      --mobile-padding: 20px;
      --mobile-margin: 20px;
      --mobile-gap: 16px;
    }
  }

  @media (min-width: 769px) {
    :root {
      --mobile-padding: 24px;
      --mobile-margin: 24px;
      --mobile-gap: 20px;
    }
  }

  @media (min-width: 1025px) {
    :root {
      --mobile-padding: 32px;
      --mobile-margin: 32px;
      --mobile-gap: 24px;
    }
  }

  /* Tablet styles */
  @media (max-width: 1024px) and (min-width: 769px) {
    :root {
      --border-width: 3px;
      --shadow-offset: 3px;
    }
  }

  /* Mobile styles */
  @media (max-width: 768px) {
    :root {
      --border-width: 2px;
      --shadow-offset: 2px;
    }

    /* Reduce motion for mobile performance */
    *, *::before, *::after {
      animation-duration: 0.2s !important;
      animation-delay: 0s !important;
      transition-duration: 0.2s !important;
    }
  }

  /* Small mobile styles */
  @media (max-width: 480px) {
    :root {
      --border-width: 1px;
      --shadow-offset: 1px;
      --mobile-padding: 12px;
      --mobile-margin: 12px;
      --mobile-gap: 8px;
    }
  }

  /* Improved scrollbar for mobile */
  @media (max-width: 768px) {
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    ::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.1);
    }

    ::-webkit-scrollbar-thumb {
      background: var(--brutal-yellow);
      border-radius: 3px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: var(--brutal-lime);
    }
  }

  /* Mobile viewport optimizations */
  @media (max-width: 768px) {
    html {
      font-size: 16px;
    }

    body {
      -webkit-overflow-scrolling: touch;
      overscroll-behavior: none;
      font-size: 16px;
      line-height: 1.5;
    }

    /* Prevent zoom on input focus */
    input[type="text"],
    input[type="email"],
    input[type="password"],
    input[type="number"],
    textarea,
    select {
      font-size: 16px;
    }

    /* Mobile typography */
    h1 {
      font-size: 1.75rem;
      line-height: 1.2;
      margin-bottom: 1rem;
    }

    h2 {
      font-size: 1.5rem;
      line-height: 1.3;
      margin-bottom: 0.875rem;
    }

    h3 {
      font-size: 1.25rem;
      line-height: 1.4;
      margin-bottom: 0.75rem;
    }

    p {
      font-size: 1rem;
      line-height: 1.6;
      margin-bottom: 1rem;
    }

    /* Better mobile spacing */
    .mobile-spacing {
      margin-bottom: var(--mobile-margin);
    }

    .mobile-padding {
      padding: var(--mobile-padding);
    }

    /* Mobile text sizing */
    .text-xs-mobile { font-size: 0.75rem; }
    .text-sm-mobile { font-size: 0.875rem; }
    .text-base-mobile { font-size: 1rem; }
    .text-lg-mobile { font-size: 1.125rem; }
    .text-xl-mobile { font-size: 1.25rem; }
    .text-2xl-mobile { font-size: 1.5rem; }
    .text-3xl-mobile { font-size: 1.875rem; }
    .text-4xl-mobile { font-size: 2.25rem; }
  }

  /* Small mobile specific styles */
  @media (max-width: 480px) {
    body {
      font-size: 14px;
    }

    h1 { font-size: 1.5rem; }
    h2 { font-size: 1.25rem; }
    h3 { font-size: 1.125rem; }
    p { font-size: 0.875rem; }

    /* Compact spacing for very small screens */
    .mobile-spacing {
      margin-bottom: calc(var(--mobile-margin) * 0.75);
    }

    .mobile-padding {
      padding: calc(var(--mobile-padding) * 0.75);
    }
  }

  /* Focus styles for accessibility */
  @media (max-width: 768px) {
    *:focus-visible {
      outline: 3px solid var(--brutal-yellow);
      outline-offset: 2px;
    }
  }
`

export const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  min-height: 100vh;
  background: var(--light-bg);
  position: relative;
  overflow-x: hidden;
  overflow-y: visible;
  border-left: 4px solid var(--border-primary);
  border-right: 4px solid var(--border-primary);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    border-left: 3px solid var(--border-primary);
    border-right: 3px solid var(--border-primary);
    max-width: 100%;
  }
  
  @media (max-width: 480px) {
    border-left: 2px solid var(--border-primary);
    border-right: 2px solid var(--border-primary);
  }
`

export const StadiumBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--light-bg);
  z-index: -2;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      repeating-linear-gradient(
        45deg,
        transparent,
        transparent 10px,
        rgba(255, 229, 0, 0.1) 10px,
        rgba(255, 229, 0, 0.1) 20px
      );
    z-index: -1;
  }

  @media (max-width: 768px) {
    &::before {
      background-image: 
        repeating-linear-gradient(
          45deg,
          transparent,
          transparent 8px,
          rgba(255, 229, 0, 0.08) 8px,
          rgba(255, 229, 0, 0.08) 16px
        );
    }
  }
`

export const MainContent = styled.main`
  padding: 20px 16px 100px;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    padding: 16px 12px 120px;
  }
  
  @media (max-width: 480px) {
    padding: 12px 8px 120px;
  }
`

export const Card = styled.div<{ $variant?: "primary" | "secondary" | "dark" }>`
  background: ${(props) => {
    switch (props.$variant) {
      case "primary":
        return "var(--brutal-yellow)"
      case "secondary":
        return "var(--brutal-cyan)"
      default:
        return "var(--light-bg)"
    }
  }};
  border: 4px solid var(--border-primary);
  border-radius: 0;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 6px 6px 0px 0px var(--border-primary);
  font-family: var(--font-mono);
  transition: all 0.1s ease;
  
  &:hover {
    transform: translate(2px, 2px);
    box-shadow: 4px 4px 0px 0px var(--border-primary);
  }

  @media (max-width: 768px) {
    border-width: 3px;
    padding: 16px;
    margin-bottom: 16px;
    box-shadow: 4px 4px 0px 0px var(--border-primary);
    
    &:hover {
      transform: translate(1px, 1px);
      box-shadow: 3px 3px 0px 0px var(--border-primary);
    }
  }

  @media (max-width: 480px) {
    border-width: 2px;
    padding: 12px;
    margin-bottom: 12px;
    box-shadow: 2px 2px 0px 0px var(--border-primary);
    
    &:hover {
      transform: none;
      box-shadow: 2px 2px 0px 0px var(--border-primary);
    }
  }
`

export const Button = styled.button<{
  $variant?: "primary" | "secondary" | "danger" | "outline"
  $size?: "sm" | "md" | "lg"
  $fullWidth?: boolean
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 4px solid var(--border-primary);
  border-radius: 0;
  font-weight: 900;
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: ${(props) => {
    switch (props.$size) {
      case "sm":
        return "12px"
      case "lg":
        return "18px"
      default:
        return "14px"
    }
  }};
  padding: ${(props) => {
    switch (props.$size) {
      case "sm":
        return "10px 16px"
      case "lg":
        return "18px 36px"
      default:
        return "14px 28px"
    }
  }};
  width: ${(props) => (props.$fullWidth ? "100%" : "auto")};
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  box-shadow: var(--shadow-brutal);
  
  background: ${(props) => {
    switch (props.$variant) {
      case "primary":
        return "var(--brutal-yellow)"
      case "secondary":
        return "var(--brutal-cyan)"
      case "danger":
        return "var(--brutal-red)"
      case "outline":
        return "var(--light-bg)"
      default:
        return "var(--brutal-yellow)"
    }
  }};
  
  color: var(--text-primary);
  
  &:hover:not(:disabled) {
    transform: translate(2px, 2px);
    box-shadow: var(--shadow-brutal-sm);
    background: ${(props) => {
      switch (props.$variant) {
        case "primary":
          return "var(--brutal-lime)"
        case "secondary":
          return "var(--brutal-pink)"
        case "danger":
          return "var(--brutal-orange)"
        case "outline":
          return "var(--brutal-yellow)"
        default:
          return "var(--brutal-lime)"
      }
    }};
  }
  
  &:active:not(:disabled) {
    transform: translate(4px, 4px);
    box-shadow: none;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: var(--shadow-brutal);
    filter: grayscale(0.3);
  }

  @media (max-width: 768px) {
    border-width: 3px;
    font-size: ${(props) => {
      switch (props.$size) {
        case "sm":
          return "11px"
        case "lg":
          return "16px"
        default:
          return "13px"
      }
    }};
    padding: ${(props) => {
      switch (props.$size) {
        case "sm":
          return "8px 14px"
        case "lg":
          return "16px 28px"
        default:
          return "12px 22px"
      }
    }};
    
    &:hover:not(:disabled) {
      transform: translate(1px, 1px);
    }
    
    &:active:not(:disabled) {
      transform: translate(2px, 2px);
    }
  }

  @media (max-width: 480px) {
    border-width: 2px;
    font-size: ${(props) => {
      switch (props.$size) {
        case "sm":
          return "10px"
        case "lg":
          return "14px"
        default:
          return "12px"
      }
    }};
    padding: ${(props) => {
      switch (props.$size) {
        case "sm":
          return "6px 12px"
        case "lg":
          return "14px 24px"
        default:
          return "10px 18px"
      }
    }};
    
    &:hover:not(:disabled) {
      transform: none;
    }
    
    &:active:not(:disabled) {
      transform: translate(1px, 1px);
    }
  }
  
  /* Focus styles for accessibility */
  &:focus-visible {
    outline: 2px solid var(--brutal-yellow);
    outline-offset: 2px;
  }
`

// New responsive utility components
export const ResponsiveGrid = styled.div<{ $columns?: number }>`
  display: grid;
  grid-template-columns: repeat(${props => props.$columns || 2}, 1fr);
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`

export const ResponsiveFlex = styled.div<{ $direction?: "row" | "column" }>`
  display: flex;
  flex-direction: ${props => props.$direction || "row"};
  gap: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`

export const MobileHidden = styled.div`
  @media (max-width: 768px) {
    display: none;
  }
`

export const DesktopHidden = styled.div`
  @media (min-width: 769px) {
    display: none;
  }
`
