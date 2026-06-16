import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BusinessDashboardConsumer from './pages/budinessdashboard/BusinessDashboard';
import ScannerPage from './pages/budinessdashboard/ScannerPage';
import BusinessDashboardMerchant from './pages/business/BusinessDashboard';
import BusinessProfile from './pages/business/BusinessProfile';
import BusinessShops from './pages/business/BusinessShops';
import BusinessShopProducts from './pages/business/BusinessShopProducts';
import InventoryPage from './pages/business/InventoryPage';
import TriSarathiDelivery from './pages/business/TriSarathiDelivery';
import BusinessRegistration from './pages/registration-form/BusinessRegistration';
import BusinessRegistrationWizard from './pages/registration-form/BusinessRegistrationWizard';
import BusinessOnboarding from './pages/registration-form/BusinessOnboarding';
import ProductAddition from './pages/registration-form/ProductAddition';
import ProductRegistration from './pages/ProductRegistration/ProductRegistration.jsx';
import CaptainRegister from './pages/captain/CaptainRegister';
import CaptainLogin from './pages/captain/CaptainLogin';
import CaptainLayout from './pages/captain/layout/CaptainLayout';
import CaptainHome from './pages/captain/CaptainHome';
import CaptainProfile from './pages/captain/CaptainProfile';
import CaptainKyc from './pages/captain/CaptainKyc';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BusinessDashboardConsumer />} />
        <Route path="/demo/budiness-dashboard" element={<BusinessDashboardConsumer />} />
        <Route path="/demo/scanner" element={<ScannerPage />} />
        <Route path="/merchant" element={<BusinessDashboardMerchant />} />
        <Route path="/business/profile" element={<BusinessProfile />} />
        <Route path="/business/shops" element={<BusinessShops />} />
        <Route path="/business/shops/:id/products" element={<BusinessShopProducts />} />
        <Route path="/business/inventory" element={<InventoryPage />} />
        <Route path="/business/delivery" element={<TriSarathiDelivery />} />
        <Route path="/registration" element={<BusinessRegistration />} />
        <Route path="/registration-wizard" element={<BusinessRegistrationWizard />} />
        <Route path="/onboarding" element={<BusinessOnboarding />} />
        <Route path="/registration/add-products" element={<ProductAddition />} />
        <Route path="/product-registration" element={<ProductRegistration />} />
        {/* Captain Routes */}
        <Route path="/captain/register" element={<CaptainRegister />} />
        <Route path="/captain/login" element={<CaptainLogin />} />
        
        {/* Protected Captain Routes wrapped in CaptainLayout */}
        <Route path="/captain" element={<CaptainLayout />}>
          <Route path="home" element={<CaptainHome />} />
          <Route path="profile" element={<CaptainProfile />} />
          <Route path="kyc" element={<CaptainKyc />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
