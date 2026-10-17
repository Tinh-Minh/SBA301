import { useState } from 'react';
import { Button, Container, Form, InputGroup, Nav, Navbar } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

/**
 * Thanh điều hướng. Ô "User ID" là TẠM THỜI để test Function 3 khi chưa có đăng nhập JWT
 * (Function 1 sẽ thay bằng nút Đăng nhập/Đăng xuất).
 */
export default function AppNavbar() {
  const [userId, setUserId] = useState(localStorage.getItem('userId') || '');

  const handleSave = (e) => {
    e.preventDefault();
    if (userId) {
      localStorage.setItem('userId', userId);
    } else {
      localStorage.removeItem('userId');
    }
    window.location.reload();
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={NavLink} to="/">Car Rental</Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/orders/new">Đặt xe</Nav.Link>
            <Nav.Link as={NavLink} to="/orders/my-rentals">Đơn tôi thuê</Nav.Link>
            <Nav.Link as={NavLink} to="/orders/my-cars">Đơn trên xe của tôi</Nav.Link>
            <Nav.Link as={NavLink} to="/admin/orders">Tất cả đơn (admin)</Nav.Link>
          </Nav>
          <Form onSubmit={handleSave} className="d-flex">
            <InputGroup size="sm">
              <InputGroup.Text>User ID (tạm)</InputGroup.Text>
              <Form.Control
                type="number"
                min="1"
                style={{ width: 90 }}
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
              <Button type="submit" variant="outline-light">Dùng</Button>
            </InputGroup>
          </Form>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
