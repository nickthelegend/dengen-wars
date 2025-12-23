import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center border-3 border-black px-3 py-1 text-xs font-bold font-mono uppercase tracking-wide w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none shadow-brutal-sm transition-all duration-75 overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-yellow-300 text-black [a&]:hover:bg-lime-300 [a&]:hover:translate-x-0.5 [a&]:hover:translate-y-0.5 [a&]:hover:shadow-none",
        secondary:
          "bg-cyan-300 text-black [a&]:hover:bg-pink-300 [a&]:hover:translate-x-0.5 [a&]:hover:translate-y-0.5 [a&]:hover:shadow-none",
        destructive:
          "bg-red-300 text-black [a&]:hover:bg-red-400 [a&]:hover:translate-x-0.5 [a&]:hover:translate-y-0.5 [a&]:hover:shadow-none",
        outline:
          "bg-white text-black [a&]:hover:bg-yellow-300 [a&]:hover:translate-x-0.5 [a&]:hover:translate-y-0.5 [a&]:hover:shadow-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
