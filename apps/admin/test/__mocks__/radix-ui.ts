// Mock for @radix-ui/react components
import React from 'react'

export const Select = ({ children, ...props }: any) => 
  React.createElement('div', { 'data-testid': 'select', ...props }, children)

export const SelectTrigger = ({ children, ...props }: any) => 
  React.createElement('div', { 'data-testid': 'select-trigger', ...props }, children)

export const SelectValue = ({ ...props }: any) => 
  React.createElement('div', { 'data-testid': 'select-value', ...props })

export const SelectContent = ({ children, ...props }: any) => 
  React.createElement('div', { 'data-testid': 'select-content', ...props }, children)

export const SelectItem = ({ children, ...props }: any) => 
  React.createElement('div', { 'data-testid': 'select-item', ...props }, children)

export const Dialog = ({ children, ...props }: any) => 
  React.createElement('div', { 'data-testid': 'dialog', ...props }, children)

export const DialogTrigger = ({ children, ...props }: any) => 
  React.createElement('div', { 'data-testid': 'dialog-trigger', ...props }, children)

export const DialogContent = ({ children, ...props }: any) => 
  React.createElement('div', { 'data-testid': 'dialog-content', ...props }, children)

export const DialogHeader = ({ children, ...props }: any) => 
  React.createElement('div', { 'data-testid': 'dialog-header', ...props }, children)

export const DialogTitle = ({ children, ...props }: any) => 
  React.createElement('div', { 'data-testid': 'dialog-title', ...props }, children)

export const DialogDescription = ({ children, ...props }: any) => 
  React.createElement('div', { 'data-testid': 'dialog-description', ...props }, children)

export const DialogFooter = ({ children, ...props }: any) => 
  React.createElement('div', { 'data-testid': 'dialog-footer', ...props }, children)

export const AlertDialog = ({ children, ...props }: any) => 
  React.createElement('div', { 'data-testid': 'alert-dialog', ...props }, children)

export const AlertDialogTrigger = ({ children, ...props }: any) => 
  React.createElement('div', { 'data-testid': 'alert-dialog-trigger', ...props }, children)

export const AlertDialogContent = ({ children, ...props }: any) => 
  React.createElement('div', { 'data-testid': 'alert-dialog-content', ...props }, children)

export const AlertDialogHeader = ({ children, ...props }: any) => 
  React.createElement('div', { 'data-testid': 'alert-dialog-header', ...props }, children)

export const AlertDialogTitle = ({ children, ...props }: any) => 
  React.createElement('div', { 'data-testid': 'alert-dialog-title', ...props }, children)

export const AlertDialogDescription = ({ children, ...props }: any) => 
  React.createElement('div', { 'data-testid': 'alert-dialog-description', ...props }, children)

export const AlertDialogFooter = ({ children, ...props }: any) => 
  React.createElement('div', { 'data-testid': 'alert-dialog-footer', ...props }, children)

export const AlertDialogAction = ({ children, ...props }: any) => 
  React.createElement('button', { 'data-testid': 'alert-dialog-action', ...props }, children)

export const AlertDialogCancel = ({ children, ...props }: any) => 
  React.createElement('button', { 'data-testid': 'alert-dialog-cancel', ...props }, children)

export const Tabs = ({ children, ...props }: any) => 
  React.createElement('div', { 'data-testid': 'tabs', ...props }, children)

export const TabsList = ({ children, ...props }: any) => 
  React.createElement('div', { 'data-testid': 'tabs-list', ...props }, children)

export const TabsTrigger = ({ children, ...props }: any) => 
  React.createElement('button', { 'data-testid': 'tabs-trigger', ...props }, children)

export const TabsContent = ({ children, ...props }: any) => 
  React.createElement('div', { 'data-testid': 'tabs-content', ...props }, children)

export const Button = ({ children, ...props }: any) => 
  React.createElement('button', { 'data-testid': 'button', ...props }, children)

export const Input = ({ ...props }: any) => 
  React.createElement('input', { 'data-testid': 'input', ...props })

export const Label = ({ children, ...props }: any) => 
  React.createElement('label', { 'data-testid': 'label', ...props }, children)

export const Card = ({ children, ...props }: any) => 
  React.createElement('div', { 'data-testid': 'card', ...props }, children)

export const CardHeader = ({ children, ...props }: any) => 
  React.createElement('div', { 'data-testid': 'card-header', ...props }, children)

export const CardTitle = ({ children, ...props }: any) => 
  React.createElement('div', { 'data-testid': 'card-title', ...props }, children)

export const CardContent = ({ children, ...props }: any) => 
  React.createElement('div', { 'data-testid': 'card-content', ...props }, children)

export const CardFooter = ({ children, ...props }: any) =>
  React.createElement('div', { 'data-testid': 'card-footer', ...props }, children)

// Mock for @radix-ui/react-label Root
export const Root = ({ children, ...props }: any) =>
  React.createElement('label', { 'data-testid': 'label-root', ...props }, children)

// Mock the displayName property
Root.displayName = 'Label'

// Mock the displayName properties for existing Select components
SelectTrigger.displayName = 'SelectTrigger'
SelectValue.displayName = 'SelectValue'
SelectContent.displayName = 'SelectContent'
SelectItem.displayName = 'SelectItem'

// Mock for SelectPrimitive
export const SelectPrimitive = {
  Root: ({ children, ...props }: any) =>
    React.createElement('div', { 'data-testid': 'select-root', ...props }, children),
  Group: ({ children, ...props }: any) =>
    React.createElement('div', { 'data-testid': 'select-group', ...props }, children),
  Value: ({ ...props }: any) =>
    React.createElement('div', { 'data-testid': 'select-value', ...props }),
  Trigger: {
    displayName: 'SelectTrigger'
  },
  Content: {
    displayName: 'SelectContent'
  },
  Item: {
    displayName: 'SelectItem'
  },
  ScrollUpButton: {
    displayName: 'SelectScrollUpButton'
  },
  ScrollDownButton: {
    displayName: 'SelectScrollDownButton'
  },
  Icon: ({ children, ...props }: any) =>
    React.createElement('div', { 'data-testid': 'select-icon', ...props }, children)
}

// Set displayName properties
SelectPrimitive.Trigger.displayName = 'SelectTrigger'
SelectPrimitive.Content.displayName = 'SelectContent'
SelectPrimitive.Item.displayName = 'SelectItem'
SelectPrimitive.ScrollUpButton.displayName = 'SelectScrollUpButton'
SelectPrimitive.ScrollDownButton.displayName = 'SelectScrollDownButton'