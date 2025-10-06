'use client'

import React, { useState, useEffect } from 'react'
import { 
  BookmarkIcon, 
  BookmarkSlashIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  EyeIcon,
  GlobeAltIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import type { SavedView } from '@/types'

interface SavedViewsProps {
  savedViews: SavedView[]
  currentViewId?: string
  onViewSelect: (view: SavedView) => void
  onViewSave: (view: Omit<SavedView, 'id' | 'createdAt' | 'updatedAt'>) => void
  onViewUpdate: (id: string, view: Partial<SavedView>) => void
  onViewDelete: (id: string) => void
  className?: string
}

export function SavedViews({
  savedViews,
  currentViewId,
  onViewSelect,
  onViewSave,
  onViewUpdate,
  onViewDelete,
  className = ''
}: SavedViewsProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingView, setEditingView] = useState<SavedView | null>(null)
  const [newViewName, setNewViewName] = useState('')
  const [newViewIsGlobal, setNewViewIsGlobal] = useState(false)

  const handleCreateView = () => {
    if (newViewName.trim()) {
      onViewSave({
        name: newViewName.trim(),
        filters: {},
        userId: 'current-user-id', // This should come from auth context
        isGlobal: newViewIsGlobal,
      })
      setNewViewName('')
      setNewViewIsGlobal(false)
      setIsCreateDialogOpen(false)
    }
  }

  const handleEditView = (view: SavedView) => {
    setEditingView(view)
    setIsEditDialogOpen(true)
  }

  const handleUpdateView = () => {
    if (editingView && editingView.id && newViewName.trim()) {
      onViewUpdate(editingView.id, {
        name: newViewName.trim(),
        isGlobal: newViewIsGlobal
      })
      setNewViewName('')
      setNewViewIsGlobal(false)
      setEditingView(null)
      setIsEditDialogOpen(false)
    }
  }

  const handleDeleteView = (viewId: string) => {
    if (confirm('Are you sure you want to delete this saved view?')) {
      onViewDelete(viewId)
    }
  }

  const resetForm = () => {
    setNewViewName('')
    setNewViewIsGlobal(false)
    setEditingView(null)
  }

  useEffect(() => {
    if (editingView) {
      setNewViewName(editingView.name || '')
      setNewViewIsGlobal(editingView.isGlobal || false)
    }
  }, [editingView])

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <BookmarkIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Saved Views</h3>
          <Badge variant="secondary">{savedViews.length}</Badge>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={resetForm}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Save Current View
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Current View</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  View Name
                </label>
                <Input
                  placeholder="Enter view name"
                  value={newViewName}
                  onChange={(e) => setNewViewName(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isGlobal"
                  checked={newViewIsGlobal}
                  onChange={(e) => setNewViewIsGlobal(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isGlobal" className="text-sm text-gray-700">
                  Make this view available to all users
                </label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateView}>
                  Save View
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Saved Views List */}
      <div className="space-y-2">
        {savedViews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <BookmarkIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No saved views yet</p>
            <p className="text-xs">Save your current filter configuration for quick access</p>
          </div>
        ) : (
          savedViews.map((view) => (
            <div
              key={view.id}
              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                currentViewId === view.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => onViewSelect(view)}
            >
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <BookmarkIcon className={`w-4 h-4 ${
                  currentViewId === view.id ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className={`font-medium truncate ${
                      currentViewId === view.id ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {view.name}
                    </span>
                    {view.isGlobal && (
                      <GlobeAltIcon className="w-4 h-4 text-gray-400" title="Global view" />
                    )}
                    {!view.isGlobal && (
                      <UserIcon className="w-4 h-4 text-gray-400" title="Personal view" />
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>Created {view.createdAt ? format(new Date(view.createdAt), 'MMM dd, yyyy') : 'Unknown'}</span>
                    {view.updatedAt && view.createdAt && view.updatedAt !== view.createdAt && (
                      <span>• Updated {format(new Date(view.updatedAt), 'MMM dd, yyyy')}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEditView(view)
                  }}
                  className="h-8 w-8 p-0"
                >
                  <PencilIcon className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (view.id) {
                      handleDeleteView(view.id)
                    }
                  }}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Saved View</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                View Name
              </label>
              <Input
                placeholder="Enter view name"
                value={newViewName}
                onChange={(e) => setNewViewName(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="editIsGlobal"
                checked={newViewIsGlobal}
                onChange={(e) => setNewViewIsGlobal(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="editIsGlobal" className="text-sm text-gray-700">
                Make this view available to all users
              </label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateView}>
                Update View
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
