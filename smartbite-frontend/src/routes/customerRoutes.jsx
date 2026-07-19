import Checkout from '../pages/Checkout';
import Profile from '../pages/Profile';
import MyOrders from '../pages/MyOrders';

export const customerRoutes = [
  { path: '/checkout', element: <Checkout /> },
  { path: '/profile', element: <Profile /> },
  { path: '/orders', element: <MyOrders /> },
];
