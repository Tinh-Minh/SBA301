import { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Form, Modal, Row, Spinner, Table } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import HandoverSection from '../components/HandoverSection';
import StatusBadge from '../components/StatusBadge';
import { getErrorMessage } from '../services/api';
import { handoverService, orderService } from '../services/orderService';
import { RENTAL_TYPE_LABEL, formatDateTime, formatMoney } from '../utils/format';

const ACTION_LABEL = {
  reject: { title: 'Từ chối đơn', button: 'Từ chối', variant: 'danger' },
  cancel: { title: 'Huỷ đơn', button: 'Huỷ đơn', variant: 'danger' },
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const currentUserId = Number(localStorage.getItem('userId'));

  const [order, setOrder] = useState(null);
  const [handovers, setHandovers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [modalAction, setModalAction] = useState(null);
  const [reason, setReason] = useState('');

  // Tăng reloadKey để tải lại dữ liệu sau mỗi thao tác.
  const [reloadKey, setReloadKey] = useState(0);
  const load = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    let ignore = false;
    Promise.all([
      orderService.getOrder(id),
      handoverService.getHandovers(id),
      orderService.getLogs(id),
    ])
      .then(([orderData, handoverData, logData]) => {
        if (ignore) return;
        setError('');
        setOrder(orderData);
        setHandovers(handoverData);
        setLogs(logData);
      })
      .catch((err) => {
        if (!ignore) setError(getErrorMessage(err));
      });
    return () => {
      ignore = true;
    };
  }, [id, reloadKey]);

  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!order) return <Spinner animation="border" />;

  const isRenter = order.customerId === currentUserId;
  const isOwner = order.ownerId === currentUserId;
  const canConfirmOrReject = isOwner && order.status === 'PENDING';
  const canCancel = ['PENDING', 'CONFIRMED'].includes(order.status);

  const runAction = async (fn) => {
    setActionError('');
    try {
      await fn();
      setModalAction(null);
      setReason('');
      load();
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  const handleModalSubmit = () => {
    if (modalAction === 'reject') {
      runAction(() => orderService.rejectOrder(order.id, reason));
    } else {
      runAction(() => orderService.cancelOrder(order.id, reason));
    }
  };

  return (
    <>
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <span>Đơn <strong>{order.orderCode}</strong></span>
          <StatusBadge status={order.status} />
        </Card.Header>
        <Card.Body>
          {actionError && <Alert variant="danger">{actionError}</Alert>}
          <Row>
            <Col md={6}>
              <Table size="sm" borderless>
                <tbody>
                  <tr><td>Xe</td><td>{order.carName} ({order.licensePlate})</td></tr>
                  <tr><td>Chủ xe</td><td>{order.ownerName}</td></tr>
                  <tr><td>Người thuê</td><td>{order.customerName}</td></tr>
                  <tr><td>Hình thức</td><td>{RENTAL_TYPE_LABEL[order.rentalType]}</td></tr>
                  <tr><td>Nhận xe</td><td>{formatDateTime(order.startTime)}</td></tr>
                  <tr><td>Trả xe</td><td>{formatDateTime(order.endTime)}</td></tr>
                  <tr><td>Nhận xe thực tế</td><td>{formatDateTime(order.actualStartTime)}</td></tr>
                  <tr><td>Trả xe thực tế</td><td>{formatDateTime(order.actualEndTime)}</td></tr>
                  {order.status === 'PENDING' && (
                    <tr><td>Hạn chủ xe xác nhận</td><td>{formatDateTime(order.expiresAt)}</td></tr>
                  )}
                  {order.cancelReason && <tr><td>Lý do</td><td>{order.cancelReason}</td></tr>}
                  {order.note && <tr><td>Ghi chú</td><td>{order.note}</td></tr>}
                </tbody>
              </Table>
            </Col>
            <Col md={6}>
              <Table size="sm" borderless>
                <tbody>
                  <tr><td>Đơn giá</td><td className="text-end">{formatMoney(order.unitPrice)}</td></tr>
                  <tr><td>Số lượng</td><td className="text-end">{order.quantity} {order.rentalType === 'HOURLY' ? 'giờ' : 'ngày'}</td></tr>
                  <tr><td>Tiền thuê</td><td className="text-end">{formatMoney(order.rentalAmount)}</td></tr>
                  <tr><td>Giảm giá {order.voucherCode && `(${order.voucherCode})`}</td><td className="text-end">- {formatMoney(order.discountAmount)}</td></tr>
                  <tr className="fw-bold"><td>Tổng tiền thuê</td><td className="text-end">{formatMoney(order.totalAmount)}</td></tr>
                  <tr><td>Tiền cọc</td><td className="text-end">{formatMoney(order.depositAmount)}</td></tr>
                  <tr><td>Thanh toán</td><td className="text-end">{order.paymentStatus}</td></tr>
                </tbody>
              </Table>
            </Col>
          </Row>

          <div className="d-flex gap-2">
            {canConfirmOrReject && (
              <>
                <Button variant="success" onClick={() => runAction(() => orderService.confirmOrder(order.id))}>
                  Xác nhận đơn
                </Button>
                <Button variant="outline-danger" onClick={() => setModalAction('reject')}>Từ chối</Button>
              </>
            )}
            {canCancel && (isRenter || isOwner) && (
              <Button variant="outline-danger" onClick={() => setModalAction('cancel')}>Huỷ đơn</Button>
            )}
          </div>
        </Card.Body>
      </Card>

      <HandoverSection order={order} handovers={handovers} isRenter={isRenter} isOwner={isOwner} onChanged={load} />

      <Card>
        <Card.Header>Lịch sử đơn</Card.Header>
        <Card.Body>
          <Table size="sm" striped>
            <thead>
              <tr><th>Thời gian</th><th>Người thực hiện</th><th>Hành động</th><th>Trạng thái</th><th>Ghi chú</th></tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{formatDateTime(log.createdAt)}</td>
                  <td>{log.actorName}</td>
                  <td>{log.action}</td>
                  <td>{log.fromStatus ?? '-'} → {log.toStatus ?? '-'}</td>
                  <td>{log.note}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={modalAction !== null} onHide={() => setModalAction(null)}>
        <Modal.Header closeButton>
          <Modal.Title>{modalAction && ACTION_LABEL[modalAction].title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Label>Lý do {modalAction === 'cancel' && isRenter ? '(không bắt buộc)' : ''}</Form.Label>
          <Form.Control as="textarea" rows={3} maxLength={500} value={reason}
                        onChange={(e) => setReason(e.target.value)} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalAction(null)}>Đóng</Button>
          {modalAction && (
            <Button variant={ACTION_LABEL[modalAction].variant} onClick={handleModalSubmit}>
              {ACTION_LABEL[modalAction].button}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
}
