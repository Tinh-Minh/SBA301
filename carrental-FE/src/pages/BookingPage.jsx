import { useState } from 'react';
import { Alert, Button, Card, Col, Form, Row, Table } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getErrorMessage } from '../services/api';
import { orderService } from '../services/orderService';
import { RENTAL_TYPE_LABEL, formatDateTime, formatMoney } from '../utils/format';

/**
 * Đặt xe trên một slot. Trang tìm kiếm slot của Function 2 chỉ cần điều hướng tới
 * /orders/new?slotId=<id> là form tự điền sẵn slot.
 */
export default function BookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    carSlotId: searchParams.get('slotId') || '',
    rentalType: 'HOURLY',
    startTime: '',
    endTime: '',
    voucherCode: '',
    note: '',
  });
  const [errors, setErrors] = useState({});
  const [quote, setQuote] = useState(null);
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setQuote(null);
  };

  const validate = () => {
    const newErrors = {};
    if (!form.carSlotId) newErrors.carSlotId = 'Vui lòng nhập mã slot';
    if (!form.startTime) newErrors.startTime = 'Vui lòng chọn giờ nhận xe';
    if (!form.endTime) newErrors.endTime = 'Vui lòng chọn giờ trả xe';
    if (form.startTime && form.endTime && form.endTime <= form.startTime) {
      newErrors.endTime = 'Giờ trả xe phải sau giờ nhận xe';
    }
    if (form.note.length > 500) newErrors.note = 'Ghi chú tối đa 500 ký tự';
    return newErrors;
  };

  const buildPayload = () => ({
    carSlotId: Number(form.carSlotId),
    rentalType: form.rentalType,
    startTime: form.startTime,
    endTime: form.endTime,
    voucherCode: form.voucherCode.trim() || null,
    note: form.note.trim() || null,
  });

  const handleQuote = async () => {
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    setServerError('');
    try {
      setQuote(await orderService.quote(buildPayload()));
    } catch (err) {
      setQuote(null);
      setServerError(getErrorMessage(err));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    setServerError('');
    setSubmitting(true);
    try {
      const order = await orderService.createOrder(buildPayload());
      navigate(`/orders/${order.id}`);
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Row>
      <Col lg={7}>
        <Card>
          <Card.Body>
            <h4 className="mb-4">Đặt xe</h4>
            {serverError && <Alert variant="danger">{serverError}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>Mã slot</Form.Label>
                <Col sm={9}>
                  <Form.Control type="number" name="carSlotId" value={form.carSlotId}
                                onChange={handleChange} isInvalid={!!errors.carSlotId} />
                  <Form.Control.Feedback type="invalid">{errors.carSlotId}</Form.Control.Feedback>
                </Col>
              </Form.Group>

              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>Hình thức</Form.Label>
                <Col sm={9} className="pt-2">
                  {Object.entries(RENTAL_TYPE_LABEL).map(([value, label]) => (
                    <Form.Check inline type="radio" key={value} id={`type-${value}`} name="rentalType"
                                value={value} label={label} checked={form.rentalType === value}
                                onChange={handleChange} />
                  ))}
                </Col>
              </Form.Group>

              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>Nhận xe</Form.Label>
                <Col sm={9}>
                  <Form.Control type="datetime-local" name="startTime" value={form.startTime}
                                onChange={handleChange} isInvalid={!!errors.startTime} />
                  <Form.Control.Feedback type="invalid">{errors.startTime}</Form.Control.Feedback>
                </Col>
              </Form.Group>

              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>Trả xe</Form.Label>
                <Col sm={9}>
                  <Form.Control type="datetime-local" name="endTime" value={form.endTime}
                                onChange={handleChange} isInvalid={!!errors.endTime} />
                  <Form.Control.Feedback type="invalid">{errors.endTime}</Form.Control.Feedback>
                </Col>
              </Form.Group>

              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>Mã voucher</Form.Label>
                <Col sm={9}>
                  <Form.Control type="text" name="voucherCode" value={form.voucherCode} onChange={handleChange} />
                </Col>
              </Form.Group>

              <Form.Group as={Row} className="mb-4">
                <Form.Label column sm={3}>Ghi chú</Form.Label>
                <Col sm={9}>
                  <Form.Control as="textarea" rows={3} name="note" value={form.note}
                                onChange={handleChange} isInvalid={!!errors.note} />
                  <Form.Control.Feedback type="invalid">{errors.note}</Form.Control.Feedback>
                </Col>
              </Form.Group>

              <div className="text-center">
                <Button variant="outline-primary" className="me-3 px-4" onClick={handleQuote}>
                  Xem giá
                </Button>
                <Button type="submit" variant="primary" className="px-4" disabled={submitting}>
                  {submitting ? 'Đang đặt...' : 'Đặt xe'}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Col>

      <Col lg={5}>
        {quote && (
          <Card className="mt-3 mt-lg-0">
            <Card.Header>Báo giá</Card.Header>
            <Card.Body>
              <Table size="sm" borderless className="mb-0">
                <tbody>
                  <tr><td>Thời gian</td><td className="text-end">{formatDateTime(quote.startTime)} → {formatDateTime(quote.endTime)}</td></tr>
                  <tr><td>Đơn giá</td><td className="text-end">{formatMoney(quote.unitPrice)} / {quote.rentalType === 'HOURLY' ? 'giờ' : 'ngày'}</td></tr>
                  <tr><td>Số lượng (làm tròn lên)</td><td className="text-end">{quote.quantity} {quote.rentalType === 'HOURLY' ? 'giờ' : 'ngày'}</td></tr>
                  <tr><td>Tiền thuê</td><td className="text-end">{formatMoney(quote.rentalAmount)}</td></tr>
                  <tr><td>Giảm giá {quote.voucherCode && `(${quote.voucherCode})`}</td><td className="text-end">- {formatMoney(quote.discountAmount)}</td></tr>
                  <tr className="fw-bold"><td>Tổng tiền thuê</td><td className="text-end">{formatMoney(quote.totalAmount)}</td></tr>
                  <tr><td>Tiền cọc (hoàn khi trả xe)</td><td className="text-end">{formatMoney(quote.depositAmount)}</td></tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        )}
      </Col>
    </Row>
  );
}
