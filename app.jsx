import { Toaster } from "@/components/ui/sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import Music from './pages/Music';
import Videos from './pages/Videos';
import Redeem from './pages/Redeem';
import Clans from './pages/Clans';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { appParams } from '@/lib/app-params';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <Page />
            </LayoutWrapper>
          }
        />
      ))}
      <Route path="/Music" element={<LayoutWrapper currentPageName="Music"><Music /></LayoutWrapper>} />
      <Route path="/Videos" element={<LayoutWrapper currentPageName="Videos"><Videos /></LayoutWrapper>} />
      <Route path="/Redeem" element={<LayoutWrapper currentPageName="Redeem"><Redeem /></LayoutWrapper>} />
      <Route path="/Clans" element={<LayoutWrapper currentPageName="Clans"><Clans /></LayoutWrapper>} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {
  if (!appParams.appId || !appParams.appBaseUrl) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <section className="max-w-lg rounded-2xl border border-purple-500/30 bg-slate-900 p-8">
          <h1 className="text-2xl font-bold mb-4">Backendconfiguratie ontbreekt</h1>
          <p className="text-slate-300 mb-4">
            GameZone kan nog niet verbinden met de oorspronkelijke Base44-app.
            De app-ID of backend-URL ontbreekt in deze export.
          </p>
          <p className="text-slate-300">
            Configureer <code className="text-purple-300">VITE_BASE44_APP_ID</code> en{' '}
            <code className="text-purple-300">VITE_BASE44_APP_BASE_URL</code> met de gegevens
            van de oorspronkelijke app om in te loggen en te spelen.
          </p>
        </section>
      </main>
    );
  }

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
