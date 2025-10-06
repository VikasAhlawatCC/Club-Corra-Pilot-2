import React from 'react'

// Create mock components with displayName
const MockOverlay = React.forwardRef(({ children, ...props }: any, ref: any) =>
  React.createElement('div', { 'data-testid': 'dialog-overlay', ref, ...props }, children)
)
MockOverlay.displayName = 'DialogOverlay'

const MockContent = React.forwardRef(({ children, ...props }: any, ref: any) =>
  React.createElement('div', { 'data-testid': 'dialog-content', ref, ...props }, children)
)
MockContent.displayName = 'DialogContent'

const MockTitle = React.forwardRef(({ children, ...props }: any, ref: any) =>
  React.createElement('div', { 'data-testid': 'dialog-title', ref, ...props }, children)
)
MockTitle.displayName = 'DialogTitle'

const MockDescription = React.forwardRef(({ children, ...props }: any, ref: any) =>
  React.createElement('div', { 'data-testid': 'dialog-description', ref, ...props }, children)
)
MockDescription.displayName = 'DialogDescription'

// Export all named exports
export const Root = ({ children, ...props }: any) =>
  React.createElement('div', { 'data-testid': 'dialog-root', ...props }, children)
  
export const Trigger = ({ children, ...props }: any) =>
  React.createElement('div', { 'data-testid': 'dialog-trigger', ...props }, children)
  
export const Portal = ({ children, ...props }: any) =>
  React.createElement('div', { 'data-testid': 'dialog-portal', ...props }, children)
  
export const Close = ({ children, ...props }: any) =>
  React.createElement('button', { 'data-testid': 'dialog-close', ...props }, children)
  
export const Overlay = MockOverlay
export const Content = MockContent
export const Title = MockTitle
export const Description = MockDescription

