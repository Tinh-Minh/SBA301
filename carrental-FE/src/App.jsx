import { Container } from 'react-bootstrap';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppNavbar from './components/AppNavbar';
import MyRentalsPage from './pages/MyRentalsPage';
import OwnerOrdersPage from './pages/OwnerOrdersPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import BookingPage from './pages/BookingPage';

function App() {
  return (
    <>
      <AppNavbar />
      <Container className="pb-5">
        <Routes>
          <Route path="/" element={<Navigate to="/orders/my-rentals" replace />} />
          <Route path="/orders/new" element={<BookingPage />} />
          <Route path="/orders/my-rentals" element={<MyRentalsPage />} />
          <Route path="/orders/my-cars" element={<OwnerOrdersPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
        </Routes>
      </Container>
    </>
  );
}

export default App;
