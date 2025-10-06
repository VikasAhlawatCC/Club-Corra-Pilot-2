import { QueueOverview } from '@/components/dashboard/QueueOverview'

export default function QueueOverviewPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Queue Overview</h1>
        <p className="text-gray-600 mt-2">
          Real-time monitoring of pending requests, SLA tracking, and queue management
        </p>
      </div>
      
      <QueueOverview />
    </div>
  )
}
