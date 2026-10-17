import { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Form, Row, Spinner, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { getErrorMessage } from '../services/api';
import { ORDER_STATUS_LABEL, RENTAL_TYPE_LABEL, formatDateTime, formatMoney } from '../utils/format';

const PAGE_SIZE = 10;

/** Danh sách đơn có lọc trạng thái + phân trang, dùng chung cho người thuê / chủ xe / admin. */
export default function OrderListPage({ title, fetchOrders, showRenter = false }) {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let ignore = false;
    const params = { page, size: PAGE_SIZE, sortBy: 'createdAt', direction: 'desc' };
    if (status) params.status = status;
    fetchOrders(params)
      .then((result) => {
        if (ignore) return;
        setData(result);
        setError('');
      })
      .catch((err) => {
        if (ignore) return;
        setError(getErrorMessage(err));
        setData(null);
      })
      .finally(() => {
        if (!ignore) setLoaded(true);
      });
    return () => {
      ignore = true;
    };
  }, [fetchOrders, page, status]);

  return (
    <Card>
      <Card.Body>
        <Row className="mb-3 align-items-center">
          <Col><h4 className="mb-0">{title}</h4></Col>
          <Col sm={4}>
            <Form.Select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(0);
              }}
            >
              <option value="">Tất cả trạng thái</option>
              {Object.entries(ORDER_STATUS_LABEL).map(([key, info]) => (
                <option key={key} value={key}>{info.text}</option>
              ))}
            </Form.Select>
          </Col>
        </Row>

        {error && <Alert variant="danger">{error}</Alert>}
        {!loaded && <Spinner animation="border" size="sm" />}

        {data && (
          <>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Xe</th>
                  {showRenter && <th>Người thuê</th>}
                  <th>Hình thức</th>
                  <th>Nhận xe</th>
                  <th>Trả xe</th>
                  <th className="text-end">Tổng tiền</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {data.content.length === 0 && (
                  <tr><td colSpan={showRenter ? 8 : 7} className="text-center">Chưa có đơn nào</td></tr>
                )}
                {data.content.map((o) => (
                  <tr key={o.id}>
                    <td><Link to={`/orders/${o.id}`}>{o.orderCode}</Link></td>
                    <td>{o.carName} <small className="text-muted">({o.licensePlate})</small></td>
                    {showRenter && <td>{o.customerName}</td>}
                    <td>{RENTAL_TYPE_LABEL[o.rentalType]}</td>
                    <td>{formatDateTime(o.startTime)}</td>
                    <td>{formatDateTime(o.endTime)}</td>
                    <td className="text-end">{formatMoney(o.totalAmount)}</td>
                    <td><StatusBadge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <div className="d-flex justify-content-between align-items-center">
              <span>Tổng: {data.totalElements} đơn</span>
              <div>
                <Button size="sm" variant="outline-secondary" className="me-2"
                        disabled={page === 0} onClick={() => setPage(page - 1)}>
                  Trước
                </Button>
                <span>Trang {data.totalPages === 0 ? 0 : page + 1}/{data.totalPages}</span>
                <Button size="sm" variant="outline-secondary" className="ms-2"
                        disabled={page + 1 >= data.totalPages} onClick={() => setPage(page + 1)}>
                  Sau
                </Button>
              </div>
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );
}
