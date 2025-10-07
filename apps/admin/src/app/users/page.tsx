'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  MagnifyingGlassIcon, 
  UserPlusIcon,
  EyeIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  BanknotesIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { useToast, ToastContainer } from '@/components/common'
import { useAuth } from '@/contexts/AuthContext'
import { userApi } from '@/lib/api'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface User {
  id: string
  email: string | null
  mobileNumber: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
  isActive: boolean
  totalCoins: number
  joinDate: Date
  lastActive?: Date
  totalTransactions: number
  pendingTransactions: number
  status: string
  profile?: {
    firstName?: string
    lastName?: string
  } | null
  coinBalance?: {
    balance: number
    totalEarned: number
    totalRedeemed: number
  } | null
  createdAt: string
  lastLoginAt?: string | null
}

interface UserStats {
  totalUsers: number
  activeUsers: number
  pendingUsers: number
  totalCoins: number
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [userStats, setUserStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    totalCoins: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<keyof User>('createdAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const { toasts, removeToast, showSuccess, showError } = useToast()
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()

  // Dialog state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isCoinsOpen, setIsCoinsOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [selectedUserDetail, setSelectedUserDetail] = useState<any | null>(null)

  // Forms
  const [createForm, setCreateForm] = useState({ firstName: '', lastName: '', mobileNumber: '', email: '' })
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '' })
  const [coinForm, setCoinForm] = useState<{ mode: 'delta' | 'absolute'; delta: string; newBalance: string; reason: string }>({ mode: 'delta', delta: '', newBalance: '', reason: '' })

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-theme-primary"></div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (!user) {
    router.push('/login')
    return null
  }

  // Fetch users data - using useCallback like transactions page
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true)
      setHasError(false)
      setErrorMessage('')
      
      console.log('Fetching users from API...')
      console.log('API Base URL:', process.env.NEXT_PUBLIC_API_BASE_URL)
      console.log('Current user:', user)
      console.log('Is authenticated:', !!user)
      console.log('Auth token exists:', !!localStorage.getItem('admin_token'))
      
      // Check if user is authenticated
      if (!user) {
        console.error('User is not authenticated, redirecting to login')
        router.push('/login')
        return
      }
      
      const [usersResponse, statsResponse] = await Promise.all([
        userApi.getAllUsers(),
        userApi.getUserStats()
      ])
      
      console.log('Raw users response:', usersResponse)
      console.log('Raw stats response:', statsResponse)
      
      // Check if the API call was successful
      if (!usersResponse.success) {
        console.error('Users API call failed:', usersResponse)
        throw new Error(`API call failed: ${usersResponse.message || 'Unknown error'}`)
      }
      
      if (!statsResponse.success) {
        console.error('Stats API call failed:', statsResponse)
        throw new Error(`Stats API call failed: ${statsResponse.message || 'Unknown error'}`)
      }
      
      if (usersResponse.success && statsResponse.success) {
        console.log('Users fetched successfully:', usersResponse.data?.data?.data?.length || 0, 'users')
        console.log('Full usersResponse.data:', usersResponse.data)
        
        // Transform the API response to match our User interface
        const usersPayload = usersResponse.data
        console.log('usersPayload structure:', usersPayload)
        
        // Handle nested response structure: response.data.data.data
        let safeUsersArray = []
        if (usersPayload?.data?.data && Array.isArray(usersPayload.data.data)) {
          safeUsersArray = usersPayload.data.data
        } else if (usersPayload?.data && Array.isArray(usersPayload.data)) {
          safeUsersArray = usersPayload.data
        } else if (Array.isArray(usersPayload)) {
          safeUsersArray = usersPayload
        } else {
          console.error(
            'User data is not an array. Check API response structure.',
            { usersPayload }
          )
          safeUsersArray = []
        }
        
        console.log('Safe users array:', safeUsersArray, 'Length:', safeUsersArray.length)
        console.log('Safe users array type:', typeof safeUsersArray, 'Is Array:', Array.isArray(safeUsersArray))
        
        if (safeUsersArray.length === 0) {
          console.log('No users found in API response')
        }
        
        let transformedUsers: User[] = [];
        try {
          transformedUsers = safeUsersArray.map((user: any) => {
            // Handle missing profile data gracefully
            const firstName = user.profile?.firstName || 'User';
            const lastName = user.profile?.lastName || user.mobileNumber.slice(-4) || 'User';
            const fullName = `${firstName} ${lastName}`.trim();
          
          return {
            id: user.id,
            email: user.email,
            mobileNumber: user.mobileNumber,
            firstName: firstName,
            lastName: lastName,
            phoneNumber: user.mobileNumber,
            isActive: user.status === 'ACTIVE',
            totalCoins: Math.round(Number(user.coinBalance?.balance ?? 0)),
            joinDate: new Date(user.createdAt),
            lastActive: user.lastLoginAt ? new Date(user.lastLoginAt) : undefined,
            totalTransactions: 0, // TODO: Get from transaction service
            pendingTransactions: 0, // TODO: Get from transaction service
            status: user.status,
            profile: user.profile,
            coinBalance: user.coinBalance,
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt
          };
        })
        } catch (error) {
          console.error('Error transforming users:', error)
          console.error('safeUsersArray that caused error:', safeUsersArray)
          transformedUsers = []
        }
        
        setUsers(transformedUsers)
        setFilteredUsers(transformedUsers)
        setUserStats(statsResponse.data || {
          totalUsers: 0,
          activeUsers: 0,
          pendingUsers: 0,
          totalCoins: 0
        })
      } else {
        throw new Error('Failed to fetch data from API')
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      setHasError(true)
      setErrorMessage(error instanceof Error ? error.message : 'Failed to fetch users')
      
      // Fallback to empty data if API fails
      setUsers([])
      setFilteredUsers([])
      setUserStats({
        totalUsers: 0,
        activeUsers: 0,
        pendingUsers: 0,
        totalCoins: 0
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch users on mount - same pattern as transactions page
  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Retry function for failed requests
  const handleRetry = useCallback(() => {
    setHasError(false)
    setErrorMessage('')
    fetchUsers()
  }, [fetchUsers])

  // Filter and sort users
  useEffect(() => {
    let filtered = [...users]

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.mobileNumber.includes(searchTerm)
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => {
        switch (statusFilter) {
          case 'active':
            return user.status === 'ACTIVE'
          case 'pending':
            return user.status === 'PENDING'
          case 'suspended':
            return user.status === 'SUSPENDED'
          default:
            return true
        }
      })
    }

    // Sort users
    filtered.sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      
      // Handle undefined and null values
      if ((aValue === undefined || aValue === null) && (bValue === undefined || bValue === null)) return 0
      if (aValue === undefined || aValue === null) return sortDirection === 'asc' ? -1 : 1
      if (bValue === undefined || bValue === null) return sortDirection === 'asc' ? 1 : -1
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    setFilteredUsers(filtered)
  }, [users, searchTerm, statusFilter, sortField, sortDirection])

  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleToggleUserStatus = async (userId: string) => {
    try {
      const u = users.find(u => u.id === userId)
      const targetStatus = u?.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
      await userApi.updateUserStatus(userId, targetStatus as any)
      await fetchUsers()
      showSuccess('User Status Updated', `User has been ${targetStatus.toLowerCase()} successfully`)
    } catch (error) {
      console.error('Failed to update user status:', error)
      showError('Update Failed', 'Failed to update user status. Please try again.')
    }
  }

  const openView = async (userId: string) => {
    try {
      setSelectedUserId(userId)
      const res = await userApi.getUserById(userId)
      setSelectedUserDetail(res.data)
      setIsViewOpen(true)
    } catch (e) {
      showError('Failed to load user', 'Please try again')
    }
  }

  const openEdit = async (userId: string) => {
    try {
      setSelectedUserId(userId)
      const res = await userApi.getUserById(userId)
      setSelectedUserDetail(res.data)
      setEditForm({
        firstName: res.data?.profile?.firstName || '',
        lastName: res.data?.profile?.lastName || '',
        email: res.data?.email || ''
      })
      setIsEditOpen(true)
    } catch (e) {
      showError('Failed to load user for edit', 'Please try again')
    }
  }

  const saveEdit = async () => {
    if (!selectedUserId) return
    try {
      await userApi.updateUserProfile(selectedUserId, { firstName: editForm.firstName, lastName: editForm.lastName })
      if (editForm.email !== (selectedUserDetail?.email || '')) {
        await userApi.updateUserEmail(selectedUserId, editForm.email)
      }
      setIsEditOpen(false)
      await fetchUsers()
      showSuccess('User updated', 'User details saved successfully')
    } catch (e) {
      showError('Failed to save', (e as any)?.message || 'Please try again')
    }
  }

  const openCoins = async (userId: string) => {
    try {
      setSelectedUserId(userId)
      const res = await userApi.getUserBalance(userId)
      const current = Math.round(Number(res.data.balance?.balance ?? 0))
      setCoinForm({ mode: 'delta', delta: '', newBalance: String(current), reason: '' })
      setIsCoinsOpen(true)
    } catch (e) {
      showError('Failed to load balance', 'Please try again')
    }
  }

  const saveCoins = async () => {
    if (!selectedUserId) return
    try {
      const payload = coinForm.mode === 'delta'
        ? { delta: Math.round(Number(coinForm.delta || '0')), reason: coinForm.reason }
        : { newBalance: Math.round(Number(coinForm.newBalance || '0')), reason: coinForm.reason }
      await userApi.adjustUserCoins(selectedUserId, payload)
      setIsCoinsOpen(false)
      await fetchUsers()
      showSuccess('Coins updated', 'User coin balance updated successfully')
    } catch (e) {
      showError('Failed to update coins', (e as any)?.message || 'Please try again')
    }
  }

  const createUser = async () => {
    try {
      if (!createForm.firstName || !createForm.lastName || !createForm.mobileNumber) {
        showError('Missing fields', 'First name, last name and mobile are required')
        return
      }
      await userApi.createUser({
        firstName: createForm.firstName,
        lastName: createForm.lastName,
        mobileNumber: createForm.mobileNumber,
        email: createForm.email || undefined,
      })
      setIsAddOpen(false)
      setCreateForm({ firstName: '', lastName: '', mobileNumber: '', email: '' })
      await fetchUsers()
      showSuccess('User created', 'User has been added')
    } catch (e) {
      showError('Failed to create user', (e as any)?.message || 'Please try again')
    }
  }

  

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-theme-primary"></div>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-gray-600">
            Manage user accounts, monitor activity, and view transaction history.
          </p>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <div className="text-status-error mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Users</h3>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-theme-primary hover:bg-green-theme-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-theme-primary"
            >
              Try Again
            </button>
            <div className="text-sm text-gray-500">
              <p>Make sure the API server is running and accessible.</p>
              <p>Check your network connection and API configuration.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="mt-2 text-gray-600">
              Manage user accounts, monitor activity, and view transaction history.
            </p>
            
            {/* Live Status Indicator */}
            <div className="mt-2 flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-theme-primary animate-pulse" />
              <span className="text-sm text-gray-500">Live Updates Connected</span>
            </div>
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={() => {
              fetchUsers()
            }}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-green-theme-accent text-sm font-medium rounded-md text-green-theme-primary bg-green-theme-secondary hover:bg-green-theme-accent hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-theme-primary disabled:opacity-50 transition-colors"
            title="Refresh users"
          >
            <ArrowPathIcon className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>



      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Users
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                id="search"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Users</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Clear Filters
            </button>
          </div>

          <div className="flex items-end">
            <button onClick={() => setIsAddOpen(true)} className="w-full px-4 py-2 bg-green-theme-primary hover:bg-green-theme-accent text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-theme-primary transition-colors">
              <UserPlusIcon className="w-4 h-4 inline mr-2" />
              Add User
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-status-info/10 rounded-lg">
              <svg className="w-6 h-6 text-status-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{userStats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-theme-secondary rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-green-theme-primary" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Users</p>
              <p className="text-2xl font-semibold text-gray-900">
                {userStats.activeUsers}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-gold-theme-secondary rounded-lg">
              <svg className="w-6 h-6 text-gold-theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Coins</p>
              <p className="text-2xl font-semibold text-gray-900">
                {(userStats.totalCoins || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Users</p>
              <p className="text-2xl font-semibold text-gray-900">
                {userStats.pendingUsers}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow rounded-lg border border-green-theme-accent/20">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-green-theme-muted">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('firstName')}
                >
                  <div className="flex items-center">
                    Name
                    {sortField === 'firstName' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('totalCoins')}
                >
                  <div className="flex items-center">
                    Coins
                    {sortField === 'totalCoins' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('joinDate')}
                >
                  <div className="flex items-center">
                    Join Date
                    {sortField === 'joinDate' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('lastActive')}
                >
                  <div className="flex items-center">
                    Last Active
                    {sortField === 'lastActive' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-green-theme-secondary flex items-center justify-center">
                        <span className="text-sm font-medium text-green-theme-primary">
                          {user.firstName?.[0] || 'U'}{user.lastName?.[0] || 'U'}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'User'}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {user.id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email || user.mobileNumber}</div>
                    {user.phoneNumber && (
                      <div className="text-sm text-gray-500">{user.phoneNumber}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">
                      {(user.totalCoins || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user.totalTransactions} transactions
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(user.joinDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.lastActive ? formatTimeAgo(user.lastActive) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.status === 'ACTIVE' 
                        ? 'text-green-theme-primary bg-green-theme-secondary'
                        : user.status === 'PENDING'
                        ? 'text-gold-theme-primary bg-gold-theme-secondary'
                        : user.status === 'SUSPENDED'
                        ? 'text-status-error bg-red-100'
                        : 'text-gray-800 bg-gray-100'
                    }`}>
                      {user.status === 'ACTIVE' ? 'Active' : 
                       user.status === 'PENDING' ? 'Pending' : 
                       user.status === 'SUSPENDED' ? 'Suspended' : 
                       user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openView(user.id)}
                        className="text-green-theme-primary hover:text-green-theme-accent p-1 rounded hover:bg-green-theme-secondary transition-colors"
                        title="View Details"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEdit(user.id)}
                        className="text-gold-theme-primary hover:text-gold-theme-accent p-1 rounded hover:bg-gold-theme-secondary transition-colors"
                        title="Edit User"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openCoins(user.id)}
                        className="text-gold-theme-primary hover:text-gold-theme-accent p-1 rounded hover:bg-gold-theme-secondary transition-colors"
                        title="Adjust Coins"
                      >
                        <BanknotesIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleUserStatus(user.id)}
                        className={`p-1 rounded hover:bg-gray-50 ${
                          user.status === 'ACTIVE' 
                            ? 'text-status-error hover:text-status-error/80' 
                            : 'text-green-theme-primary hover:text-green-theme-accent'
                        }`}
                        title={user.status === 'ACTIVE' ? 'Suspend User' : 'Activate User'}
                      >
                        {user.status === 'ACTIVE' ? <XCircleIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
                      </button>
                      
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <p>No users found</p>
                <p className="text-sm mt-2">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filters.'
                    : 'No users have been added yet.'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Create User Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" value={createForm.firstName} onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" value={createForm.lastName} onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="mobileNumber">Mobile Number</Label>
                <Input id="mobileNumber" value={createForm.mobileNumber} onChange={(e) => setCreateForm({ ...createForm, mobileNumber: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="email">Email (optional)</Label>
                <Input id="email" type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button onClick={createUser}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View User Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUserDetail && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{selectedUserDetail.profile?.firstName} {selectedUserDetail.profile?.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedUserDetail.email || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Mobile</p>
                  <p className="font-medium">{selectedUserDetail.mobileNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">{selectedUserDetail.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email Verified</p>
                  <p className="font-medium">{selectedUserDetail.isEmailVerified ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Mobile Verified</p>
                  <p className="font-medium">{selectedUserDetail.isMobileVerified ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Joined</p>
                  <p className="font-medium">{new Date(selectedUserDetail.createdAt).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'Asia/Kolkata',
                    timeZoneName: 'short'
                  })}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Login</p>
                  <p className="font-medium">{selectedUserDetail.lastLoginAt ? new Date(selectedUserDetail.lastLoginAt).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'Asia/Kolkata',
                    timeZoneName: 'short'
                  }) : '—'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Coin Balance</p>
                  <p className="font-medium">{selectedUserDetail.coinBalance?.balance ?? 0} (earned {selectedUserDetail.coinBalance?.totalEarned ?? 0}, redeemed {selectedUserDetail.coinBalance?.totalRedeemed ?? 0})</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{[selectedUserDetail.profile?.street, selectedUserDetail.profile?.city, selectedUserDetail.profile?.state, selectedUserDetail.profile?.postalCode, selectedUserDetail.profile?.country].filter(Boolean).join(', ') || '—'}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editFirst">First Name</Label>
                <Input id="editFirst" value={editForm.firstName} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="editLast">Last Name</Label>
                <Input id="editLast" value={editForm.lastName} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="editEmail">Email</Label>
                <Input id="editEmail" type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={saveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Adjust Coins Dialog */}
      <Dialog open={isCoinsOpen} onOpenChange={setIsCoinsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Coins</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex space-x-4">
              <button onClick={() => setCoinForm({ ...coinForm, mode: 'delta' })} className={`px-3 py-1 rounded border ${coinForm.mode === 'delta' ? 'bg-green-theme-primary text-white' : 'bg-white'}`}>By Delta</button>
              <button onClick={() => setCoinForm({ ...coinForm, mode: 'absolute' })} className={`px-3 py-1 rounded border ${coinForm.mode === 'absolute' ? 'bg-green-theme-primary text-white' : 'bg-white'}`}>Set Absolute</button>
            </div>
            {coinForm.mode === 'delta' ? (
              <div>
                <Label htmlFor="delta">Delta (use negative for deduction)</Label>
                <Input id="delta" type="number" value={coinForm.delta} onChange={(e) => setCoinForm({ ...coinForm, delta: e.target.value })} />
              </div>
            ) : (
              <div>
                <Label htmlFor="newBalance">New Balance</Label>
                <Input id="newBalance" type="number" value={coinForm.newBalance} onChange={(e) => setCoinForm({ ...coinForm, newBalance: e.target.value })} />
              </div>
            )}
            <div>
              <Label htmlFor="reason">Reason (required)</Label>
              <Input id="reason" value={coinForm.reason} onChange={(e) => setCoinForm({ ...coinForm, reason: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCoinsOpen(false)}>Cancel</Button>
            <Button onClick={saveCoins}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
