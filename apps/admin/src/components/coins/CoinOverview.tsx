'use client'

import { useState } from 'react'
import { 
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell,
  Badge,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components/ui'
import { CoinSystemStats, AdminCoinTransaction } from '@/types/coins'

interface RecentTransaction {
  id: string
  userId: string
  userName: string
  type: 'WELCOME_BONUS' | 'EARN' | 'REDEEM' | 'ADJUSTMENT' | 'REWARD_REQUEST'
  amount: number
  timestamp: Date
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSED' | 'PAID'
}

interface CoinOverviewProps {
  stats: CoinSystemStats
  recentTransactions: RecentTransaction[]
  onViewTransaction?: (transaction: RecentTransaction) => void
  onViewAllTransactions?: () => void
}

export function CoinOverview({ 
  stats, 
  recentTransactions, 
  onViewTransaction,
  onViewAllTransactions 
}: CoinOverviewProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d'>('7d')

  const getSystemHealthColor = (health: CoinSystemStats['systemHealth']) => {
    switch (health) {
      case 'healthy':
        return 'text-green-600 bg-green-100'
      case 'warning':
        return 'text-yellow-600 bg-yellow-100'
      case 'critical':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getSystemHealthIcon = (health: CoinSystemStats['systemHealth']) => {
    switch (health) {
      case 'healthy':
        return <CheckCircleIcon className="w-5 h-5" />
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5" />
      case 'critical':
        return <ExclamationTriangleIcon className="w-5 h-5" />
      default:
        return <ExclamationTriangleIcon className="w-5 h-5" />
    }
  }

  const getTransactionTypeColor = (type: RecentTransaction['type']) => {
    switch (type) {
      case 'WELCOME_BONUS':
        return 'text-green-600 bg-green-100'
      case 'EARN':
        return 'text-blue-600 bg-blue-100'
      case 'REDEEM':
        return 'text-orange-600 bg-orange-100'
      case 'ADJUSTMENT':
        return 'text-purple-600 bg-purple-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getTransactionStatusColor = (status: RecentTransaction['status']) => {
    switch (status) {
      case 'APPROVED':
      case 'PAID':
        return 'text-green-600 bg-green-100'
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100'
      case 'REJECTED':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN').format(amount)
  }

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(timestamp)
  }

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>System Health</CardTitle>
            <Badge variant="secondary" className={getSystemHealthColor(stats.systemHealth)}>
              {getSystemHealthIcon(stats.systemHealth)}
              <span className="ml-2 capitalize">{stats.systemHealth}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <CurrencyDollarIcon className="w-8 h-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Coins</p>
                  <p className="text-2xl font-bold text-gray-900">{formatAmount(stats.totalCoinsInCirculation)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <UserGroupIcon className="w-8 h-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{formatAmount(stats.totalUsers)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <ChartBarIcon className="w-8 h-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Welcome Bonuses</p>
                  <p className="text-2xl font-bold text-gray-900">{formatAmount(stats.welcomeBonusesGiven)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="w-8 h-8 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{formatAmount(stats.pendingRedemptions)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <ChartBarIcon className="w-8 h-8 text-status-info" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Active Brands</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeBrands || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircleIcon className="w-8 h-8 text-emerald-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.transactionSuccessRate ? `${stats.transactionSuccessRate.toFixed(1)}%` : '—'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <CurrencyDollarIcon className="w-8 h-8 text-amber-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Earned</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalEarned ? formatAmount(stats.totalEarned) : '—'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <CurrencyDollarIcon className="w-8 h-8 text-red-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Redeemed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalRedeemed ? formatAmount(stats.totalRedeemed) : '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <div className="flex items-center space-x-2">
              <Select value={selectedTimeframe} onValueChange={(value) => setSelectedTimeframe(value as any)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
              {onViewAllTransactions && (
                <Button variant="ghost" onClick={onViewAllTransactions}>
                  View All
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.userName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transaction.userId.slice(0, 8)}...
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getTransactionTypeColor(transaction.type)}>
                        {transaction.type === 'WELCOME_BONUS' ? 'WELCOME BONUS' : transaction.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-900">
                      <span className={transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {transaction.amount >= 0 ? '+' : ''}{formatAmount(transaction.amount)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getTransactionStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatTimestamp(transaction.timestamp)}
                    </TableCell>
                    <TableCell>
                      {onViewTransaction && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewTransaction(transaction)}
                          className="text-status-info hover:text-status-info/80"
                        >
                          View
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {recentTransactions.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500">
                  <p>No recent transactions</p>
                  <p className="text-sm mt-2">Transactions will appear here as users interact with the system</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
