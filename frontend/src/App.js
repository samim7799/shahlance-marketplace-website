import { useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Search from './pages/Search';
import ProductDetail from './pages/ProductDetail';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import FindFreelancers from './pages/FindFreelancers';
import PostJob from './pages/PostJob';
import Contact from './pages/Contact';
import Marketplace from './pages/Marketplace';
import MyAccount from './pages/MyAccount';
import BecomeSeller from './pages/BecomeSeller';
import SellerUpload from './pages/SellerUpload';
import AdminPanel from './pages/AdminPanel';
import { Toaster } from './components/ui/toaster';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthAccessWidget from './components/AuthAccessWidget';
import LiveSupportWidget from './components/LiveSupportWidget';

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

function App() {
  return (
    <div className="App min-h-screen bg-[#0a0f1e] text-slate-100">
      <BrowserRouter>
        <AuthProvider>
          <NotificationsProvider>
            <ScrollToTop />
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/find-freelancers" element={<FindFreelancers />} />
            <Route path="/post-job" element={<PostJob />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/become-seller" element={<BecomeSeller />} />
            <Route
              path="/my-account"
              element={<ProtectedRoute><MyAccount /></ProtectedRoute>}
            />
            <Route
              path="/seller/upload"
              element={<ProtectedRoute><SellerUpload /></ProtectedRoute>}
            />
            <Route
              path="/admin"
              element={<ProtectedRoute><AdminPanel /></ProtectedRoute>}
            />
            <Route
              path="/profile"
              element={<ProtectedRoute><Profile /></ProtectedRoute>}
            />
            <Route
              path="/dashboard/:role"
              element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
            />
            <Route
              path="/dashboard"
              element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
            />
          </Routes>
          <AuthAccessWidget />
            <LiveSupportWidget />
            <Toaster />
          </NotificationsProvider>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
