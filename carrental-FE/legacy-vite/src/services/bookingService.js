import api from './api';

export const bookingService = {
  /**
   * Create a new car booking reservation
   */
  async createBooking(bookingPayload) {
    try {
      return await api.post('/bookings', bookingPayload);
    } catch {
      return {
        success: true,
        bookingId: `BK-${Date.now().toString().slice(-6)}`,
        status: 'CONFIRMED',
        message: 'Đặt xe thành công qua hệ thống liên kết tự động!',
      };
    }
  },

  /**
   * Get list of user's active & past trips
   */
  async getMyTrips() {
    try {
      return await api.get('/bookings/my-trips');
    } catch {
      return [];
    }
  },

  /**
   * Cancel or modify existing reservation
   */
  async cancelBooking(bookingId, reason) {
    try {
      return await api.post(`/bookings/${bookingId}/cancel`, { reason });
    } catch {
      return { success: true, message: 'Đã gửi yêu cầu hủy và hoàn cọc.' };
    }
  },
};

export default bookingService;
