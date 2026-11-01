import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/profile', data),
  addAddress: (data) => api.post('/auth/add-address', data),
  deleteAddress: (id) => api.delete(`/auth/address/${id}`),
};

export const pizzaService = {
  getAll: (params) => api.get('/pizzas', { params }),
  getFeatured: () => api.get('/pizzas/featured'),
  getById: (id) => api.get(`/pizzas/${id}`),
  create: (data) => api.post('/pizzas', data),
  update: (id, data) => api.patch(`/pizzas/${id}`, data),
  delete: (id) => api.delete(`/pizzas/${id}`),
};

export const orderService = {
  create: (data) => api.post('/orders', data),
  getMyOrders: (params) => api.get('/orders/my-orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  validateCart: (data) => api.post('/orders/validate-cart', data),
};

export const paymentService = {
  createOrder: (data) => api.post('/payments/create-order', data),
  verify: (data) => api.post('/payments/verify', data),
};

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getOrders: (params) => api.get('/admin/orders', { params }),
  getOrderDetail: (id) => api.get(`/admin/orders/${id}`),
  updateOrderStatus: (id, data) => api.patch(`/admin/orders/${id}/status`, data),
  getCustomers: (params) => api.get('/admin/customers', { params }),
};

