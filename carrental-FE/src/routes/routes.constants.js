export const ROUTES = {
  // Public & Customer Routes
  HOME: '/',
  TRIP: '/trip',
  TRIPS: '/trips',
  CARS: '/cars',
  CAR_DETAIL: '/trip/:id',
  PROFILE: '/profile',
  PROFILE_KYC: '/profile/kyc',
  KYC: '/kyc',
  ACCOUNT: '/account',

  // Auth Routes
  LOGIN: '/login',
  REGISTER: '/register',

  // Admin Management Routes
  ADMIN: {
    ROOT: '/admin',
    DASHBOARD: '/admin',
    CARS: '/admin/cars',
    BOOKINGS: '/admin/bookings',
    USERS: '/admin/users',
  },
};

export default ROUTES;
