import { Route, Routes } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';
import { publicRoutes } from './publicRoutes';
import { customerRoutes } from './customerRoutes';
import { adminRoutes } from './adminRoutes';
import { deliveryRoutes } from './deliveryRoutes';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {publicRoutes.map((route) => (
          <Route key={route.path} {...route} />
        ))}
        <Route element={<ProtectedRoute />}>
          {customerRoutes.map((route) => (
            <Route key={route.path} {...route} />
          ))}
        </Route>
      </Route>
      <Route element={<ProtectedRoute adminOnly />}>
        <Route element={<AdminLayout />}>
          {adminRoutes.map((route) => (
            <Route key={route.path} {...route} />
          ))}
        </Route>
      </Route>
      <Route element={<ProtectedRoute allowedRoles={['admin', 'delivery_staff']} />}>
        <Route element={<AdminLayout />}> 
          {deliveryRoutes.map((route) => (
            <Route key={route.path} {...route} />
          ))}
        </Route>
      </Route>
      <Route path="*" element={<MainLayout />} />
    </Routes>
  );
}
