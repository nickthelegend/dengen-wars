"use client"

import type React from "react"
import styled from "styled-components"
import Image from "next/image"
import { useRouter } from "next/navigation"

import { Container, StadiumBackground, MainContent, GlobalStyle } from "../styled/GlobalStyles"
import { Header } from "./Header"
import { BottomNavigation } from "./BottomNavigation"
import { BrutalToastContainer } from "../ui/BrutalToast"

const LogoNameBox = styled.div`
  position: fixed;
  left: 20px;
  top: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--brutal-lime);
  border: 3px solid var(--border-primary);
  border-radius: 0;
  padding: 8px 16px;
  box-shadow: 3px 3px 0px 0px var(--border-primary);
  cursor: pointer;
  transition: all 0.1s ease;
  z-index: 1000;

  &:hover {
    transform: translate(1px, 1px);
    box-shadow: 2px 2px 0px 0px var(--border-primary);
  }

  @media (max-width: 768px) {
    left: 10px;
    top: 10px;
    border-width: 2px;
    padding: 6px 12px;
    box-shadow: 2px 2px 0px 0px var(--border-primary);
    gap: 8px;

    &:hover {
      transform: translate(1px, 1px);
      box-shadow: 1px 1px 0px 0px var(--border-primary);
    }
  }

  @media (max-width: 480px) {
    left: 5px;
    top: 5px;
    padding: 4px 8px;
    gap: 6px;
  }
`

const LogoContainer = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;

  img {
    width: 40px;
    height: 40px;
  }

  @media (max-width: 768px) {
    img {
      width: 32px;
      height: 32px;
    }
  }

  @media (max-width: 480px) {
    img {
      width: 28px;
      height: 28px;
    }
  }
`

const AppName = styled.span`
  font-size: 18px;
  font-weight: 900;
  color: var(--text-primary);
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 1px;
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 14px;
    letter-spacing: 0.5px;
  }

  @media (max-width: 480px) {
    font-size: 12px;
    letter-spacing: 0.25px;
  }
`

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter()

  return (
    <>
      <GlobalStyle />
      <StadiumBackground />
      <LogoNameBox onClick={() => router.push('/')}>
        <LogoContainer>
          <Image
            src="/wolf-removebg-preview.png"
            alt="Degen League Logo"
            width={40}
            height={40}
            priority
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
          />
        </LogoContainer>
        <AppName>DEGEN LEAGUE</AppName>
      </LogoNameBox>
      <Container className="min-h-screen">
        <Header />
        <MainContent className="font-mono">{children}</MainContent>
        <BottomNavigation />
      </Container>
      <BrutalToastContainer />
    </>
  )
}
