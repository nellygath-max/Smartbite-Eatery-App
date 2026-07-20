import { Outlet } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer';
export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-brand-background text-brand-text">
      <Header />
      <main className="flex-1 py-8 md:py-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
