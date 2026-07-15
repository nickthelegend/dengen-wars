# Dengen Wars

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js%2015-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![Algorand](https://img.shields.io/badge/Algorand-000000?style=flat-square&logo=algorand&logoColor=white)

> **Battle, trade, and dominate the meme-coin arena — a real-time PvP game built on Algorand.**

## Overview

Dengen Wars (a.k.a. **Degen League**) is a Web3 game where players assemble teams of meme coins and battle head-to-head, with outcomes driven by live token price action. It pairs an on-chain economy on the Algorand TestNet — a DEGEN utility token, an AMM, staking, and yield farming — with a real-time multiplayer battle layer powered by WebSockets. The frontend is a Next.js App Router app wrapped in a bold neo-brutalist UI, and game state is persisted through Prisma.

This is an actively-developed hackathon / portfolio project; some on-chain flows (e.g. AMM swap settlement) currently run in a demo/placeholder mode while the contract layer matures.

## Features

- **Meme-coin battle arena** — build a team, stake, and fight other players in price-driven battles (`app/battle`, `app/battle-meme`).
- **Real-time multiplayer & matchmaking** — a Socket.IO `BattleServer` handles a matchmaking queue and live battle rooms (`lib/socket-server.ts`, `app/matchmaking`).
- **Multi-wallet Algorand support** — connect with Pera, Defly, Lute, or WalletConnect via `@txnlab/use-wallet-react` and `algosdk`.
- **DeFi hub** — AMM swaps, liquidity pools, staking, yield farming, and atomic swaps, exposed through API routes and helper modules (`app/defi`, `app/api/amm`, `app/api/staking`, `app/api/farming`, `contracts/`).
- **In-game token economy** — a DEGEN ASA token, a dispenser, token sales, and buy/balance flows (`contracts/DegenToken.algo.ts`, `app/buy-tokens`, `app/api/token-sales`).
- **Battle Card NFTs & escrow** — NFT minting and staked-battle escrow logic (`contracts/BattleCardNFT.algo.ts`, `contracts/BattleEscrow.algo.ts`).
- **Tournaments, teams, leaderboard & stats** — dedicated pages plus supporting APIs (`app/tournament`, `app/team`, `app/api/leaderboard`, `app/stats`).
- **Persistence & backend** — Prisma models for users, teams, battles, matchmaking, and rooms, with a Supabase client available for realtime.
- **Tested game logic** — Jest test scripts for battle and room-matchmaking mechanics.

## Tech Stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript
- **Blockchain:** Algorand (`algosdk`), `@txnlab/use-wallet-react`, Pera / Defly / Lute / WalletConnect connectors
- **Realtime:** Socket.IO (server + client)
- **Data:** Prisma ORM (PostgreSQL), Supabase JS
- **UI:** styled-components, Tailwind CSS, Radix UI primitives, MUI + Recharts charts, Lucide icons
- **State/data-fetching:** TanStack React Query, React Hook Form, Zod
- **Tooling:** Jest, ts-jest, tsx, ESLint, Prettier

## Getting Started

```bash
# 1. Clone
git clone https://github.com/nickthelegend/dengen-wars.git
cd dengen-wars

# 2. Install dependencies
npm install

# 3. Configure environment
#    Create a .env with at least:
#    DATABASE_URL=...      # PostgreSQL connection string
#    DIRECT_URL=...        # Prisma direct connection
#    (plus any Supabase / NEXT_PUBLIC_BASE_URL values you use)

# 4. Set up the database
npm run db:generate      # generate the Prisma client
npm run db:push          # sync schema to your database
npm run db:seed          # optional: seed sample data

# 5. Run the dev server
npm run dev              # http://localhost:3000

# Other useful scripts
npm run build            # production build
npm run test             # run Jest tests
npm run db:studio        # open Prisma Studio
```

The app talks to the Algorand **TestNet** by default (see `lib/algorand-config.ts`).

## Project Structure

```
app/            Next.js App Router pages (battle, defi, tournament, team, ...) and API routes
components/     UI: battle, defi, swap, token, wallet, layout, styled + shared primitives
contracts/      Algorand token / AMM / staking / escrow / NFT logic modules (algosdk)
lib/            Algorand config, socket server, price feeds, rewards, prisma, supabase, utils
hooks/          React hooks: sockets, API, swipe, mobile, toasts
prisma/         Prisma schema, seed script, local dev database
public/         Static assets
styles/         Global styles
PLAN.md         Development roadmap
```

---

Built by [**nickthelegend**](https://github.com/nickthelegend) · [nickthelegend.tech](https://nickthelegend.tech)
