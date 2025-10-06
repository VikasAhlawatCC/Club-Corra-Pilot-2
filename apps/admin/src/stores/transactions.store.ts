'use client'

type DateRange = { start?: string; end?: string } | null

type TransactionFiltersState = {
  status: string
  type: string
  search: string
  dateRange: DateRange
}

type Store = {
  filters: TransactionFiltersState
  setFilters: (partial: Partial<TransactionFiltersState>) => void
  fetchTransactions: () => Promise<void>
  loading: boolean
  exportFilters?: () => void
  importFilters?: () => void
}

const store: Store = {
  filters: { status: 'ALL', type: 'ALL', search: '', dateRange: null },
  setFilters(partial) {
    store.filters = { ...store.filters, ...partial }
    if (!partial.dateRange) return
    const { start, end } = partial.dateRange
    if (!start && !end) {
      store.filters.dateRange = null
    }
  },
  async fetchTransactions() {
    // no-op placeholder; integrate with API if needed
  },
  loading: false,
  exportFilters() {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem('transactions:filters', JSON.stringify(store.filters))
    } catch {}
  },
  importFilters() {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem('transactions:filters')
      if (raw) {
        const parsed = JSON.parse(raw)
        store.filters = { ...store.filters, ...parsed }
      }
    } catch {}
  },
}

export function useTransactionsStore(): Store {
  return store
}


