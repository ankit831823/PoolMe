import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import FindRide from './pages/FindRide';
import OfferRide from './pages/OfferRide';
import MyRides from './pages/MyRides';
import Profile from './pages/Profile';
import MessageNotifier from './components/MessageNotifier';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="loading-spinner">
      <div className="spinner" />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { user } = useAuth();

  return (
    <div className="app-shell">
      <MessageNotifier />
      <Navbar />
      <div className="page-wrapper">
        <Routes>
          <Route path="/"          element={<Landing />} />
          <Route path="/login"     element={user ? <Navigate to="/find" /> : <Login />} />
          <Route path="/register"  element={user ? <Navigate to="/find" /> : <Register />} />
          <Route path="/find"      element={<PrivateRoute><FindRide /></PrivateRoute>} />
          <Route path="/offer"     element={<PrivateRoute><OfferRide /></PrivateRoute>} />
          <Route path="/my-rides"  element={<PrivateRoute><MyRides /></PrivateRoute>} />
          <Route path="/profile"   element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="*"          element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}
