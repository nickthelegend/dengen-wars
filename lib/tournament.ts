import type { Tournament, TournamentBracket } from '../types/tournament'

export function generateTournamentBrackets(participantIds: string[]): TournamentBracket[] {
  const brackets: TournamentBracket[] = []
  const totalRounds = Math.ceil(Math.log2(participantIds.length))
  
  // First round - pair up all participants
  for (let i = 0; i < participantIds.length; i += 2) {
    brackets.push({
      id: `bracket_${i/2}_round_1`,
      round: 1,
      position: i / 2,
      player1Id: participantIds[i],
      player2Id: participantIds[i + 1] || undefined,
      status: 'pending'
    })
  }
  
  // Generate subsequent rounds
  let currentRoundMatches = Math.ceil(participantIds.length / 2)
  for (let round = 2; round <= totalRounds; round++) {
    const nextRoundMatches = Math.ceil(currentRoundMatches / 2)
    for (let i = 0; i < nextRoundMatches; i++) {
      brackets.push({
        id: `bracket_${i}_round_${round}`,
        round,
        position: i,
        status: 'pending'
      })
    }
    currentRoundMatches = nextRoundMatches
  }
  
  return brackets
}

export function advanceTournament(brackets: TournamentBracket[], completedBracketId: string, winnerId: string): TournamentBracket[] {
  const updatedBrackets = [...brackets]
  const completedBracket = updatedBrackets.find(b => b.id === completedBracketId)
  
  if (!completedBracket) return brackets
  
  // Mark bracket as completed
  completedBracket.winnerId = winnerId
  completedBracket.status = 'completed'
  
  // Find next round bracket
  const nextRound = completedBracket.round + 1
  const nextPosition = Math.floor(completedBracket.position / 2)
  const nextBracket = updatedBrackets.find(b => b.round === nextRound && b.position === nextPosition)
  
  if (nextBracket) {
    if (!nextBracket.player1Id) {
      nextBracket.player1Id = winnerId
    } else {
      nextBracket.player2Id = winnerId
      nextBracket.status = 'pending'
    }
  }
  
  return updatedBrackets
}

export function calculatePrizeDistribution(prizePool: number, participantCount: number): Record<string, number> {
  const distribution: Record<string, number> = {}
  
  // Winner gets 50%
  distribution['1st'] = prizePool * 0.5
  
  // Runner-up gets 30%
  distribution['2nd'] = prizePool * 0.3
  
  // Semi-finalists get 10% each
  distribution['3rd'] = prizePool * 0.1
  distribution['4th'] = prizePool * 0.1
  
  return distribution
}