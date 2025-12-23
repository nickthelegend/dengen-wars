"use client"

import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '../lib/react-query'
import { ErrorBoundary } from './ErrorBoundary'
import { Providers } from './wallet/Providers'

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <Providers>{children}</Providers>
      </ErrorBoundary>
    </QueryClientProvider>
  )
}