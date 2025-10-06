import { TransactionTrends } from '@/components/dashboard/TransactionTrends'

export default function TransactionTrendsPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Transaction Trends</h1>
        <p className="text-gray-600 mt-2">
          Analyze transaction patterns, growth trends, and performance metrics over time
        </p>
      </div>
      
      <TransactionTrends />
    </div>
  )
}
