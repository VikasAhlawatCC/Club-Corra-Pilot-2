'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { getProxiedUrl } from '@/utils/s3UrlProxy'

interface ReceiptViewerProps {
  receiptUrl: string
  transactionId: string
}

export function ReceiptViewer({ receiptUrl, transactionId }: ReceiptViewerProps) {
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const handleZoom = (direction: 'in' | 'out' | 'reset') => {
    switch (direction) {
      case 'in':
        setZoom(prev => Math.min(prev * 1.2, 3))
        break
      case 'out':
        setZoom(prev => Math.max(prev / 1.2, 0.5))
        break
      case 'reset':
        setZoom(1)
        setPosition({ x: 0, y: 0 })
        break
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const container = e.currentTarget.parentElement as HTMLElement
    if (container && receiptUrl) {
      container.innerHTML = `
        <object data="${getProxiedUrl(receiptUrl)}" type="application/pdf" width="100%" height="420">
          <p class="p-3 text-sm text-gray-500">
            Preview not available. 
            <a href="${getProxiedUrl(receiptUrl)}" target="_blank" class="text-blue-600 underline">
              Open file
            </a>
          </p>
        </object>
      `
    }
  }

  return (
    <div className="space-y-4">
      {/* Receipt Image Container */}
      <div className="relative border rounded-lg overflow-hidden bg-gray-50">
        <div
          className="relative overflow-hidden cursor-move"
          style={{
            transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <img
            alt={`Receipt for ${transactionId}`}
            className="w-full max-h-[420px] object-contain"
            src={getProxiedUrl(receiptUrl)}
            onError={handleImageError}
            draggable={false}
          />
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleZoom('out')}
            disabled={zoom <= 0.5}
          >
            -
          </Button>
          <span className="text-sm text-muted-foreground min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleZoom('in')}
            disabled={zoom >= 3}
          >
            +
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleZoom('reset')}
          >
            Reset
          </Button>
        </div>

        <a
          className="text-sm text-blue-600 hover:text-blue-800 underline"
          href={getProxiedUrl(receiptUrl)}
          target="_blank"
          rel="noreferrer"
        >
          Open original
        </a>
      </div>

      {/* Keyboard Shortcuts Info */}
      <div className="text-xs text-muted-foreground">
        <p>Keyboard shortcuts: + (zoom in), - (zoom out), 0 (reset), Arrow keys (pan when zoomed)</p>
      </div>
    </div>
  )
}
