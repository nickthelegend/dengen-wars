import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold font-mono uppercase tracking-wide transition-all duration-75 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 border-3 border-black shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-x-1 active:translate-y-1 active:shadow-none",
  {
    variants: {
      variant: {
        default:
          "bg-yellow-300 text-black border-black hover:bg-lime-300",
        destructive:
          "bg-red-300 text-black border-black hover:bg-red-400",
        outline:
          "bg-white text-black border-black hover:bg-yellow-300",
        secondary:
          "bg-cyan-300 text-black border-black hover:bg-cyan-400",
        ghost:
          "bg-transparent border-transparent shadow-none hover:bg-yellow-300 hover:border-black hover:shadow-brutal",
        link: "bg-transparent border-transparent shadow-none text-black underline-offset-4 hover:underline hover:bg-yellow-300",
        success:
          "bg-lime-300 text-black border-black hover:bg-lime-400",
        warning:
          "bg-orange-300 text-black border-black hover:bg-orange-400",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 px-4 py-2",
        lg: "h-14 px-8 py-4 text-base",
        icon: "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
