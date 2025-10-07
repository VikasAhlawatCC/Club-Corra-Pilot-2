'use client'

import { useState } from 'react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { parseInteger } from '@/utils/numberUtils'

const verificationFormSchema = z.object({
  observedAmount: z.number().min(0, 'Observed amount must be non-negative'),
  receiptDate: z.string().min(1, 'Receipt date is required'),
  verificationConfirmed: z.boolean().refine(val => val === true, {
    message: 'You must confirm verification to proceed'
  }),
  rejectionNote: z.string().optional(),
  adminNotes: z.string().optional(),
})

type VerificationFormData = z.infer<typeof verificationFormSchema>

interface TransactionVerificationFormProps {
  transaction: any
  onSubmit: (data: VerificationFormData) => void
  onCancel: () => void
  isLoading?: boolean
}

export function TransactionVerificationForm({
  transaction,
  onSubmit,
  onCancel,
  isLoading = false
}: TransactionVerificationFormProps) {
  const [formData, setFormData] = useState<VerificationFormData>({
    observedAmount: transaction.billAmount || 0,
    receiptDate: transaction.billDate ? new Date(transaction.billDate).toISOString().split('T')[0] : '',
    verificationConfirmed: false,
    rejectionNote: '',
    adminNotes: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: keyof VerificationFormData, value: any) => {
    setFormData((prev: VerificationFormData) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: Record<string, string>) => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = (e: any) => {
    e.preventDefault()
    
    try {
      const validatedData = verificationFormSchema.parse(formData)
      onSubmit(validatedData)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.issues.forEach((err: z.ZodIssue) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message
          }
        })
        setErrors(newErrors)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Observed Amount Input */}
      <div className="grid gap-2">
        <Label htmlFor="observedAmount" className="flex items-center gap-2 text-sm leading-none font-medium select-none">
          Observed on receipt
        </Label>
        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
            <Input
              id="observedAmount"
              type="number"
              min="0"
              step="1"
              placeholder="e.g. 2450"
              value={formData.observedAmount}
              onChange={(e: any) => handleInputChange('observedAmount', parseInteger(e.target.value))}
              className="pl-7 w-[200px]"
              required
            />
          </div>
          <div className="text-xs text-muted-foreground">
            Enter the final payable amount seen on the receipt
          </div>
        </div>
        {errors.observedAmount && (
          <p className="text-sm text-destructive">{errors.observedAmount}</p>
        )}
      </div>

      {/* Receipt Date */}
      <div className="grid gap-2">
        <Label htmlFor="receiptDate" className="text-sm leading-none font-medium select-none">
          Receipt Date
        </Label>
        <Input
          id="receiptDate"
          type="date"
          value={formData.receiptDate}
          onChange={(e: any) => handleInputChange('receiptDate', e.target.value)}
          required
          className="w-[200px]"
        />
        {errors.receiptDate && (
          <p className="text-sm text-destructive">{errors.receiptDate}</p>
        )}
      </div>

      {/* Verification Confirmation */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="verificationConfirmed"
          checked={formData.verificationConfirmed}
          onChange={(e: any) => handleInputChange('verificationConfirmed', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <Label htmlFor="verificationConfirmed" className="text-sm leading-none font-medium select-none">
          I have verified the receipt details and confirm the transaction is valid
        </Label>
      </div>
      {errors.verificationConfirmed && (
        <p className="text-sm text-destructive">{errors.verificationConfirmed}</p>
      )}

      {/* Rejection Note (Optional) */}
      <div className="grid gap-2">
        <Label htmlFor="rejectionNote" className="text-sm leading-none font-medium select-none">
          Rejection Note (Optional)
        </Label>
        <Textarea
          id="rejectionNote"
          placeholder="Add any notes about why this transaction might be rejected..."
          value={formData.rejectionNote}
          onChange={(e: any) => handleInputChange('rejectionNote', e.target.value)}
          rows={3}
        />
      </div>

      {/* Admin Notes (Optional) */}
      <div className="grid gap-2">
        <Label htmlFor="adminNotes" className="text-sm leading-none font-medium select-none">
          Admin Notes (Optional)
        </Label>
        <Textarea
          id="adminNotes"
          placeholder="Add any internal notes..."
          value={formData.adminNotes}
          onChange={(e: any) => handleInputChange('adminNotes', e.target.value)}
          rows={3}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700"
        >
          {isLoading ? 'Processing...' : 'Verify & Approve'}
        </Button>
      </div>
    </form>
  )
}
