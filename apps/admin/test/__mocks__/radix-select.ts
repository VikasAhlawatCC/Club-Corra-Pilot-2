import React from 'react'

// Create mock components with displayName
const MockTrigger = React.forwardRef(({ children, ...props }: any, ref: any) =>
  React.createElement('div', { 'data-testid': 'select-trigger', ref, ...props }, children)
)
MockTrigger.displayName = 'SelectTrigger'

const MockContent = React.forwardRef(({ children, ...props }: any, ref: any) =>
  React.createElement('div', { 'data-testid': 'select-content', ref, ...props }, children)
)
MockContent.displayName = 'SelectContent'

const MockItem = React.forwardRef(({ children, ...props }: any, ref: any) =>
  React.createElement('div', { 'data-testid': 'select-item', ref, ...props }, children)
)
MockItem.displayName = 'SelectItem'

const MockScrollUpButton = React.forwardRef(({ children, ...props }: any, ref: any) =>
  React.createElement('div', { 'data-testid': 'select-scroll-up', ref, ...props }, children)
)
MockScrollUpButton.displayName = 'SelectScrollUpButton'

const MockScrollDownButton = React.forwardRef(({ children, ...props }: any, ref: any) =>
  React.createElement('div', { 'data-testid': 'select-scroll-down', ref, ...props }, children)
)
MockScrollDownButton.displayName = 'SelectScrollDownButton'

// Export all named exports
export const Root = ({ children, ...props }: any) =>
  React.createElement('div', { 'data-testid': 'select-root', ...props }, children)
  
export const Group = ({ children, ...props }: any) =>
  React.createElement('div', { 'data-testid': 'select-group', ...props }, children)
  
export const Value = ({ ...props }: any) =>
  React.createElement('div', { 'data-testid': 'select-value', ...props })
  
export const Trigger = MockTrigger
export const Content = MockContent
export const Item = MockItem
export const ScrollUpButton = MockScrollUpButton
export const ScrollDownButton = MockScrollDownButton

export const Icon = ({ children, asChild, ...props }: any) =>
  asChild ? children : React.createElement('div', { 'data-testid': 'select-icon', ...props }, children)

const MockLabel = React.forwardRef(({ children, ...props }: any, ref: any) =>
  React.createElement('div', { 'data-testid': 'select-label', ref, ...props }, children)
)
MockLabel.displayName = 'SelectLabel'

const MockSeparator = React.forwardRef(({ children, ...props }: any, ref: any) =>
  React.createElement('div', { 'data-testid': 'select-separator', ref, ...props }, children)
)
MockSeparator.displayName = 'SelectSeparator'

const MockViewport = React.forwardRef(({ children, ...props }: any, ref: any) =>
  React.createElement('div', { 'data-testid': 'select-viewport', ref, ...props }, children)
)
MockViewport.displayName = 'SelectViewport'

export const Label = MockLabel
export const Separator = MockSeparator
export const Viewport = MockViewport
