// Type fix for React compatibility issues
declare module 'react' {
  namespace React {
    type ReactNode = import('react').ReactNode
  }
}
