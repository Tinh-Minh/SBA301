import { Badge } from 'react-bootstrap';
import { ORDER_STATUS_LABEL } from '../utils/format';

export default function StatusBadge({ status }) {
  const info = ORDER_STATUS_LABEL[status] || { text: status, bg: 'dark' };
  return <Badge bg={info.bg}>{info.text}</Badge>;
}
