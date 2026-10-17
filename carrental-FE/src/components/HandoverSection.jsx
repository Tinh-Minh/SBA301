import { useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, Modal, Row, Table } from 'react-bootstrap';
import { getErrorMessage } from '../services/api';
import { handoverService } from '../services/orderService';
import { formatDateTime } from '../utils/format';

const EMPTY_FORM = { odometerKm: '', fuelPercent: '', conditionNote: '', imageUrls: '' };

/** Biên bản bàn giao nhận/trả xe của một đơn. */
export default function HandoverSection({ order, handovers, isRenter, isOwner, onChanged }) {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [modalError, setModalError] = useState('');

  const isParty = isRenter || isOwner;
  const hasPickup = handovers.some((h) => h.handoverType === 'PICKUP');
  const hasReturn = handovers.some((h) => h.handoverType === 'RETURN');
  const nextType = order.status === 'CONFIRMED' && !hasPickup ? 'PICKUP'
    : order.status === 'ONGOING' && !hasReturn ? 'RETURN' : null;

  const validate = () => {
    const e = {};
    if (form.odometerKm !== '' && Number(form.odometerKm) < 0) e.odometerKm = 'Số km không được âm';
    if (form.fuelPercent !== '' && (Number(form.fuelPercent) < 0 || Number(form.fuelPercent) > 100)) {
      e.fuelPercent = 'Nhiên liệu từ 0 đến 100%';
    }
    return e;
  };

  const handleCreate = async () => {
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    setModalError('');
    try {
      await handoverService.createHandover(order.id, {
        handoverType: nextType,
        odometerKm: form.odometerKm === '' ? null : Number(form.odometerKm),
        fuelPercent: form.fuelPercent === '' ? null : Number(form.fuelPercent),
        conditionNote: form.conditionNote || null,
        images: form.imageUrls.split('\n').map((s) => s.trim()).filter(Boolean)
          .map((imageUrl) => ({ imageUrl })),
      });
      setShow(false);
      setForm(EMPTY_FORM);
      onChanged();
    } catch (err) {
      setModalError(getErrorMessage(err));
    }
  };

  const closeModal = () => {
    setShow(false);
    setModalError('');
    setErrors({});
  };

  const handleConfirm = async (handoverId) => {
    setError('');
    try {
      await handoverService.confirmHandover(handoverId);
      onChanged();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const canConfirm = (h) =>
    (isRenter && !h.renterConfirmedAt) || (isOwner && !h.ownerConfirmedAt);

  return (
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <span>Biên bản bàn giao</span>
        {isParty && nextType && (
          <Button size="sm" onClick={() => setShow(true)}>
            {nextType === 'PICKUP' ? 'Lập biên bản nhận xe' : 'Lập biên bản trả xe'}
          </Button>
        )}
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {handovers.length === 0 && <p className="text-muted mb-0">Chưa có biên bản nào.</p>}
        {handovers.map((h) => (
          <div key={h.id} className="border rounded p-3 mb-3">
            <div className="d-flex justify-content-between">
              <strong>{h.handoverType === 'PICKUP' ? 'Nhận xe' : 'Trả xe'} - {formatDateTime(h.handedAt)}</strong>
              {h.fullyConfirmed ? <Badge bg="success">Đã đủ 2 bên xác nhận</Badge>
                : <Badge bg="warning" text="dark">Chờ xác nhận</Badge>}
            </div>
            <Table size="sm" borderless className="mb-2 mt-2">
              <tbody>
                <tr><td>Số km</td><td>{h.odometerKm ?? '-'}</td><td>Nhiên liệu</td><td>{h.fuelPercent ?? '-'}%</td></tr>
                <tr><td>Người thuê xác nhận</td><td>{formatDateTime(h.renterConfirmedAt)}</td>
                  <td>Chủ xe xác nhận</td><td>{formatDateTime(h.ownerConfirmedAt)}</td></tr>
              </tbody>
            </Table>
            {h.conditionNote && <p className="mb-2">Tình trạng: {h.conditionNote}</p>}
            <div className="d-flex flex-wrap gap-2">
              {h.images.map((img) => (
                <a key={img.id} href={img.imageUrl} target="_blank" rel="noreferrer">
                  <img src={img.imageUrl} alt={img.caption || 'Ảnh bàn giao'} width={90} height={60}
                       style={{ objectFit: 'cover' }} className="rounded border" />
                </a>
              ))}
            </div>
            {canConfirm(h) && (
              <Button size="sm" variant="success" className="mt-2" onClick={() => handleConfirm(h.id)}>
                Tôi xác nhận biên bản
              </Button>
            )}
          </div>
        ))}
      </Card.Body>

      <Modal show={show} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>{nextType === 'PICKUP' ? 'Biên bản nhận xe' : 'Biên bản trả xe'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalError && <Alert variant="danger">{modalError}</Alert>}
          <Row className="mb-3">
            <Col>
              <Form.Label>Số km (odo)</Form.Label>
              <Form.Control type="number" min="0" value={form.odometerKm} isInvalid={!!errors.odometerKm}
                            onChange={(e) => setForm({ ...form, odometerKm: e.target.value })} />
              <Form.Control.Feedback type="invalid">{errors.odometerKm}</Form.Control.Feedback>
            </Col>
            <Col>
              <Form.Label>Nhiên liệu (%)</Form.Label>
              <Form.Control type="number" min="0" max="100" value={form.fuelPercent} isInvalid={!!errors.fuelPercent}
                            onChange={(e) => setForm({ ...form, fuelPercent: e.target.value })} />
              <Form.Control.Feedback type="invalid">{errors.fuelPercent}</Form.Control.Feedback>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label>Tình trạng xe</Form.Label>
            <Form.Control as="textarea" rows={3} value={form.conditionNote}
                          onChange={(e) => setForm({ ...form, conditionNote: e.target.value })} />
          </Form.Group>
          <Form.Group>
            <Form.Label>Link ảnh (mỗi dòng một link)</Form.Label>
            <Form.Control as="textarea" rows={3} value={form.imageUrls}
                          onChange={(e) => setForm({ ...form, imageUrls: e.target.value })} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>Huỷ</Button>
          <Button variant="primary" onClick={handleCreate}>Lưu biên bản</Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
}
