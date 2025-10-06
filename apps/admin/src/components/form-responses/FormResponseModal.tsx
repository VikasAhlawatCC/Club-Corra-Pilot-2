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
  MessageSquare
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
  createdAt: string
  updatedAt: string
}

interface WaitlistEntry {
  id: string
  name: string
  age: string
  gender: string
  city: string
  cityOther?: string
  lifeSituations: string[]
  categories: Array<{
    category: string
    brands?: string
    expense?: string
    frequency?: string
    differentiators?: string[]
  }>
  loyaltyProgram: string
  loyaltyValue: string[]
  earlyAccess: string
  whatsapp?: string
  source: string
  createdAt: string
  updatedAt: string
}

interface FormResponseModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'partner' | 'waitlist'
  data: PartnerApplication | WaitlistEntry | null
}

export function FormResponseModal({ isOpen, onClose, type, data }: FormResponseModalProps) {
  if (!data) return null

  const renderPartnerApplication = (app: PartnerApplication) => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{app.brandName}</h3>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary">{app.category}</Badge>
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
              onClick={() => window.open(`https://instagram.com/${app.instagram?.replace('@', '')}`, '_blank')}
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
          <Users className="w-5 h-5" />
          Contact Information
        </h4>
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="font-medium">{app.contactName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-500" />
            <a 
              href={`mailto:${app.contactEmail}`}
              className="text-blue-600 hover:text-blue-800"
            >
              {app.contactEmail}
            </a>
          </div>
        </div>
      </div>

      {/* Partnership Details */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Partnership Details
        </h4>
        <div className="space-y-4">
          <div>
            <h5 className="font-medium text-gray-700 mb-2">Partnership Reason</h5>
            <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
              {app.partnershipReason}
            </p>
          </div>
          <div>
            <h5 className="font-medium text-gray-700 mb-2">Excitement Factor</h5>
            <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
              {app.excitementFactor}
            </p>
          </div>
        </div>
      </div>

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
          <h3 className="text-2xl font-bold text-gray-900">{entry.name}</h3>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{entry.age} years old</Badge>
            <Badge variant="outline">{entry.gender}</Badge>
            <Badge variant={entry.source === 'website' ? 'default' : 'outline'}>
              {entry.source}
            </Badge>
          </div>
        </div>
        {entry.whatsapp && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`https://wa.me/${entry.whatsapp}`, '_blank')}
            className="flex items-center gap-2"
          >
            <Phone className="w-4 h-4" />
            WhatsApp
          </Button>
        )}
      </div>

      <Separator />

      {/* Location */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Location
        </h4>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="font-medium">{entry.city}</div>
          {entry.cityOther && (
            <div className="text-sm text-gray-600 mt-1">{entry.cityOther}</div>
          )}
        </div>
      </div>

      {/* Life Situations */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Heart className="w-5 h-5" />
          Life Situations
        </h4>
        <div className="flex flex-wrap gap-2">
          {entry.lifeSituations.map((situation, index) => (
            <Badge key={index} variant="secondary">
              {situation}
            </Badge>
          ))}
        </div>
      </div>

      {/* Categories & Interests */}
      {entry.categories.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Star className="w-5 h-5" />
            Categories & Interests
          </h4>
          <div className="space-y-3">
            {entry.categories.map((category, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <div className="font-medium text-gray-900">{category.category}</div>
                {category.brands && (
                  <div className="text-sm text-gray-600 mt-1">
                    <strong>Brands:</strong> {category.brands}
                  </div>
                )}
                {category.expense && (
                  <div className="text-sm text-gray-600">
                    <strong>Expense Range:</strong> {category.expense}
                  </div>
                )}
                {category.frequency && (
                  <div className="text-sm text-gray-600">
                    <strong>Frequency:</strong> {category.frequency}
                  </div>
                )}
                {category.differentiators && category.differentiators.length > 0 && (
                  <div className="text-sm text-gray-600 mt-2">
                    <strong>Differentiators:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {category.differentiators.map((diff, diffIndex) => (
                        <Badge key={diffIndex} variant="outline" className="text-xs">
                          {diff}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loyalty Program */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Loyalty Program
        </h4>
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <div>
            <strong>Current Usage:</strong> {entry.loyaltyProgram}
          </div>
          {entry.loyaltyValue.length > 0 && (
            <div>
              <strong>Valued Features:</strong>
              <div className="flex flex-wrap gap-1 mt-1">
                {entry.loyaltyValue.map((value, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {value}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          <div>
            <strong>Early Access Interest:</strong> {entry.earlyAccess}
          </div>
        </div>
      </div>

      {/* Submission Info */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Submission Information
        </h4>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">
            Submitted on {formatDate(entry.createdAt)}
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
