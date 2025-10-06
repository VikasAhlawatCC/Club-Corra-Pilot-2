import React from 'react'

// Create mock components with displayName
const MockTrigger = React.forwardRef(({ children, ...props }: any, ref: any) =>
  React.createElement('div', { 'data-testid': 'dropdown-trigger', ref, ...props }, children)
)
MockTrigger.displayName = 'DropdownMenuTrigger'

const MockContent = React.forwardRef(({ children, ...props }: any, ref: any) =>
  React.createElement('div', { 'data-testid': 'dropdown-content', ref, ...props }, children)
)
MockContent.displayName = 'DropdownMenuContent'

const MockItem = React.forwardRef(({ children, ...props }: any, ref: any) =>
  React.createElement('div', { 'data-testid': 'dropdown-item', ref, ...props }, children)
)
MockItem.displayName = 'DropdownMenuItem'

const MockCheckboxItem = React.forwardRef(({ children, ...props }: any, ref: any) =>
  React.createElement('div', { 'data-testid': 'dropdown-checkbox-item', ref, ...props }, children)
)
MockCheckboxItem.displayName = 'DropdownMenuCheckboxItem'

const MockRadioItem = React.forwardRef(({ children, ...props }: any, ref: any) =>
  React.createElement('div', { 'data-testid': 'dropdown-radio-item', ref, ...props }, children)
)
MockRadioItem.displayName = 'DropdownMenuRadioItem'

const MockLabel = React.forwardRef(({ children, ...props }: any, ref: any) =>
  React.createElement('div', { 'data-testid': 'dropdown-label', ref, ...props }, children)
)
MockLabel.displayName = 'DropdownMenuLabel'

const MockSeparator = React.forwardRef(({ children, ...props }: any, ref: any) =>
  React.createElement('div', { 'data-testid': 'dropdown-separator', ref, ...props }, children)
)
MockSeparator.displayName = 'DropdownMenuSeparator'

const MockSub = React.forwardRef(({ children, ...props }: any, ref: any) =>
  React.createElement('div', { 'data-testid': 'dropdown-sub', ref, ...props }, children)
)
MockSub.displayName = 'DropdownMenuSub'

const MockSubTrigger = React.forwardRef(({ children, ...props }: any, ref: any) =>
  React.createElement('div', { 'data-testid': 'dropdown-sub-trigger', ref, ...props }, children)
)
MockSubTrigger.displayName = 'DropdownMenuSubTrigger'

const MockSubContent = React.forwardRef(({ children, ...props }: any, ref: any) =>
  React.createElement('div', { 'data-testid': 'dropdown-sub-content', ref, ...props }, children)
)
MockSubContent.displayName = 'DropdownMenuSubContent'

// Export all named exports
export const Root = ({ children, ...props }: any) =>
  React.createElement('div', { 'data-testid': 'dropdown-root', ...props }, children)
  
export const Trigger = MockTrigger
export const Portal = ({ children, ...props }: any) => React.createElement(React.Fragment, null, children)
export const Content = MockContent
export const Group = ({ children, ...props }: any) =>
  React.createElement('div', { 'data-testid': 'dropdown-group', ...props }, children)
export const Item = MockItem
export const CheckboxItem = MockCheckboxItem
export const RadioGroup = ({ children, ...props }: any) =>
  React.createElement('div', { 'data-testid': 'dropdown-radio-group', ...props }, children)
export const RadioItem = MockRadioItem
export const Label = MockLabel
export const Separator = MockSeparator
export const Sub = MockSub
export const SubTrigger = MockSubTrigger
export const SubContent = MockSubContent
export const ItemIndicator = ({ children, ...props }: any) =>
  React.createElement('div', { 'data-testid': 'dropdown-item-indicator', ...props }, children)

