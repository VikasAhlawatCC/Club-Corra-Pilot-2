import { TransactionInsights } from '@/components/dashboard/TransactionInsights'

export default function TransactionInsightsPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Transaction Insights</h1>
        <p className="text-gray-600 mt-2">
          Comprehensive analytics and insights for transaction management and operations
        </p>
      </div>
      
      <TransactionInsights />
    </div>
  )
}
