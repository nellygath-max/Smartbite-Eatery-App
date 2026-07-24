import Checkout from '../pages/Checkout';
import PaymentSuccess from '../pages/PaymentSuccess';
import Profile from '../pages/Profile';
import MyOrders from '../pages/MyOrders';

export const customerRoutes = [
  { path: '/checkout', element: <Checkout /> },
  { path: '/payment-success', element: <PaymentSuccess /> },
  { path: '/profile', element: <Profile /> },
  { path: '/orders', element: <MyOrders /> },
];
