import React from 'react';
import { useNavigate } from 'react-router-dom';
import HeroTelemetry from '../components/HeroTelemetry';
import FeaturedVehicles from '../components/FeaturedVehicles';

export default function HomePage() {
  const navigate = useNavigate();

  const handleSearch = (criteria) => {
    // Navigate to explore page with search criteria
    navigate('/trip', { state: criteria });
  };

  return (
    <>
      {/* 2. CINEMATIC HERO & INTEGRATED SEARCH PANEL */}
      <HeroTelemetry onSearch={handleSearch} />

      {/* 3. COMPACT FEATURED VEHICLES SECTION */}
      <FeaturedVehicles />
    </>
  );
}
