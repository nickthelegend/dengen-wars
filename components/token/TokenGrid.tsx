"use client"

import { useState, useEffect } from "react"
import styled from "styled-components"
import { TokenCard } from "./TokenCard"

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr) auto;
  gap: 12px;
  margin-bottom: 20px;
  
  /* Make the 5th card span both columns in the last row */
  > :nth-child(5) {
    grid-column: 1 / -1;
    max-width: 200px;
    margin: 0 auto;
  }
`

const GridTitle = styled.h2`
  font-family: var(--font-space-grotesk);
  font-weight: 700;
  font-size: 20px;
  color: white;
  margin-bottom: 16px;
  text-align: center;
`

interface VestigeToken {
  id: number
  ticker: string
  name: string
  price: number
  price1d: number
  image: string
  rank: number
}

export function TokenGrid() {
  const [selectedTokens, setSelectedTokens] = useState<string[]>([])
  const [tokens, setTokens] = useState<VestigeToken[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const response = await fetch(
          "https://api.vestigelabs.org/assets/list?network_id=0&exclude_labels=8,7&denominating_asset_id=31566704&limit=20&offset=0&order_by=rank&order_dir=asc",
        )
        const data = await response.json()

        // Filter out ALGO and take first 5 tokens
        const filteredTokens = data.results.filter((token: VestigeToken) => token.ticker !== "ALGO").slice(0, 5)

        setTokens(filteredTokens)
        setLoading(false)
      } catch (error) {
        console.error("Failed to fetch tokens:", error)
        setLoading(false)
      }
    }

    fetchTokens()
  }, [])

  const handleTokenSelect = (symbol: string) => {
    if (selectedTokens.includes(symbol)) {
      setSelectedTokens(selectedTokens.filter((s) => s !== symbol))
    } else if (selectedTokens.length < 5) {
      setSelectedTokens([...selectedTokens, symbol])
    }
  }

  const calculateChange = (current: number, previous: number) => {
    return ((current - previous) / previous) * 100
  }

  if (loading) {
    return (
      <div>
        <GridTitle>Loading Tokens...</GridTitle>
      </div>
    )
  }

  return (
    <div>
      <GridTitle>Select Your Squad ({selectedTokens.length}/5)</GridTitle>
      <GridContainer>
        {tokens.map((token) => {
          const change = calculateChange(token.price, token.price1d)
          return (
            <TokenCard
              key={token.id}
              symbol={token.ticker}
              logo={token.image}
              price={token.price}
              change={change}
              points={Math.floor(Math.random() * 1000) + 100} // Mock points for now
              selected={selectedTokens.includes(token.ticker)}
              onClick={() => handleTokenSelect(token.ticker)}
            />
          )
        })}
      </GridContainer>
    </div>
  )
}
