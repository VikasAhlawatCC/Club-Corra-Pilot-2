'use client'

import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface DeleteConfirmationModalProps {
  categoryName: string
  brandCount: number
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteConfirmationModal({ 
  categoryName, 
  brandCount, 
  onConfirm, 
  onCancel 
}: DeleteConfirmationModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mt-4">Delete Category</h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500 mb-3">
              Are you sure you want to delete the category <strong>"{categoryName}"</strong>?
            </p>
            {brandCount > 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-3">
                <p className="text-sm text-yellow-800">
                  ⚠️ This category has <strong>{brandCount}</strong> associated brand{brandCount === 1 ? '' : 's'}.
                  Deleting it will affect these brands.
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                This category has no associated brands.
              </p>
            )}
            <p className="text-sm text-gray-500">
              This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-center space-x-4 mt-4">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 font-medium rounded-md transition-colors ${
                brandCount > 0 
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {brandCount > 0 ? 'Delete Anyway' : 'Delete Category'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
