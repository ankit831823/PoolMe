import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, Search, PlusCircle, List, User, LogOut, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate          = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container">
        {/* Brand */}
        <NavLink to="/" className="nav-brand" style={{ textDecoration: 'none' }}>
          <div className="nav-brand-icon">🚗</div>
          <div className="nav-brand-text">
            Pool<span>Me</span>
          </div>
        </NavLink>

        {/* Center links */}
        {user && (
          <div className="nav-links">
            <NavLink to="/find"     className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <Search size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
              Find Ride
            </NavLink>
            <NavLink to="/offer"    className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <PlusCircle size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
              Offer Ride
            </NavLink>
            <NavLink to="/my-rides" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <List size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
              My Rides
            </NavLink>
          </div>
        )}

        {/* Right actions */}
        <div className="nav-actions">
          {user ? (
            <>
              <NavLink to="/profile" style={{ textDecoration: 'none' }}>
                <div className="nav-avatar" title={user.name}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </NavLink>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout} id="logout-btn">
                <LogOut size={14} /> Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">
                <button className="btn btn-ghost btn-sm" id="nav-login-btn">Login</button>
              </NavLink>
              <NavLink to="/register">
                <button className="btn btn-primary btn-sm" id="nav-register-btn">Sign Up</button>
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
