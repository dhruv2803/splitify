# Dashboard Component

## Purpose
The `Dashboard` is the primary landing view for authenticated users, providing a comprehensive data-driven overview of their financial state.

## Behavioral Characteristics
- **Real-time Data Aggregation**: Subscribes to `accounts`, `transactions`, and `categories`. It processes this data locally using `useMemo` for performance.
- **Multi-Currency Consolidation**: 
    - Displays balances in their native currencies.
    - Provides a "Consolidated Total" converted to the user's default currency using rates from `lib/utils.ts`.
- **Advanced Visualization**:
    - **Expense Momentum**: A 14-day rolling bar chart showing daily spending.
    - **Category Alpha**: A donut (pie) chart showing the proportional distribution of spending by category.
    - **Drift Analysis**: A small area chart showing the month-over-month (MOM) expense trend.
    - **Income vs Spending**: A comparative bar chart for the last 6 months.
- **Interactive Elements**: Quick-access buttons to switch to the "Accounts" or "Transactions" tabs.

## State & Data Processing
- **State**: Manages arrays of accounts, transactions, and categories fetched from Firestore.
- **Processing**:
    - `monthlyData`: Filters and groups transactions by month for the last 6 months.
    - `categoryData`: Aggregates expenses by category name.
    - `dailyTrendData`: Calculates daily totals for the last 14 days.

## Visual Tokens
- **Colors**: Uses a custom `CHART_COLORS` palette (Blue, Violet, Pink, Rose, Amber, Emerald, Cyan).
- **Animations**: Uses `motion/react` for slide-in effects on cards and charts.
- **Typography**: Heavily uses `font-black` and `tracking-tighter` for large numerical values to create a premium, authoritative look.

## Dependencies
- `recharts`: Chart rendering.
- `lucide-react`: Status icons.
- `framer-motion`: Entry animations.
- `lib/utils`: Currency conversion and formatting logic.
