import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Star, Car, Shield, GraduationCap, Phone, Mail, LogOut } from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate          = useNavigate();

  if (!user) return null;

  const initial = user.name.charAt(0).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={{ paddingBottom: 60 }}>
      <div className="container" style={{ maxWidth: 760 }}>
        <div className="page-header">
          <h1 className="page-title">👤 Profile</h1>
          <p className="page-sub">Your PoolMe identity and travel stats</p>
        </div>

        {/* Avatar + Name */}
        <div className="profile-header">
          <div className="profile-avatar-lg">{initial}</div>
          <div style={{ flex: 1 }}>
            <div className="profile-name">{user.name}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginTop: 4 }}>
              {user.college && <><GraduationCap size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />{user.college} &nbsp;·&nbsp;</>}
              {user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
              {user.is_verified && (
                <span className="chip chip-purple">
                  <Shield size={11} /> Verified
                </span>
              )}
              <span className="chip">
                <Star size={11} fill="currentColor" style={{ color: 'var(--warning)' }} />
                {user.rating.toFixed(1)} Rating
              </span>
              <span className="chip">
                <Car size={11} /> {user.total_rides} rides
              </span>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" id="profile-logout" onClick={handleLogout}>
            <LogOut size={14} /> Logout
          </button>
        </div>

        {/* Stats */}
        <div className="profile-stats">
          <div className="profile-stat-card">
            <div className="profile-stat-val">{user.total_rides}</div>
            <div className="profile-stat-lbl">Total Rides</div>
          </div>
          <div className="profile-stat-card">
            <div className="profile-stat-val">{user.rating.toFixed(1)}⭐</div>
            <div className="profile-stat-lbl">Rating</div>
          </div>
          <div className="profile-stat-card">
            <div className="profile-stat-val">{user.is_verified ? '✅' : '❌'}</div>
            <div className="profile-stat-lbl">Verified</div>
          </div>
        </div>

        {/* Details */}
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 20, fontSize: '1rem' }}>📋 Account Details</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { icon: <Mail size={16} />, label: 'Email', value: user.email },
              { icon: <Phone size={16} />, label: 'Phone', value: user.phone },
              { icon: <GraduationCap size={16} />, label: 'College / Workplace', value: user.college || '—' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--primary)', flexShrink: 0 }}>{item.icon}</div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontWeight: 600 }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Section */}
        <div className="card" style={{ marginTop: 20, borderColor: 'rgba(0,212,170,0.3)' }}>
          <div style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={16} style={{ color: 'var(--accent)' }} /> Safety Features
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { emoji: '📍', title: 'Live Location', desc: 'Share during trips' },
              { emoji: '🆘', title: 'SOS Button', desc: 'Emergency contact alert' },
              { emoji: '📞', title: 'Masked Calls', desc: 'Private phone numbers' },
              { emoji: '🛡️', title: 'Trip Tracking', desc: 'Real-time monitoring' },
            ].map(f => (
              <div key={f.title} style={{ background: 'var(--bg-3)', borderRadius: 'var(--radius-sm)', padding: '14px 16px' }}>
                <div style={{ fontSize: '1.25rem', marginBottom: 6 }}>{f.emoji}</div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{f.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 3 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <button className="btn btn-danger" id="profile-logout-bottom" onClick={handleLogout}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
