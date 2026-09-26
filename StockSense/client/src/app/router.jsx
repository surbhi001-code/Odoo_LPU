import { createBrowserRouter, Link } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import DashboardPage from '../features/dashboard/DashboardPage'
import ProductsPage from '../features/products/ProductsPage'
import OperationsPage from '../features/operations/pages/OperationsPage'
import WarehousesPage from '../features/warehouses/WarehousesPage'
import MovementsPage from '../features/movements/MovementsPage'
import AuthPage from '../features/auth/AuthPage'
import ProfilePage from '../features/auth/ProfilePage'
import EmptyState from '../components/ui/EmptyState'
export const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: (
      <div className="py-22.5 px-6 text-center text-[#819576] flex items-center flex-col gap-4.5 [&_p]:text-[13px] [&_p]:max-w-137.5 [&_p]:leading-[1.8]">
        <h1>Something went wrong</h1>
        <p>Please reload the workspace and try again.</p>
        <a
          href="/"
          className="button border border-[#286047] rounded-[6px] min-h-[37px] py-[9px] px-[15px] inline-flex items-center justify-center gap-2 text-[11px] font-semibold leading-[1.4] whitespace-nowrap transition duration-150 active:translate-y-px bg-[#286047] text-white shadow-[0_2px_3px_#26492d0c] hover:bg-[#184b35]"
        >
          Return to overview
        </a>
      </div>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'products', element: <ProductsPage /> },
      {
        path: 'operations/receipts',
        element: <OperationsPage key="receipts" type="Receipt" />,
      },
      {
        path: 'operations/deliveries',
        element: <OperationsPage key="deliveries" type="Delivery" />,
      },
      {
        path: 'operations/transfers',
        element: <OperationsPage key="transfers" type="Transfer" />,
      },
      {
        path: 'operations/adjustments',
        element: <OperationsPage key="adjustments" type="Adjustment" />,
      },
      { path: 'warehouses', element: <WarehousesPage /> },
      { path: 'movements', element: <MovementsPage /> },
      { path: 'profile', element: <ProfilePage /> },
      {
        path: '*',
        element: (
          <EmptyState
            title="This page is off the shelf"
            description="We couldn't find the page you're looking for."
          >
            <Link
              to="/"
              className="button border border-[#286047] rounded-[6px] min-h-[37px] py-[9px] px-[15px] inline-flex items-center justify-center gap-2 text-[11px] font-semibold leading-[1.4] whitespace-nowrap transition duration-150 active:translate-y-px bg-[#286047] text-white shadow-[0_2px_3px_#26492d0c] hover:bg-[#184b35]"
            >
              Back to overview
            </Link>
          </EmptyState>
        ),
      },
    ],
  },
  ...['login', 'signup', 'reset'].map((mode) => ({
    path: `/auth/${mode}`,
    element: <AuthPage key={mode} mode={mode} />,
  })),
])
