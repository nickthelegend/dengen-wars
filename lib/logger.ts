interface LogEntry {
  level: 'info' | 'warn' | 'error'
  message: string
  data?: any
  timestamp: string
  userId?: string
}

class Logger {
  private logs: LogEntry[] = []

  private createEntry(level: LogEntry['level'], message: string, data?: any, userId?: string): LogEntry {
    return {
      level,
      message,
      data,
      userId,
      timestamp: new Date().toISOString()
    }
  }

  info(message: string, data?: any, userId?: string) {
    const entry = this.createEntry('info', message, data, userId)
    this.logs.push(entry)
    console.log(`[INFO] ${message}`, data)
  }

  warn(message: string, data?: any, userId?: string) {
    const entry = this.createEntry('warn', message, data, userId)
    this.logs.push(entry)
    console.warn(`[WARN] ${message}`, data)
  }

  error(message: string, error?: any, userId?: string) {
    const entry = this.createEntry('error', message, error, userId)
    this.logs.push(entry)
    console.error(`[ERROR] ${message}`, error)
    
    // Send to external logging service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService(entry)
    }
  }

  private async sendToExternalService(entry: LogEntry) {
    try {
      // Implement external logging service integration
      // e.g., Sentry, LogRocket, etc.
    } catch (err) {
      console.error('Failed to send log to external service:', err)
    }
  }

  getLogs(level?: LogEntry['level']): LogEntry[] {
    return level ? this.logs.filter(log => log.level === level) : this.logs
  }
}

export const logger = new Logger()