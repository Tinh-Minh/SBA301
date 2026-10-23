import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';

/**
 * Root Application Component
 * Encapsulates Routing, Layouts, and Global Providers
 */
export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
