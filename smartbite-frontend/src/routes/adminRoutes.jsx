import Dashboard from '../pages/admin/Dashboard';
import CategoriesManagement from '../pages/admin/CategoriesManagement';
import MenuManagement from '../pages/admin/MenuManagement';
import OrderManagement from '../pages/admin/OrderManagement';
import Profile from '../pages/Profile';
import ReviewsManagement from '../pages/admin/ReviewsManagement';
import UsersManagement from '../pages/admin/UsersManagement';
import ContactMessages from '../pages/admin/ContactMessages';

export const adminRoutes = [
  { path: '/admin', element: <Dashboard /> },
  { path: '/admin/menu', element: <MenuManagement /> },
  { path: '/admin/categories', element: <CategoriesManagement /> },
  { path: '/admin/orders', element: <OrderManagement /> },
  { path: '/admin/users', element: <UsersManagement /> },
  { path: '/admin/reviews', element: <ReviewsManagement /> },
  { path: '/admin/contact', element: <ContactMessages /> },
  { path: '/admin/contact/:id', element: <ContactMessages /> },
  { path: '/admin/profile', element: <Profile /> },
];
