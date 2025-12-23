export interface Tournament {
  id: string
  name: string
  description: string
  type: 'single_elimination' | 'double_elimination' | 'round_robin'
  status: 'upcoming' | 'registration' | 'active' | 'completed'
  maxParticipants: number
  currentParticipants: number
  entryFee: number
  prizePool: number
  startTime: string
  endTime?: string
  rules: TournamentRule[]
  brackets: TournamentBracket[]
}

export interface TournamentRule {
  id: string
  description: string
  type: 'team_composition' | 'battle_duration' | 'special_modifier'
}

export interface TournamentBracket {
  id: string
  round: number
  position: number
  player1Id?: string
  player2Id?: string
  winnerId?: string
  battleId?: string
  status: 'pending' | 'active' | 'completed'
}

export interface TournamentParticipant {
  id: string
  tournamentId: string
  userId: string
  teamData: string
  registeredAt: string
  eliminated: boolean
}