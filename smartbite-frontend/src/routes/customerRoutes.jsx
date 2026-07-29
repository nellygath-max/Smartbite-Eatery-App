import Checkout from '../pages/Checkout';
import PaymentSuccess from '../pages/PaymentSuccess';
import Profile from '../pages/Profile';
import MyOrders from '../pages/MyOrders';
import MySupportMessages from '../pages/MySupportMessages';

export const customerRoutes = [
  { path: '/checkout', element: <Checkout /> },
  { path: '/payment-success', element: <PaymentSuccess /> },
  { path: '/profile', element: <Profile /> },
  { path: '/orders', element: <MyOrders /> },
  { path: '/support/messages', element: <MySupportMessages /> },
];
