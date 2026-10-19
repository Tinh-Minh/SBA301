import OrderListPage from '../components/OrderListPage';
import { orderService } from '../services/orderService';

export default function MyRentalsPage() {
  return <OrderListPage title="Đơn tôi đã thuê" fetchOrders={orderService.getMyRentals} />;
}
