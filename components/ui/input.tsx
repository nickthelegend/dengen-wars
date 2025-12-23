import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-yellow-300 selection:text-black border-black flex h-12 w-full min-w-0 border-3 bg-white px-4 py-3 text-base font-mono font-bold shadow-brutal transition-all duration-75 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus:translate-x-1 focus:translate-y-1 focus:shadow-none focus:bg-yellow-200",
        "aria-invalid:border-red-400 aria-invalid:bg-red-200",
        className
      )}
      {...props}
    />
  )
}

export { Input }
