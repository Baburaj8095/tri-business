import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BusinessDashboardConsumer from './pages/budinessdashboard/BusinessDashboard';
import ScannerPage from './pages/budinessdashboard/ScannerPage';
import BusinessDashboardMerchant from './pages/business/BusinessDashboard';
import BusinessProfilePage from './pages/business/BusinessProfilePage';
import BusinessShops from './pages/business/BusinessShops';
import BusinessShopProducts from './pages/business/BusinessShopProducts';
import NearbyStoresPage from './pages/business/NearbyStoresPage';
import ShopDetailsPage from './pages/business/ShopDetailsPage';
import MerchantOrdersPage from './pages/business/MerchantOrdersPage';
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
import CssBaseline from '@mui/material/CssBaseline';
import BusinessDashboard from './pages/business/BusinessDashboard';
import BusinessProfile from './pages/business/BusinessProfile.jsx';
import AdsManagerPage from './pages/business/AdsManagerPage.jsx';
import OnlineProductsPage from './pages/business/OnlineProductsPage.jsx';
import BusinessOnlineMarketplacePage from './pages/business/BusinessOnlineMarketplacePage.jsx';
import BusinessB2BCartPage from './pages/business/BusinessB2BCartPage.jsx';
import BusinessB2BOrdersPage from './pages/business/BusinessB2BOrdersPage.jsx';
import BusinessB2BSellerOrdersPage from './pages/business/BusinessB2BSellerOrdersPage.jsx';

import { Navigate } from 'react-router-dom';

function RootRedirect() {
  const isCaptain = !!localStorage.getItem('token_captain');
  const isBusiness = !!localStorage.getItem('token_business');

  if (isCaptain) {
    return <Navigate to="/captain/home" replace />;
  } else if (isBusiness) {
    return <Navigate to="/business-dashboard" replace />;
  } else {
    return <Navigate to="/onboarding" replace />;
  }
}

function App() {
  return (
    <Router>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<RootRedirect />} />

        <Route path="/business-dashboard" element={<BusinessDashboardConsumer />} />
        <Route path="/v2/business-dashboard" element={<BusinessDashboard />} />
        <Route path="/scanner" element={<ScannerPage />} />
        <Route path="/merchant" element={<BusinessDashboardMerchant />} />
        <Route path="/business/profile" element={<BusinessProfile />} />
        <Route path="/business/shops" element={<BusinessShops />} />
        <Route path="/business/shops/:id/products" element={<BusinessShopProducts />} />
        <Route path="/business/nearby-stores" element={<NearbyStoresPage />} />
        <Route path="/business/shop/:id" element={<ShopDetailsPage />} />
        <Route path="/business/orders" element={<MerchantOrdersPage />} />
        <Route path="/business/inventory" element={<InventoryPage />} />
        <Route path="/business/delivery" element={<TriSarathiDelivery />} />
        <Route path="/business/ads" element={<AdsManagerPage />} />
        <Route path="/business/online-products" element={<OnlineProductsPage />} />
        <Route path="/business/online-marketplace" element={<BusinessOnlineMarketplacePage />} />
        <Route path="/business/online-marketplace/cart" element={<BusinessB2BCartPage />} />
        <Route path="/business/b2b-orders" element={<BusinessB2BOrdersPage />} />
        <Route path="/business/seller/b2b-orders" element={<BusinessB2BSellerOrdersPage />} />
        <Route path="/registration" element={<BusinessRegistration />} />
        <Route path="/registration-wizard" element={<BusinessRegistrationWizard />} />
        <Route path="/onboarding" element={<BusinessOnboarding />} />
        <Route path="/registration/add-products" element={<ProductAddition />} />
        <Route path="/product-registration" element={<ProductRegistration />} />
        {/* Captain Routes */}
        <Route path="/captain/register" element={<CaptainRegister />} />
        <Route path="/login" element={<CaptainLogin />} />
        
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
