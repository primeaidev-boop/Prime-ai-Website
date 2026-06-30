// App router - public routes with Navbar/Footer, admin routes with sidebar layout

import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Sidebar } from '@/components/admin/Sidebar';
import { useAuthStore } from '@/store/authStore';
import { ScrollToTop } from '@/components/shared/ScrollToTop';
import { WhatsAppFloat } from '@/components/shared/WhatsAppFloat';

const Home = lazy(() => import('@/pages/Home'));
const About = lazy(() => import('@/pages/About'));
const Courses = lazy(() => import('@/pages/Courses'));
const CoursePage = lazy(() => import('@/pages/CoursePage'));
const Contact = lazy(() => import('@/pages/Contact'));
const BlogListing = lazy(() => import('@/pages/BlogListing'));
const BlogPost = lazy(() => import('@/pages/BlogPost'));
const AdminLogin = lazy(() => import('@/pages/admin/Login'));
const Dashboard = lazy(() => import('@/pages/admin/Dashboard'));
const Bookings = lazy(() => import('@/pages/admin/Bookings'));
const Enquiries = lazy(() => import('@/pages/admin/Enquiries'));
const Settings = lazy(() => import('@/pages/admin/Settings'));
const CoursesAdmin = lazy(() => import('@/pages/admin/CoursesAdmin'));
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'));
const TermsConditions = lazy(() => import('@/pages/TermsConditions'));
const RefundPolicy = lazy(() => import('@/pages/RefundPolicy'));
const BlogPosts = lazy(() => import('@/pages/admin/BlogPosts'));
const BlogPostEditor = lazy(() => import('@/pages/admin/BlogPostEditor'));
const TutorialListing = lazy(() => import('@/pages/TutorialListing'));
const TutorialPage = lazy(() => import('@/pages/TutorialPage'));
const TutorialsAdmin = lazy(() => import('@/pages/admin/TutorialsAdmin'));
const TutorialLeads = lazy(() => import('@/pages/admin/TutorialLeads'));
const UserDashboard = lazy(() => import('@/pages/Dashboard'));
const Projects = lazy(() => import('@/pages/Projects'));
const ProjectDetail = lazy(() => import('@/pages/ProjectDetail'));
const ProjectsAdmin = lazy(() => import('@/pages/admin/ProjectsAdmin'));

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
    <>
    <ScrollToTop />
    <WhatsAppFloat />
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/l1" element={<CoursePage />} />
        <Route path="/courses/l2a" element={<CoursePage />} />
        <Route path="/courses/l2b" element={<CoursePage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/tutorials" element={<TutorialListing />} />
        <Route path="/tutorials/:slug" element={<TutorialPage />} />
        <Route path="/tutorials/:slug/:lesson" element={<TutorialPage />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:slug" element={<ProjectDetail />} />
        <Route path="/blog" element={<BlogListing />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsConditions />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
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
        <Route path="courses" element={<CoursesAdmin />} />
        <Route path="tutorials" element={<TutorialsAdmin />} />
        <Route path="tutorial-leads" element={<TutorialLeads />} />
        <Route path="projects" element={<ProjectsAdmin />} />
        <Route path="blog" element={<BlogPosts />} />
        <Route path="blog/new" element={<BlogPostEditor />} />
        <Route path="blog/:id/edit" element={<BlogPostEditor />} />
      </Route>
    </Routes>
    </>
  );
}
