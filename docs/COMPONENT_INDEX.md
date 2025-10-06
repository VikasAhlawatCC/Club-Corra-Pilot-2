# Component Index for Cursor Agent

## Admin App Components (`/apps/admin/src/components/`)

### Authentication Components
- `auth/` - Authentication related components
  - `AuthProvider.tsx` - Main auth context provider

### Brand Management Components
- `brands/` - Brand-related UI components
  - `BrandCard.tsx` - Individual brand display card
  - `BrandFilters.tsx` - Brand filtering interface
  - `BrandForm.tsx` - Brand creation/editing form
  - `BrandList.tsx` - List view of brands
  - `BrandModal.tsx` - Modal for brand operations
  - `BrandSearch.tsx` - Brand search functionality
  - `BrandStats.tsx` - Brand statistics display
  - `index.ts` - Brand components exports

### Chart Components
- `charts/` - Data visualization components
  - `AreaChart.tsx` - Area chart component
  - `BarChart.tsx` - Bar chart component
  - `LineChart.tsx` - Line chart component
  - `PieChart.tsx` - Pie chart component
  - `ChartContainer.tsx` - Chart wrapper component
  - `ChartTooltip.tsx` - Chart tooltip component
  - `index.ts` - Chart components exports

### Coin Management Components
- `coins/` - Coin/currency related components
  - `CoinBalance.tsx` - Coin balance display
  - `CoinTransaction.tsx` - Coin transaction component

### Common/Shared Components
- `common/` - Reusable UI components
  - `Button.tsx` - Standard button component
  - `Card.tsx` - Card container component
  - `Input.tsx` - Form input component
  - `Modal.tsx` - Modal dialog component
  - `Table.tsx` - Data table component
  - `Pagination.tsx` - Pagination component
  - `LoadingSpinner.tsx` - Loading indicator
  - `ErrorBoundary.tsx` - Error handling component
  - `index.ts` - Common components exports

### Dashboard Components
- `dashboard/` - Dashboard-specific components
  - `DashboardHeader.tsx` - Dashboard header
  - `DashboardSidebar.tsx` - Dashboard navigation
  - `DashboardStats.tsx` - Dashboard statistics
  - `DashboardCharts.tsx` - Dashboard charts
  - `DashboardFilters.tsx` - Dashboard filtering
  - `DashboardMetrics.tsx` - Dashboard metrics display
  - `DashboardOverview.tsx` - Dashboard overview
  - `DashboardWidgets.tsx` - Dashboard widgets
  - `index.ts` - Dashboard components exports

### Filter Components
- `filters/` - Filtering interface components
  - `DateFilter.tsx` - Date range filtering
  - `StatusFilter.tsx` - Status-based filtering
  - `index.ts` - Filter components exports

### Form Response Components
- `form-responses/` - Form response handling
  - `FormResponseViewer.tsx` - Form response display

### Layout Components
- `layout/` - Layout and navigation components
  - `Layout.tsx` - Main application layout
  - `Header.tsx` - Application header
  - `Sidebar.tsx` - Application sidebar
  - `Footer.tsx` - Application footer

### Notification Components
- `notifications/` - Notification system
  - `NotificationCenter.tsx` - Notification management

### Transaction Components
- `transactions/` - Transaction management components
  - `TransactionList.tsx` - Transaction listing
  - `TransactionCard.tsx` - Individual transaction display
  - `TransactionFilters.tsx` - Transaction filtering
  - `TransactionForm.tsx` - Transaction creation/editing
  - `TransactionModal.tsx` - Transaction modal
  - `TransactionStats.tsx` - Transaction statistics
  - `TransactionTable.tsx` - Transaction data table
  - `TransactionDetails.tsx` - Transaction detail view
  - `TransactionExport.tsx` - Transaction export functionality
  - `TransactionImport.tsx` - Transaction import functionality
  - `index.ts` - Transaction components exports

### UI Components
- `ui/` - Base UI components
  - `Button.tsx` - Button variants
  - `Input.tsx` - Input field variants
  - `Select.tsx` - Select dropdown
  - `Checkbox.tsx` - Checkbox component
  - `Radio.tsx` - Radio button component
  - `Switch.tsx` - Toggle switch
  - `Badge.tsx` - Status badge
  - `Tooltip.tsx` - Tooltip component
  - `Alert.tsx` - Alert/notification component
  - `Dialog.tsx` - Dialog/modal component
  - `Tabs.tsx` - Tab navigation
  - `Accordion.tsx` - Collapsible content
  - `Progress.tsx` - Progress indicator
  - `Skeleton.tsx` - Loading skeleton
  - `Avatar.tsx` - User avatar
  - `Dropdown.tsx` - Dropdown menu
  - `Toast.tsx` - Toast notifications
  - `index.ts` - UI components exports

## Component Usage Patterns

### Import Patterns
```typescript
// Common pattern for component imports
import { ComponentName } from '@/components/ComponentName'
import { ComponentName } from '@/components/category/ComponentName'
```

### Export Patterns
- Each component directory has an `index.ts` file for clean exports
- Components are exported both individually and as groups

### Styling Patterns
- Uses Tailwind CSS for styling
- Components follow consistent naming conventions
- Responsive design patterns implemented

## Search Heuristics for Components

### By Functionality
- **Authentication**: Search in `auth/` directory
- **Data Display**: Search in `charts/`, `tables/`, `cards/`
- **Forms**: Search in `forms/`, `inputs/`, `modals/`
- **Navigation**: Search in `layout/`, `sidebar/`, `header/`
- **Filtering**: Search in `filters/`, `search/`

### By UI Pattern
- **Lists**: `*List.tsx`, `*Table.tsx`
- **Forms**: `*Form.tsx`, `*Modal.tsx`
- **Cards**: `*Card.tsx`, `*Tile.tsx`
- **Charts**: `*Chart.tsx`, `*Graph.tsx`
- **Filters**: `*Filter.tsx`, `*Search.tsx`

### By Data Type
- **Brands**: `brands/` directory
- **Transactions**: `transactions/` directory
- **Users**: `users/` directory
- **Dashboard**: `dashboard/` directory
