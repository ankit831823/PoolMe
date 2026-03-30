import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login, getMe } from '../api';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const { loginUser }         = useAuth();
  const navigate              = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res  = await login(form.email, form.password);
      const token = res.data.access_token;
      
      // 1. Save token FIRST (crucial!)
      localStorage.setItem('token', token);
      
      // 2. Fetch user details (will use the saved token via interceptor)
      const meRes = await getMe();
      loginUser(token, meRes.data);
      navigate('/find');
    } catch (err) {
      setError(err?.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">
          <div style={{ fontSize: '2.5rem' }}>🚗</div>
        </div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to find your next co-traveler</p>

        <form className="auth-form" onSubmit={submit}>
          {error && (
            <div style={{
              background: 'rgba(255,79,110,0.1)', border: '1px solid rgba(255,79,110,0.3)',
              borderRadius: 'var(--radius-sm)', padding: '12px 16px',
              color: 'var(--danger)', fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                id="login-email"
                name="email"
                type="email"
                className="form-input"
                style={{ paddingLeft: 42 }}
                placeholder="you@example.com"
                value={form.email}
                onChange={handle}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                id="login-password"
                name="password"
                type={showPw ? 'text' : 'password'}
                className="form-input"
                style={{ paddingLeft: 42, paddingRight: 42 }}
                placeholder="Your password"
                value={form.password}
                onChange={handle}
                required
              />
              <button
                type="button"
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
                onClick={() => setShowPw(!showPw)}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button id="login-submit" className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
            {loading ? <><div className="spin" /> Signing in…</> : 'Sign In'}
          </button>
        </form>

        <div className="auth-divider" style={{ marginTop: 24 }}>
          Don't have an account? <Link to="/register" className="auth-link">Sign up free</Link>
        </div>

        {/* Demo hint */}
        <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--bg-3)', borderRadius: 'var(--radius-sm)', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          💡 <strong>Demo:</strong> Register first, then log in with your credentials.
        </div>
      </div>
    </div>
  );
}
