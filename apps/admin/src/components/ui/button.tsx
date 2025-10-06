import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // New green theme variants
        "green-primary": "bg-green-theme-primary text-green-theme-primary-foreground hover:bg-green-theme-accent focus-visible:ring-green-theme-primary",
        "green-outline": "border border-green-theme-accent bg-background text-green-theme-primary hover:bg-green-theme-secondary hover:text-green-theme-primary focus-visible:ring-green-theme-primary",
        "green-ghost": "text-green-theme-primary hover:bg-green-theme-secondary hover:text-green-theme-primary",
        // New gold theme variants
        "gold-primary": "bg-gold-theme-primary text-gold-theme-primary-foreground hover:bg-gold-theme-accent focus-visible:ring-gold-theme-primary",
        "gold-outline": "border border-gold-theme-accent bg-background text-gold-theme-primary hover:bg-gold-theme-secondary hover:text-gold-theme-primary focus-visible:ring-gold-theme-primary",
        "gold-ghost": "text-gold-theme-primary hover:bg-gold-theme-secondary hover:text-gold-theme-primary",
        
        // Transaction type variants
        "earn-primary": "bg-soft-gold text-soft-gold-foreground hover:bg-soft-gold-accent focus-visible:ring-soft-gold-accent",
        "earn-outline": "border border-soft-gold-accent bg-background text-soft-gold-foreground hover:bg-soft-gold-muted hover:text-soft-gold-foreground focus-visible:ring-soft-gold-accent",
        "redeem-primary": "bg-silver-theme-primary text-silver-theme-primary-foreground hover:bg-silver-theme-accent focus-visible:ring-silver-theme-accent",
        "redeem-outline": "border border-silver-theme-accent bg-background text-silver-theme-primary hover:bg-silver-theme-secondary hover:text-silver-theme-primary focus-visible:ring-silver-theme-accent",
        
        // Status variants
        "status-success": "bg-status-success text-white hover:bg-green-theme-accent focus-visible:ring-status-success",
        "status-warning": "bg-status-warning text-white hover:bg-gold-theme-accent focus-visible:ring-status-warning",
        "status-error": "bg-status-error text-white hover:bg-status-error/90 focus-visible:ring-status-error",
        "status-info": "bg-status-info text-white hover:bg-status-info/90 focus-visible:ring-status-info",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
