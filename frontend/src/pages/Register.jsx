import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register as apiRegister, login, getMe } from '../api';
import { User, Mail, Lock, Phone, GraduationCap } from 'lucide-react';

export default function Register() {
  const [form, setForm]       = useState({ name: '', email: '', phone: '', password: '', college: '', gender: 'other', car_model: '', car_number: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const { loginUser }         = useAuth();
  const navigate              = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await apiRegister(form);
      const res   = await login(form.email, form.password);
      const token = res.data.access_token;
      localStorage.setItem('token', token);
      const meRes = await getMe();
      loginUser(token, meRes.data);
      navigate('/find');
    } catch (err) {
      setError(err?.response?.data?.detail || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: 540 }}>
        <div className="auth-logo">
          <div style={{ fontSize: '2.5rem' }}>🚗</div>
        </div>
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-sub">Start sharing rides and saving money</p>

        <form className="auth-form" onSubmit={submit}>
          {error && (
            <div style={{ background: 'rgba(255,79,110,0.1)', border: '1px solid rgba(255,79,110,0.3)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', color: 'var(--danger)', fontSize: '0.875rem', marginBottom: 20 }}>
              {error}
            </div>
          )}

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input id="reg-name" name="name" className="form-input" style={{ paddingLeft: 38 }} placeholder="Rahul Sharma" value={form.name} onChange={handle} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input id="reg-phone" name="phone" className="form-input" style={{ paddingLeft: 38 }} placeholder="+91 9876543210" value={form.phone} onChange={handle} required />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input id="reg-email" name="email" type="email" className="form-input" style={{ paddingLeft: 38 }} placeholder="you@example.com" value={form.email} onChange={handle} required />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">College / Workplace</label>
              <div style={{ position: 'relative' }}>
                <GraduationCap size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input id="reg-college" name="college" className="form-input" style={{ paddingLeft: 38 }} placeholder="KIET Group of Institutions" value={form.college} onChange={handle} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Gender</label>
              <select id="reg-gender" name="gender" className="form-input form-select" value={form.gender} onChange={handle}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other / Prefer not to say</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: 12, padding: 16, background: 'var(--bg-muted)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: '0.8125rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>Vehicle Details (If you plan to offer rides)</div>
            <div className="grid-2">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Car Model</label>
                <input id="reg-car-model" name="car_model" className="form-input" placeholder="E.g. Maruti Swift" value={form.car_model} onChange={handle} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Number Plate</label>
                <input id="reg-car-number" name="car_number" className="form-input" placeholder="E.g. DL-01-AB-1234" value={form.car_number} onChange={handle} />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input id="reg-password" name="password" type="password" className="form-input" style={{ paddingLeft: 38 }} placeholder="Min. 6 characters" value={form.password} onChange={handle} required />
            </div>
          </div>

          <button id="reg-submit" className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
            {loading ? <><div className="spin" /> Creating account…</> : 'Create Account 🚗'}
          </button>
        </form>

        <div className="auth-divider" style={{ marginTop: 24 }}>
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
