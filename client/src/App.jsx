import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ConfirmProvider } from './context/ConfirmContext';
import Login from './pages/Login';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// ── Lazy-loaded pages (only fetched when user navigates to them) ──
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Faculty = lazy(() => import('./pages/Faculty'));
const Tasks = lazy(() => import('./pages/Tasks'));
const Meetings = lazy(() => import('./pages/Meetings'));
const Schedule = lazy(() => import('./pages/Schedule'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));
const Chat = lazy(() => import('./pages/Chat'));
const Notifications = lazy(() => import('./pages/Notifications'));

// ── Page loading fallback ──
const PageLoader = () => (
  <div className="flex flex-col justify-center items-center h-[calc(100vh-8rem)] gap-4">
    <div className="w-10 h-10 border-[3px] border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
    <p className="text-slate-400 font-medium text-sm animate-pulse">Loading...</p>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <ConfirmProvider>
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
                <Route path="faculty" element={<Suspense fallback={<PageLoader />}><Faculty /></Suspense>} />
                <Route path="tasks" element={<Suspense fallback={<PageLoader />}><Tasks /></Suspense>} />
                <Route path="meetings" element={<Suspense fallback={<PageLoader />}><Meetings /></Suspense>} />
                <Route path="schedule" element={<Suspense fallback={<PageLoader />}><Schedule /></Suspense>} />
                <Route path="reports" element={<Suspense fallback={<PageLoader />}><Reports /></Suspense>} />
                <Route path="settings" element={<Suspense fallback={<PageLoader />}><Settings /></Suspense>} />
                <Route path="chat" element={<Suspense fallback={<PageLoader />}><Chat /></Suspense>} />
                <Route path="notifications" element={<Suspense fallback={<PageLoader />}><Notifications /></Suspense>} />
              </Route>
            </Routes>
          </ConfirmProvider>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
