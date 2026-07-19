import Dashboard from '../pages/admin/Dashboard';
import MenuManagement from '../pages/admin/MenuManagement';
import OrderManagement from '../pages/admin/OrderManagement';

export const adminRoutes = [
  { path: '/admin', element: <Dashboard /> },
  { path: '/admin/menu', element: <MenuManagement /> },
  { path: '/admin/orders', element: <OrderManagement /> },
];
