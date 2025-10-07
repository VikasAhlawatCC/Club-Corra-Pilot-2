/**
 * Utility functions for handling integer-only values in the admin panel
 * Enforces the business rule: "All amounts must be whole numbers only"
 */

/**
 * Safely parses a string value to an integer, defaulting to 0 if invalid
 * @param value - The string value to parse
 * @returns The parsed integer or 0 if invalid
 */
export const parseInteger = (value: string | number | undefined | null): number => {
  if (value === undefined || value === null || value === '') {
    return 0
  }
  
  if (typeof value === 'number') {
    return Math.floor(value) // Ensure it's an integer
  }
  
  const parsed = parseInt(value.toString(), 10)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Safely parses a string value to an integer, returning undefined if invalid
 * @param value - The string value to parse
 * @returns The parsed integer or undefined if invalid
 */
export const parseIntegerOptional = (value: string | number | undefined | null): number | undefined => {
  if (value === undefined || value === null || value === '') {
    return undefined
  }
  
  if (typeof value === 'number') {
    return Math.floor(value) // Ensure it's an integer
  }
  
  const parsed = parseInt(value.toString(), 10)
  return isNaN(parsed) ? undefined : parsed
}

/**
 * Formats a number as an integer string with proper currency formatting
 * @param value - The number to format
 * @param currency - The currency symbol (default: '₹')
 * @returns Formatted string
 */
export const formatIntegerCurrency = (value: number, currency: string = '₹'): string => {
  const integerValue = Math.floor(value)
  return `${currency}${integerValue.toLocaleString('en-IN')}`
}

/**
 * Formats a number as an integer string
 * @param value - The number to format
 * @returns Formatted integer string
 */
export const formatInteger = (value: number): string => {
  const integerValue = Math.floor(value)
  return integerValue.toLocaleString('en-IN')
}

/**
 * Validates that a value is a valid integer
 * @param value - The value to validate
 * @returns True if the value is a valid integer
 */
export const isValidInteger = (value: any): boolean => {
  if (typeof value === 'number') {
    return Number.isInteger(value) && value >= 0
  }
  
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10)
    return !isNaN(parsed) && parsed >= 0 && parsed.toString() === value.trim()
  }
  
  return false
}

/**
 * Clamps a value to be within a valid integer range
 * @param value - The value to clamp
 * @param min - Minimum value (default: 0)
 * @param max - Maximum value (default: Number.MAX_SAFE_INTEGER)
 * @returns Clamped integer value
 */
export const clampInteger = (value: number, min: number = 0, max: number = Number.MAX_SAFE_INTEGER): number => {
  const integerValue = Math.floor(value)
  return Math.max(min, Math.min(max, integerValue))
}

/**
 * Handles input change events for integer-only fields
 * @param event - The input change event
 * @param onChange - The onChange callback
 */
export const handleIntegerInputChange = (
  event: React.ChangeEvent<HTMLInputElement>,
  onChange: (value: number) => void
): void => {
  const value = event.target.value
  const integerValue = parseInteger(value)
  onChange(integerValue)
}

/**
 * Handles input change events for optional integer fields
 * @param event - The input change event
 * @param onChange - The onChange callback
 */
export const handleOptionalIntegerInputChange = (
  event: React.ChangeEvent<HTMLInputElement>,
  onChange: (value: number | undefined) => void
): void => {
  const value = event.target.value
  const integerValue = parseIntegerOptional(value)
  onChange(integerValue)
}
