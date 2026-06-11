// App router — public routes with Navbar/Footer, admin routes with sidebar layout

import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Sidebar } from '@/components/admin/Sidebar';
import { useAuthStore } from '@/store/authStore';

const Home = lazy(() => import('@/pages/Home'));
const About = lazy(() => import('@/pages/About'));
const Courses = lazy(() => import('@/pages/Courses'));
const Contact = lazy(() => import('@/pages/Contact'));
const AdminLogin = lazy(() => import('@/pages/admin/Login'));
const Dashboard = lazy(() => import('@/pages/admin/Dashboard'));
const Bookings = lazy(() => import('@/pages/admin/Bookings'));
const Enquiries = lazy(() => import('@/pages/admin/Enquiries'));
const Settings = lazy(() => import('@/pages/admin/Settings'));

function PublicLayout() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
      <Footer />
    </>
  );
}

function AdminLayout() {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--navy)' }}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/admin/login" replace />;
}

function PageLoader() {
  return (
    <div
      className="flex items-center justify-center h-64"
      style={{ color: 'var(--muted)' }}
    >
      Loading...
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      <Route path="/admin/login" element={
        <Suspense fallback={<PageLoader />}>
          <AdminLogin />
        </Suspense>
      } />

      <Route path="/admin" element={
        <PrivateRoute>
          <AdminLayout />
        </PrivateRoute>
      }>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="enquiries" element={<Enquiries />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
