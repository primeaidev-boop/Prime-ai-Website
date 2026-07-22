// App router - public routes with Navbar/Footer, admin routes with sidebar layout

import { Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Sidebar } from '@/components/admin/Sidebar';
import { useAuthStore } from '@/store/authStore';
import { ScrollToTop } from '@/components/shared/ScrollToTop';
import { WhatsAppFloat } from '@/components/shared/WhatsAppFloat';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { lazyWithRetry } from '@/lib/lazyWithRetry';

const Home = lazyWithRetry(() => import('@/pages/Home'));
const About = lazyWithRetry(() => import('@/pages/About'));
const Courses = lazyWithRetry(() => import('@/pages/Courses'));
const CoursePage = lazyWithRetry(() => import('@/pages/CoursePage'));
const Contact = lazyWithRetry(() => import('@/pages/Contact'));
const BlogListing = lazyWithRetry(() => import('@/pages/BlogListing'));
const BlogPost = lazyWithRetry(() => import('@/pages/BlogPost'));
const AdminLogin = lazyWithRetry(() => import('@/pages/admin/Login'));
const Dashboard = lazyWithRetry(() => import('@/pages/admin/Dashboard'));
const Bookings = lazyWithRetry(() => import('@/pages/admin/Bookings'));
const Enquiries = lazyWithRetry(() => import('@/pages/admin/Enquiries'));
const Settings = lazyWithRetry(() => import('@/pages/admin/Settings'));
const CoursesAdmin = lazyWithRetry(() => import('@/pages/admin/CoursesAdmin'));
const PrivacyPolicy = lazyWithRetry(() => import('@/pages/PrivacyPolicy'));
const TermsConditions = lazyWithRetry(() => import('@/pages/TermsConditions'));
const RefundPolicy = lazyWithRetry(() => import('@/pages/RefundPolicy'));
const BlogPosts = lazyWithRetry(() => import('@/pages/admin/BlogPosts'));
const BlogPostEditor = lazyWithRetry(() => import('@/pages/admin/BlogPostEditor'));
const TutorialListing = lazyWithRetry(() => import('@/pages/TutorialListing'));
const TutorialPage = lazyWithRetry(() => import('@/pages/TutorialPage'));
const TutorialsAdmin = lazyWithRetry(() => import('@/pages/admin/TutorialsAdmin'));
const TutorialLeads = lazyWithRetry(() => import('@/pages/admin/TutorialLeads'));
const ProgramEnrollments = lazyWithRetry(() => import('@/pages/admin/ProgramEnrollments'));
const UserDashboard = lazyWithRetry(() => import('@/pages/Dashboard'));
const Projects = lazyWithRetry(() => import('@/pages/Projects'));
const ProjectDetail = lazyWithRetry(() => import('@/pages/ProjectDetail'));
const ProjectsAdmin = lazyWithRetry(() => import('@/pages/admin/ProjectsAdmin'));
const AiLaunchpad = lazyWithRetry(() => import('@/pages/AiLaunchpad'));
const ProgramPage = lazyWithRetry(() => import('@/pages/ProgramPage'));
const ThankYouPage = lazyWithRetry(() => import('@/pages/ThankYouPage'));
const ProgramPagesAdmin = lazyWithRetry(() => import('@/pages/admin/ProgramPagesAdmin'));

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
    <ErrorBoundary>
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
        <Route path="/programs/10-day-ai-launchpad" element={<AiLaunchpad />} />
      </Route>

      {/* Standalone light-theme program landing pages - no site Navbar/Footer */}
      <Route path="/program/:slug" element={
        <Suspense fallback={<PageLoader />}>
          <ProgramPage />
        </Suspense>
      } />
      <Route path="/program/:slug/thank-you" element={
        <Suspense fallback={<PageLoader />}>
          <ThankYouPage />
        </Suspense>
      } />

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
        <Route path="program-enrollments" element={<ProgramEnrollments />} />
        <Route path="projects" element={<ProjectsAdmin />} />
        <Route path="blog" element={<BlogPosts />} />
        <Route path="blog/new" element={<BlogPostEditor />} />
        <Route path="blog/:id/edit" element={<BlogPostEditor />} />
        <Route path="program-pages" element={<ProgramPagesAdmin />} />
      </Route>
    </Routes>
    </ErrorBoundary>
  );
}
