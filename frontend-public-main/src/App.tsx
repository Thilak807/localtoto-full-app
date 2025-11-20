import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Seo from './components/Seo';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import HowItWorksSection from './components/HowItWorksSection';
import AppDownload from './components/AppDownload';
import Testimonials from './components/Testimonials';
import DriverCTA from './components/DriverCTA';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import AboutPage from './components/AboutPage';
import SafetyPage from './components/SafetyPage';
import RidesPage from './components/RidesPage';
import LearnMorePage from './components/LearnMorePage';
import ProfilePage from './components/ProfilePage';
import BecomeRiderPage from './components/BecomeRiderPage';
import SignInPage from './components/SignInPage';
import VerifyOtpPage from './components/VerifyOtpPage';
import BookingDetailsPage from './components/BookingDetailsPage';
import RideInitiatePage from './components/RideInitiatePage';
import BookingConfirmationPage from './components/BookingConfirmationPage';
import PaymentFeedbackPage from './components/PaymentFeedbackPage';
import UserOngoPage from './components/UserOngoPage';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminRides from './components/admin/AdminRides';
import AdminRideDetail from './components/admin/AdminRideDetail';
import AdminUsers from './components/admin/AdminUsers';
import AdminUserDetail from './components/admin/AdminUserDetail';
import AdminDrivers from './components/admin/AdminDrivers';
import AdminDriverDetail from './components/admin/AdminDriverDetail';
import DriversRequests from './components/admin/DriversRequests';
import AdminContactMessages from './components/admin/AdminContactMessages';
import AdminSettings from './components/admin/AdminSettings';
import RequireAdmin from './components/admin/RequireAdmin';
import AdminLogin from './components/admin/AdminLogin';
import RiderLoginPage from './components/RiderLoginPage';
import RiderVerifyOtpPage from './components/RiderVerifyOtpPage';
import RequireRider from './components/RequireRider';
import ContactUsPage from './components/ContactUsPage';
import DriverSupportPage from './components/DriverSupportPage';
import HowToJoinDriverPage from './components/HowToJoinDriverPage';

function HomePage() {
  return (
    <>
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <AppDownload />
        <Testimonials />
        <DriverCTA />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}

function AppRoutes() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  const baseDesc = 'Get toto in minutes. Currently running in Patna.';
  const pathMeta: Record<string, { title: string; desc?: string; }> = {
    '/': { title: 'Local ToTo – Book E‑Rickshaw in Minutes | Patna', desc: baseDesc },
    '/about': { title: 'About Local ToTo | Our Mission', desc: baseDesc },
    '/safety': { title: 'Safety with Local ToTo | Riders & Drivers', desc: baseDesc },
    '/rides': { title: 'Book a Ride | Local ToTo', desc: baseDesc },
    '/learn-more': { title: 'Learn More | Local ToTo', desc: baseDesc },
    '/become-rider': { title: 'Become a Driver | Earn with Local ToTo', desc: baseDesc },
    '/contact': { title: 'Contact Us | Local ToTo Support', desc: baseDesc },
    '/driver-support': { title: 'Driver Support | Local ToTo', desc: baseDesc },
    '/how-to-join-driver': { title: 'How to Join as Driver | Local ToTo', desc: baseDesc },
    '/profile': { title: 'Your Profile | Local ToTo', desc: baseDesc },
    '/signin': { title: 'Sign In | Local ToTo', desc: baseDesc },
    '/verify-otp': { title: 'Verify OTP | Local ToTo', desc: baseDesc },
    '/booking-details': { title: 'Booking Details | Local ToTo', desc: baseDesc },
    '/ride-initiate': { title: 'Confirm & Pay | Local ToTo', desc: baseDesc },
    '/booking-confirmation': { title: 'Booking Confirmation | Local ToTo', desc: baseDesc },
    '/user/ongo': { title: 'Your Ongo Rides | Local ToTo', desc: baseDesc },
  };
  const meta = pathMeta[location.pathname] || { title: 'Local ToTo', desc: baseDesc };

  return (
    <div className="min-h-screen">
      <Seo title={meta.title} description={meta.desc} canonical={window.location.href} />
      {!isAdminRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/safety" element={<SafetyPage />} />
        <Route path="/rides" element={<RidesPage />} />
        <Route path="/learn-more" element={<LearnMorePage />} />
        <Route path="/become-rider" element={<BecomeRiderPage />} />
        <Route path="/contact" element={<ContactUsPage />} />
        <Route path="/driver-support" element={<DriverSupportPage />} />
        <Route path="/how-to-join-driver" element={<HowToJoinDriverPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/booking-details" element={<BookingDetailsPage />} />
        <Route path="/ride-initiate" element={<RideInitiatePage />} />
        {/* Driver UI moved to separate app */}
        <Route path="/booking-confirmation" element={<BookingConfirmationPage />} />
        <Route path="/ride-payment-feedback" element={<PaymentFeedbackPage />} />
        <Route path="/user/ongo" element={<UserOngoPage />} />

        {/* Rider Auth & Dashboard */}
        <Route path="/rider/login" element={<RiderLoginPage />} />
        <Route path="/rider/verify-otp" element={<RiderVerifyOtpPage />} />
        <Route element={<RequireRider />}>
          <Route path="/rider/dashboard" element={<div>Rider Dashboard - Coming Soon</div>} />
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<RequireAdmin />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="rides" element={<AdminRides />} />
            <Route path="rides/:id" element={<AdminRideDetail />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="users/:id" element={<AdminUserDetail />} />
            <Route path="drivers" element={<AdminDrivers />} />
            <Route path="drivers/:id" element={<AdminDriverDetail />} />
            <Route path="driver-requests" element={<DriversRequests />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="contact-messages" element={<AdminContactMessages />} />

          </Route>
        </Route>
      </Routes>
    </div>
  );
}

function App() {
  // Update the document title
  React.useEffect(() => {
    document.title = "Local ToTo - E-Rickshaw Booking Platform";
  }, []);

  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;