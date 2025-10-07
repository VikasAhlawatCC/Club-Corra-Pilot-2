import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        
        // Transaction type badges
        "earn": "bg-soft-gold text-soft-gold-foreground border-soft-gold-accent",
        "redeem": "bg-silver-theme-secondary text-silver-theme-primary border-silver-theme-accent",
        "welcome-bonus": "bg-green-theme-secondary text-green-theme-primary border-green-theme-accent",
        "adjustment": "bg-gold-theme-secondary text-gold-theme-primary border-gold-theme-accent",
        
        // Status badges
        "pending": "bg-gold-theme-secondary text-gold-theme-primary border-gold-theme-accent",
        "approved": "bg-green-theme-secondary text-green-theme-primary border-green-theme-accent",
        "rejected": "bg-red-100 text-red-800 border-red-300",
        "processed": "bg-green-theme-secondary text-green-theme-primary border-green-theme-accent",
        "paid": "bg-silver-theme-secondary text-silver-theme-primary border-silver-theme-accent",
        "unpaid": "bg-red-100 text-red-800 border-red-300",
        "completed": "bg-green-theme-secondary text-green-theme-primary border-green-theme-accent",
        "failed": "bg-red-100 text-red-800 border-red-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
