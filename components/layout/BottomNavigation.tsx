"use client"

import styled from "styled-components"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Users, Calendar, Trophy, User, Swords, BarChart3, Zap, DollarSign } from "lucide-react"

const NavContainer = styled.nav`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 600px;
  background: var(--light-bg);
  border-top: var(--border-width) solid var(--border-primary);
  border-left: var(--border-width) solid var(--border-primary);
  border-right: var(--border-width) solid var(--border-primary);
  padding: var(--mobile-padding) 0 calc(var(--mobile-padding) - 4px);
  z-index: 100;
  font-family: var(--font-mono);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  @media (max-width: 768px) {
    border-width: var(--border-width);
    padding: var(--mobile-padding) 0 calc(var(--mobile-padding) - 2px);
    max-width: 100%;
    box-shadow: 0 -2px 15px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 480px) {
    border-width: var(--border-width);
    padding: var(--mobile-padding) 0 calc(var(--mobile-padding) - 4px);
    box-shadow: 0 -1px 10px rgba(0, 0, 0, 0.1);
  }
`

const NavList = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 0 8px;
  
  @media (max-width: 480px) {
    padding: 0 4px;
  }
`

const NavItem = styled(Link)<{ $active: boolean; $isBattle?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: ${(props) => (props.$isBattle ? "14px 18px" : "10px 14px")};
  border-radius: 0;
  text-decoration: none;
  color: var(--text-primary);
  background: ${(props) => {
    if (props.$isBattle && props.$active) return "var(--brutal-red)"
    if (props.$isBattle) return "var(--brutal-orange)"
    if (props.$active) return "var(--brutal-yellow)"
    return "transparent"
  }};
  border: ${(props) => {
    if (props.$isBattle) return "var(--border-width) solid var(--border-primary)"
    if (props.$active) return "var(--border-width) solid var(--border-primary)"
    return "var(--border-width) solid transparent"
  }};
  box-shadow: ${(props) => {
    if (props.$isBattle && props.$active) return "var(--shadow-brutal)"
    if (props.$isBattle) return "var(--shadow-brutal-sm)"
    if (props.$active) return "var(--shadow-brutal-sm)"
    return "none"
  }};
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 900;
  text-transform: uppercase;
  transform: ${(props) => (props.$isBattle ? "scale(1.05)" : "scale(1)")};
  min-height: var(--min-touch-target);
  min-width: var(--min-touch-target);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: width 0.3s ease, height 0.3s ease;
  }

  &:hover {
    background: ${(props) => (props.$isBattle ? "var(--brutal-red)" : "var(--brutal-lime)")};
    border: var(--border-width) solid var(--border-primary);
    box-shadow: ${(props) => (props.$isBattle ? "var(--shadow-brutal-sm)" : "var(--shadow-brutal-sm)")} 0px 0px var(--border-primary);
    transform: ${(props) => (props.$isBattle ? "scale(1.05) translate(1px, 1px)" : "translate(1px, 1px)")};
  }

  &:active {
    transform: ${(props) => (props.$isBattle ? "scale(1.05) translate(2px, 2px)" : "translate(2px, 2px)")};
    box-shadow: ${(props) => (props.$isBattle ? "1px 1px" : "1px 1px")} 0px 0px var(--border-primary);

    &::before {
      width: 100px;
      height: 100px;
    }
  }

  @media (max-width: 768px) {
    padding: ${(props) => (props.$isBattle ? "10px 12px" : "6px 8px")};
    border-width: var(--border-width);
    box-shadow: ${(props) => {
      if (props.$isBattle && props.$active) return "var(--shadow-brutal-sm)"
      if (props.$isBattle) return "var(--shadow-brutal-sm)"
      if (props.$active) return "var(--shadow-brutal-sm)"
      return "none"
    }};
    transform: ${(props) => (props.$isBattle ? "scale(1.05)" : "scale(1)")};

    &:hover {
      border-width: var(--border-width);
      box-shadow: ${(props) => (props.$isBattle ? "var(--shadow-brutal-sm)" : "var(--shadow-brutal-sm)")} 0px 0px var(--border-primary);
      transform: ${(props) => (props.$isBattle ? "scale(1.05) translate(1px, 1px)" : "translate(1px, 1px)")};
    }

    &:active {
      transform: ${(props) => (props.$isBattle ? "scale(1.05) translate(1px, 1px)" : "translate(1px, 1px)")};
      box-shadow: ${(props) => (props.$isBattle ? "1px 1px" : "1px 1px")} 0px 0px var(--border-primary);
    }
  }

  @media (max-width: 480px) {
    padding: ${(props) => (props.$isBattle ? "8px 10px" : "4px 6px")};
    border-width: var(--border-width);
    box-shadow: ${(props) => {
      if (props.$isBattle && props.$active) return "var(--shadow-offset) var(--shadow-offset) 0px 0px var(--border-primary)"
      if (props.$isBattle) return "var(--shadow-offset) var(--shadow-offset) 0px 0px var(--border-primary)"
      if (props.$active) return "var(--shadow-offset) var(--shadow-offset) 0px 0px var(--border-primary)"
      return "none"
    }};
    transform: none;

    &:hover {
      transform: none;
      box-shadow: ${(props) => (props.$isBattle ? "var(--shadow-offset) var(--shadow-offset)" : "var(--shadow-offset) var(--shadow-offset)")} 0px 0px var(--border-primary);
    }

    &:active {
      transform: none;
      box-shadow: ${(props) => (props.$isBattle ? "1px 1px" : "1px 1px")} 0px 0px var(--border-primary);
    }
  }
`

const NavIcon = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 768px) {
    width: 20px;
    height: 20px;
  }
  
  @media (max-width: 480px) {
    width: 18px;
    height: 18px;
  }
`

const NavLabel = styled.span`
  font-size: 10px;
  font-weight: 900;
  font-family: var(--font-mono);
  letter-spacing: 0.5px;
  
  @media (max-width: 768px) {
    font-size: 9px;
    letter-spacing: 0.3px;
  }
  
  @media (max-width: 480px) {
    font-size: 8px;
    letter-spacing: 0.2px;
  }
`

const navItems = [
  { href: "/team", icon: Users, label: "Team" },
  { href: "/tournament", icon: Trophy, label: "Tournament" },
  { href: "/battle", icon: Swords, label: "Battle", isBattle: true },
  { href: "/defi", icon: DollarSign, label: "DeFi" },
  { href: "/profile", icon: User, label: "Profile" },
]

export function BottomNavigation() {
  const pathname = usePathname()

  return (
    <NavContainer>
      <NavList>
        {navItems.map(({ href, icon: Icon, label, isBattle }) => (
          <NavItem key={href} href={href} $active={pathname === href} $isBattle={isBattle}>
            <NavIcon>
              <Icon size={isBattle ? 24 : 20} />
            </NavIcon>
            <NavLabel>{label}</NavLabel>
          </NavItem>
        ))}
      </NavList>
    </NavContainer>
  )
}
