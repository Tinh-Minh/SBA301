import OrderListPage from '../components/OrderListPage';
import { orderService } from '../services/orderService';

export default function AdminOrdersPage() {
  return <OrderListPage title="Tất cả đơn thuê" fetchOrders={orderService.getAllOrders} showRenter />;
}
