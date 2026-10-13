import OrderListPage from '../components/OrderListPage';
import { orderService } from '../services/orderService';

export default function OwnerOrdersPage() {
  return <OrderListPage title="Đơn đặt xe của tôi" fetchOrders={orderService.getOrdersOfMyCars} showRenter />;
}
