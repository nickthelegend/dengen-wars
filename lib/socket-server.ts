import { Server } from 'socket.io'

interface Player {
  id: string
  username: string
  walletAddress: string
  team: any[]
}

interface BattleRoom {
  id: string
  players: [Player, Player]
  status: 'waiting' | 'active' | 'finished'
  startTime: number
  priceData: any[]
}

export class BattleServer {
  private io: Server
  private matchmakingQueue: Player[] = []
  private activeRooms: Map<string, BattleRoom> = new Map()
  
  constructor(server: any) {
    this.io = new Server(server, {
      cors: {
        origin: [
          'http://localhost:3000',
          'https://your-app.vercel.app',
          process.env.NEXT_PUBLIC_BASE_URL
        ].filter((origin): origin is string => Boolean(origin)),
        methods: ['GET', 'POST']
      }
    })
    this.setupEventHandlers()
  }
  
  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      socket.on('join-queue', (player: Player) => {
        this.addToQueue(socket, player)
      })
      
      socket.on('leave-queue', () => {
        this.removeFromQueue(socket)
      })
      
      socket.on('join-room', (roomId: string) => {
        socket.join(roomId)
      })
      
      socket.on('disconnect', () => {
        this.handleDisconnect(socket)
      })
    })
  }
  
  private addToQueue(socket: any, player: Player) {
    this.matchmakingQueue.push(player)
    socket.player = player
    
    this.io.emit('queue-update', { queueSize: this.matchmakingQueue.length })
    this.tryMatchmaking()
  }
  
  private removeFromQueue(socket: any) {
    if (socket.player) {
      this.matchmakingQueue = this.matchmakingQueue.filter(p => p.id !== socket.player.id)
    }
  }
  
  private handleDisconnect(socket: any) {
    this.removeFromQueue(socket)
  }
  
  private tryMatchmaking() {
    if (this.matchmakingQueue.length >= 2) {
      const player1 = this.matchmakingQueue.shift()!
      const player2 = this.matchmakingQueue.shift()!
      
      this.createBattleRoom(player1, player2)
    }
  }
  
  private createBattleRoom(player1: Player, player2: Player) {
    const roomId = `battle_${Date.now()}`
    const room: BattleRoom = {
      id: roomId,
      players: [player1, player2],
      status: 'waiting',
      startTime: Date.now(),
      priceData: []
    }
    
    this.activeRooms.set(roomId, room)
    
    this.io.emit('match-found', { roomId, players: [player1, player2] })
    
    setTimeout(() => this.startBattle(roomId), 3000)
  }
  
  private startBattle(roomId: string) {
    const room = this.activeRooms.get(roomId)
    if (!room) return
    
    room.status = 'active'
    this.io.to(roomId).emit('battle-start', { room })
    
    this.startPriceUpdates(roomId)
  }
  
  private startPriceUpdates(roomId: string) {
    const interval = setInterval(async () => {
      const room = this.activeRooms.get(roomId)
      if (!room || room.status !== 'active') {
        clearInterval(interval)
        return
      }
      
      try {
        const priceUpdate = await this.fetchLatestPrices(room)
        this.io.to(roomId).emit('price-update', priceUpdate)
        
        if (Date.now() - room.startTime > 60000) {
          this.endBattle(roomId)
          clearInterval(interval)
        }
      } catch (error) {
        console.error('Price update error:', error)
      }
    }, 1000)
  }
  
  private async fetchLatestPrices(room: BattleRoom) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/battle-prices`)
    const data = await response.json()
    
    const timestamp = Date.now()
    const priceEntry = { timestamp, prices: data.prices }
    room.priceData.push(priceEntry)
    
    return priceEntry
  }
  
  private async endBattle(roomId: string) {
    const room = this.activeRooms.get(roomId)
    if (!room) return
    
    room.status = 'finished'
    
    const results = this.calculateBattleResults(room)
    this.io.to(roomId).emit('battle-end', results)
    
    // Save battle results to database
    await this.saveBattleResults(room, results)
    
    setTimeout(() => this.activeRooms.delete(roomId), 30000)
  }
  
  private calculateBattleResults(room: BattleRoom) {
    if (room.priceData.length < 2) {
      return { winner: null, tie: true }
    }
    
    const startPrices = room.priceData[0].prices
    const endPrices = room.priceData[room.priceData.length - 1].prices
    
    let player1Score = 0
    let player2Score = 0
    
    room.players[0].team.forEach(coin => {
      const start = startPrices[coin.symbol] || 0
      const end = endPrices[coin.symbol] || 0
      const change = ((end - start) / start) * 100
      player1Score += change
    })
    
    room.players[1].team.forEach(coin => {
      const start = startPrices[coin.symbol] || 0
      const end = endPrices[coin.symbol] || 0
      const change = ((end - start) / start) * 100
      player2Score += change
    })
    
    return {
      player1Score: player1Score.toFixed(4),
      player2Score: player2Score.toFixed(4),
      winner: player1Score > player2Score ? room.players[0] : room.players[1],
      tie: Math.abs(player1Score - player2Score) < 0.0001
    }
  }
  
  private async saveBattleResults(room: BattleRoom, results: any) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/multiplayer-battles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: room.id,
          player1Id: room.players[0].id,
          player2Id: room.players[1].id,
          player1Team: room.players[0].team,
          player2Team: room.players[1].team,
          player1Score: parseFloat(results.player1Score),
          player2Score: parseFloat(results.player2Score),
          winnerId: results.tie ? null : results.winner.id,
          battleData: room.priceData
        })
      })
      
      if (!response.ok) {
        console.error('Failed to save battle results')
      }
    } catch (error) {
      console.error('Error saving battle results:', error)
    }
  }
}