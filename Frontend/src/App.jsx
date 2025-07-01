import { useState } from 'react';
import './App.css';
import Navbar from './Components/Navbar';
import Home from './Components/Home';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Components/Login';
import Services from './Components/Services';
import Servicesouterview from './Components/Servicesouterview';
import WaitingForAdminApproval from './Components/WaitingForAdminApproval';
import AdminProvidersRequest from './Components/AdminProvidersRequest';
import ProviderRequestRejected from './Components/ProviderRequestRejected';
import MakeBookings from './Components/MakeBookings';
import MyBookings from './Components/MyBookings';
import AllProviders from './Components/AllProviders';
import AdminDashboard from './Components/AdminDashboard'; 
import { useAuth } from './Components/AuthContext';
import BookingSummary from './Components/BookingSummary';
import ProviderBookingRequests from './Components/ProviderBookingRequests'
import ProviderDashboard from './Components/ProviderDashboard'
import PaymentSuccess from './Components/PaymentSuccess';


function App() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/services' element={<Services />} />
        <Route path='/servicesouterview' element={<Servicesouterview />} />
        <Route path='/providerwaiting' element={<WaitingForAdminApproval />} />
        <Route path='/providerrequestrejected' element={<ProviderRequestRejected />} />
        <Route path='/makebooking' element={<MakeBookings />} />
        <Route path='/customer/mybookings' element={<MyBookings />} />

        {/* ✅ Admin Routes */}
        {user?.role === 'admin' && (
          <>
            <Route path='/providersrequest' element={<AdminProvidersRequest />} />
            <Route path='/allproviders' element={<AllProviders />} />
            <Route path='/admin-dashboard' element={<AdminDashboard />} />
          </>
        )}

        {/* ✅ Protected fallback for direct URL access to /admin-dashboard */}
        {!user?.role && (
          <Route path='/admin-dashboard' element={<Navigate to='/login' />} />
        )}

        {/* ✅ Optional: Catch-all for undefined routes */}
        <Route path='*' element={<Navigate to='/' />} />

        <Route path="/booking-summary" element={<BookingSummary />} />

        <Route path='/providerbookingrequests' element={<ProviderBookingRequests />} />
        <Route path='/providerdashboard' element={<ProviderDashboard />} />

        <Route path="/payment-success/:bookingId" element={<PaymentSuccess />} />


      </Routes>
    </BrowserRouter>
  );
}

export default App;
