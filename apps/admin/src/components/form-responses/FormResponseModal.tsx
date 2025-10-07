'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  Building2, 
  Users, 
  Mail, 
  Phone, 
  ExternalLink, 
  Calendar,
  MapPin,
  Heart,
  Star,
  MessageSquare,
  CommandLineIcon
} from 'lucide-react'
import { formatDate } from '@/utils/dateUtils'

interface PartnerApplication {
  id: string
  brandName: string
  category: string
  website?: string
  instagram?: string
  contactName: string
  contactEmail: string
  partnershipReason: string
  excitementFactor: string
  source: string
  status: string
  adminNotes?: string
  createdAt: string
  updatedAt: string
}

interface WaitlistEntry {
  id: string
  email: string
  source?: string
  status: string
  adminNotes?: string
  createdAt: string
  updatedAt: string
}

interface FormResponseModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'partner' | 'waitlist'
  data: PartnerApplication | WaitlistEntry
}

export function FormResponseModal({ isOpen, onClose, type, data }: FormResponseModalProps) {
  
  const renderPartnerApplication = (app: PartnerApplication) => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{app.brandName}</h3>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{app.category}</Badge>
            <Badge variant={app.status === 'approved' ? 'default' : app.status === 'rejected' ? 'destructive' : 'outline'}>
              {app.status}
            </Badge>
            <Badge variant={app.source === 'website' ? 'default' : 'outline'}>
              {app.source}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          {app.website && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(app.website, '_blank')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Website
            </Button>
          )}
          {app.instagram && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`https://instagram.com/${app.instagram}`, '_blank')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Instagram
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {/* Contact Information */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Phone className="w-5 h-5" />
          Contact Information
        </h4>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="font-medium">{app.contactName}</div>
          <div className="text-sm text-gray-600">{app.contactEmail}</div>
        </div>
      </div>

      {/* Partnership Details */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Heart className="w-5 h-5" />
          Partnership Details
        </h4>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="font-medium text-gray-900 mb-2">Partnership Reason</div>
            <p className="text-sm text-gray-700">{app.partnershipReason}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="font-medium text-gray-900 mb-2">Excitement Factor</div>
            <p className="text-sm text-gray-700">{app.excitementFactor}</p>
          </div>
        </div>
      </div>

      {/* Admin Notes */}
      {app.adminNotes && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <CommandLineIcon className="w-5 h-5" />
            Admin Notes
          </h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">{app.adminNotes}</p>
          </div>
        </div>
      )}

      {/* Submission Info */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Submission Information
        </h4>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">
            Submitted on {formatDate(app.createdAt)}
          </div>
        </div>
      </div>
    </div>
  )

  const renderWaitlistEntry = (entry: WaitlistEntry) => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{entry.email}</h3>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={entry.status === 'approved' ? 'default' : entry.status === 'rejected' ? 'destructive' : 'outline'}>
              {entry.status}
            </Badge>
            <Badge variant={entry.source === 'webapp' ? 'default' : 'outline'}>
              {entry.source}
            </Badge>
          </div>
        </div>
      </div>

      <Separator />

      {/* Email Details */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Email Details
        </h4>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="font-medium">{entry.email}</div>
          <div className="text-sm text-gray-600 mt-1">
            Joined: {new Date(entry.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Admin Notes */}
      {entry.adminNotes && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <CommandLineIcon className="w-5 h-5" />
            Admin Notes
          </h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">{entry.adminNotes}</p>
          </div>
        </div>
      )}

      {/* Status Information */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Status Information
        </h4>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Status</div>
              <div className="font-medium">{entry.status}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Source</div>
              <div className="font-medium">{entry.source}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === 'partner' ? (
              <>
                <Building2 className="w-5 h-5" />
                Partner Application Details
              </>
            ) : (
              <>
                <Users className="w-5 h-5" />
                Waitlist Entry Details
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        
        {type === 'partner' ? 
          renderPartnerApplication(data as PartnerApplication) : 
          renderWaitlistEntry(data as WaitlistEntry)
        }
      </DialogContent>
    </Dialog>
  )
}