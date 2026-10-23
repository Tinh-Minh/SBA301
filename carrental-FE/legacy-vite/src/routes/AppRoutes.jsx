import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './routes.constants';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';

// Customer Pages
import HomePage from '../pages/user/HomePage';
import ExploreCarsPage from '../pages/user/ExploreCarsPage';
import CarDetailPage from '../pages/user/CarDetailPage';
import ProfilePage from '../pages/user/ProfilePage';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

// Admin Pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminCarsPage from '../pages/admin/AdminCarsPage';
import AdminBookingsPage from '../pages/admin/AdminBookingsPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* 1. Customer & Public Pages (MainLayout) */}
      <Route element={<MainLayout />}>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.TRIP} element={<ExploreCarsPage />} />
        <Route path={ROUTES.TRIPS} element={<ExploreCarsPage />} />
        <Route path={ROUTES.CARS} element={<ExploreCarsPage />} />
        <Route path={ROUTES.CAR_DETAIL} element={<CarDetailPage />} />
        <Route path="/cars/:id" element={<CarDetailPage />} />
        <Route path="/car/:id" element={<CarDetailPage />} />
        <Route path="/explore" element={<Navigate to={ROUTES.TRIP} replace />} />
        <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
        <Route path={ROUTES.PROFILE_KYC} element={<ProfilePage initialTab="tab-kyc" />} />
        <Route path={ROUTES.KYC} element={<ProfilePage initialTab="tab-kyc" />} />
        <Route path={ROUTES.ACCOUNT} element={<Navigate to={ROUTES.PROFILE} replace />} />
      </Route>

      {/* 2. Admin Management System (AdminLayout) */}
      <Route path={ROUTES.ADMIN.ROOT} element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="cars" element={<AdminCarsPage />} />
        <Route path="bookings" element={<AdminBookingsPage />} />
        <Route path="users" element={<AdminUsersPage />} />
      </Route>

      {/* 3. Dedicated Fullscreen Authentication Hub */}
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

      {/* 4. Global Fallback */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
}
