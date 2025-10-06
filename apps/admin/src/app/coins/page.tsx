'use client'

import { useCoins } from '@/hooks/useCoins'
import { CoinOverview } from '@/components/coins/CoinOverview'
import { Skeleton, Alert, AlertDescription, Button } from '@/components/ui'
import { ArrowPathIcon } from '@heroicons/react/24/outline'

export default function CoinsPage() {
  const {
    stats,
    transactions,
    loading,
    error,
    pagination,
    fetchStats,
    fetchTransactions,
    clearError
  } = useCoins()

  // Transform transactions to match component interface
  const recentTransactions = (transactions || []).slice(0, 10).map(tx => ({
    id: tx.id || 'unknown',
    userId: tx.userId || 'unknown',
    userName: tx.userName || 'Unknown User',
    type: tx.type || 'UNKNOWN',
    amount: tx.amount || 0,
    timestamp: tx.createdAt || new Date(),
    status: tx.status || 'UNKNOWN'
  }))

  if (loading && !stats) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
          <Skeleton className="h-4 w-2/3 mx-auto" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription className="flex-1">{error}</AlertDescription>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => {
              clearError()
              fetchStats()
              fetchTransactions()
            }}
            variant="outline"
            size="sm"
            className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            Try Again
          </Button>
          <Button
            onClick={clearError}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            ✕
          </Button>
        </div>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Coin System Overview</h1>
            <p className="text-gray-600">Monitor coin distribution, transactions, and system health</p>
            
            {/* Live Status Indicator */}
            <div className="mt-2 flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-gray-500">Live Updates Connected</span>
            </div>
          </div>
          <button
            onClick={() => {
              fetchStats()
              fetchTransactions()
            }}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            title="Refresh coin data"
          >
            <ArrowPathIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Total Coins in Circulation</h3>
          <p className="text-3xl font-bold text-status-info">
            {stats ? stats.totalCoinsInCirculation.toLocaleString() : '...'}
          </p>
          <p className="text-sm text-gray-500">Across all users</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Welcome Bonuses Given</h3>
          <p className="text-3xl font-bold text-green-600">
            {stats ? stats.welcomeBonusesGiven.toLocaleString() : '...'}
          </p>
          <p className="text-sm text-gray-500">100 coins each</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Pending Redemptions</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {stats ? stats.pendingRedemptions.toLocaleString() : '...'}
          </p>
          <p className="text-sm text-gray-500">Awaiting approval</p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Coin System Statistics
          </h3>
          
          {stats && (
            <CoinOverview
              stats={stats}
              recentTransactions={recentTransactions}
              onViewTransaction={(transaction) => console.log('View transaction:', transaction)}
              onViewAllTransactions={() => window.location.href = '/transactions'}
            />
          )}
        </div>
      </div>

      {/* Pagination Info */}
      {pagination.totalPages > 1 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} transactions
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => fetchTransactions({ page: pagination.page - 1 })}
                disabled={pagination.page <= 1}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm text-gray-700">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchTransactions({ page: pagination.page + 1 })}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
