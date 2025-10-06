import React from 'react'

// Mock for @radix-ui/react-label
export const Root = React.forwardRef<HTMLLabelElement, React.ComponentPropsWithoutRef<'label'>>(
  ({ children, ...props }, ref) => 
    React.createElement('label', { ref, ...props }, children)
)

Root.displayName = 'Label'

export { Root as Label }
