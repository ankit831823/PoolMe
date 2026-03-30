import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auth ──────────────────────────────────────────────────
export const register = (data) => API.post('/api/auth/register', data);
export const login = (email, password) => {
  const form = new URLSearchParams();
  form.append('username', email);
  form.append('password', password);
  return API.post('/api/auth/login', form);
};
export const getMe = () => API.get('/api/auth/me');

// ── Rides ─────────────────────────────────────────────────
export const getRides = () => API.get('/api/rides/');
export const getMyRides = () => API.get('/api/rides/my');
export const createRide = (data) => API.post('/api/rides/', data);
export const joinRide = (id) => API.post(`/api/rides/${id}/join`);
export const cancelRide = (id) => API.delete(`/api/rides/${id}/cancel`);

// ── Matching ───────────────────────────────────────────────
export const findMatches = (params) => API.get('/api/match/', { params });

// ── Chat ──────────────────────────────────────────────────
export const getMessages = (rideId) => API.get(`/api/chat/${rideId}`);
export const getMyChatMessages = () => API.get('/api/chat/my');
export const sendMessage = (rideId, content) =>
  API.post(`/api/chat/${rideId}`, { content });

export default API;
