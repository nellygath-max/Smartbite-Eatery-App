import Home from '../pages/Home';
import About from '../pages/About';
import Contact from '../pages/Contact';
import Menu from '../pages/Menu';
import MealDetails from '../pages/MealDetails';
import Cart from '../pages/Cart';
import Login from '../pages/Login';
import Register from '../pages/Register';

export const publicRoutes = [
  { path: '/', element: <Home /> },
  { path: '/about', element: <About /> },
  { path: '/contact', element: <Contact /> },
  { path: '/menu', element: <Menu /> },
  { path: '/menu/:id', element: <MealDetails /> },
  { path: '/cart', element: <Cart /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
];
