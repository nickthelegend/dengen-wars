import { useEffect, useState } from 'react'
import io from 'socket.io-client'

export function useSocket() {
  const [socket, setSocket] = useState<any>(null)
  const [connected, setConnected] = useState(false)
  
  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001')

    socketInstance.on('connect', () => {
      setConnected(true)
    })

    socketInstance.on('disconnect', () => {
      setConnected(false)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.close()
    }
  }, [])
  
  return { socket, connected }
}