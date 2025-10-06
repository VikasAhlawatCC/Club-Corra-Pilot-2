import { TransactionInsights } from '@/components/dashboard/TransactionInsights'
import { QueueOverview } from '@/components/dashboard/QueueOverview'
import { TransactionTrends } from '@/components/dashboard/TransactionTrends'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'

export default function AnalyticsDashboardPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Comprehensive analytics and insights for transaction management, queue monitoring, and trend analysis
        </p>
      </div>
      
      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="insights">Transaction Insights</TabsTrigger>
          <TabsTrigger value="queue">Queue Overview</TabsTrigger>
          <TabsTrigger value="trends">Transaction Trends</TabsTrigger>
        </TabsList>
        
        <TabsContent value="insights" className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Transaction Insights</h2>
            <TransactionInsights />
          </div>
        </TabsContent>
        
        <TabsContent value="queue" className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Queue Overview</h2>
            <QueueOverview />
          </div>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Transaction Trends</h2>
            <TransactionTrends />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
