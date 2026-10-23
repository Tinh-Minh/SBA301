import api from './api';

export const carService = {
  /**
   * Fetch all vehicles with optional filters
   */
  async getCars(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      return await api.get(`/cars${query ? `?${query}` : ''}`);
    } catch {
      // Demo mock fallback if BE is offline
      return null;
    }
  },

  /**
   * Get single car by ID
   */
  async getCarById(id) {
    try {
      return await api.get(`/cars/${id}`);
    } catch {
      return null;
    }
  },

  /**
   * Get featured vehicles for homepage
   */
  async getFeaturedCars() {
    try {
      return await api.get('/cars/featured');
    } catch {
      return null;
    }
  },

  /**
   * Admin: Create new vehicle in fleet
   */
  async createCar(carData) {
    return await api.post('/admin/cars', carData);
  },

  /**
   * Admin: Update vehicle details
   */
  async updateCar(id, carData) {
    return await api.put(`/admin/cars/${id}`, carData);
  },

  /**
   * Admin: Delete or deactivate vehicle
   */
  async deleteCar(id) {
    return await api.delete(`/admin/cars/${id}`);
  },
};

export default carService;
