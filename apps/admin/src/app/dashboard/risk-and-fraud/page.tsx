'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { ShieldExclamationIcon, ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { 
  RiskOverview,
  RiskSignals,
  AnomalyDetection,
  FraudMetrics,
  BlocklistStatus,
  SecurityAlerts
} from '@/components/dashboard'

export default function RiskAndFraudPage() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500">
        <Link href="/" className="flex items-center hover:text-gray-700 transition-colors">
          <HomeIcon className="w-4 h-4 mr-1" />
          Dashboard
        </Link>
        <ChevronRightIcon className="w-4 h-4" />
        <span className="text-gray-900 font-medium">Risk & Fraud Monitoring</span>
      </nav>

      {/* Page Header */}
      <div className="flex items-center space-x-3">
        <ShieldExclamationIcon className="h-8 w-8 text-red-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Risk & Fraud Monitoring</h1>
          <p className="text-gray-600">Comprehensive security monitoring and fraud prevention dashboard</p>
        </div>
      </div>

      {/* Risk Overview - Full Width */}
      <Card>
        <CardHeader>
          <CardTitle className="text-red-900">Risk Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <RiskOverview />
        </CardContent>
      </Card>

      {/* Risk Signals and Anomaly Detection - Side by Side */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-orange-900">Risk Signals</CardTitle>
          </CardHeader>
          <CardContent>
            <RiskSignals />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-purple-900">Anomaly Detection</CardTitle>
          </CardHeader>
          <CardContent>
            <AnomalyDetection />
          </CardContent>
        </Card>
      </div>

      {/* Fraud Metrics - Full Width */}
      <Card>
        <CardHeader>
          <CardTitle className="text-red-900">Fraud Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <FraudMetrics />
        </CardContent>
      </Card>

      {/* Blocklist Status and Security Alerts - Side by Side */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">Blocklist Status</CardTitle>
          </CardHeader>
          <CardContent>
            <BlocklistStatus />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-900">Security Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <SecurityAlerts />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
