import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-on-surface antialiased selection:bg-primary-container selection:text-on-primary-container">
      <Header />
      <main className="w-full flex-1 flex flex-col justify-start">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
