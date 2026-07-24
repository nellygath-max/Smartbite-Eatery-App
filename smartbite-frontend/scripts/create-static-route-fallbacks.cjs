const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '..', 'dist');
const sourceIndex = path.join(distDir, 'index.html');

const routes = [
  'about',
  'admin',
  'admin/categories',
  'admin/menu',
  'admin/orders',
  'admin/profile',
  'admin/reviews',
  'admin/users',
  'cart',
  'checkout',
  'contact',
  'delivery/orders',
  'login',
  'menu',
  'orders',
  'payment-success',
  'profile',
  'register',
];

if (!fs.existsSync(sourceIndex)) {
  throw new Error(`Missing build output: ${sourceIndex}`);
}

for (const route of routes) {
  const routeDir = path.join(distDir, route);
  fs.mkdirSync(routeDir, { recursive: true });
  fs.copyFileSync(sourceIndex, path.join(routeDir, 'index.html'));
}

fs.copyFileSync(sourceIndex, path.join(distDir, '404.html'));
