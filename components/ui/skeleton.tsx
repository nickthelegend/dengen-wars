import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  )
}

// Battle-specific skeleton components
function BattleHeaderSkeleton() {
  return (
    <div className="bg-red-500 border-4 border-gray-800 p-5 shadow-[4px_4px_0px_0px_#374151] text-center">
      <Skeleton className="h-8 w-64 mx-auto mb-4" />
      <div className="flex gap-4 justify-center mb-4">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-24" />
      </div>
      <Skeleton className="h-12 w-32 mx-auto" />
    </div>
  )
}

function TeamSectionSkeleton() {
  return (
    <div className="bg-gray-100 border-4 border-gray-800 p-5 shadow-[4px_4px_0px_0px_#374151]">
      <Skeleton className="h-6 w-48 mb-4" />
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  )
}

function BattleChartSkeleton() {
  return (
    <div className="bg-white border-4 border-gray-800 p-5 shadow-[4px_4px_0px_0px_#374151]">
      <Skeleton className="h-6 w-32 mb-4" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

function CoinGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white border-4 border-gray-800 p-4 shadow-[4px_4px_0px_0px_#374151]">
          <Skeleton className="h-6 w-24 mb-2" />
          <Skeleton className="h-4 w-16 mb-2" />
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  )
}

function TokenCardSkeleton() {
  return (
    <div className="bg-white border-4 border-gray-800 p-4 shadow-[4px_4px_0px_0px_#374151]">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-5 w-20 mb-1" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      <Skeleton className="h-6 w-24 mb-2" />
      <Skeleton className="h-4 w-32" />
    </div>
  )
}

export {
  Skeleton,
  BattleHeaderSkeleton,
  TeamSectionSkeleton,
  BattleChartSkeleton,
  CoinGridSkeleton,
  TokenCardSkeleton
}
