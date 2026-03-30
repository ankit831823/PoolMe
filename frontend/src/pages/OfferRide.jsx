import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRide } from '../api';
import { MapPin, Clock, Users, IndianRupee, Zap, ChevronRight } from 'lucide-react';

/* Live geocoding for all India locations */
async function geoFor(city) {
  const c = city.trim();
  if (!c) return null;
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(c)},India&format=json&limit=1`);
    const data = await res.json();
    if (data && data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
  } catch (err) {
    console.error('Geocoding error:', err);
  }
  return null;
}

export default function OfferRide() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    origin: '', destination: '',
    departure_time: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
    seats_available: 3,
    auto_price: true,
    price_per_seat: '',
    preferences: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(null);

  const handle = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const oGeo = await geoFor(form.origin);
    const dGeo = await geoFor(form.destination);
    
    if (!oGeo) { setError('Could not find location for origin. Try adding the State name.'); setLoading(false); return; }
    if (!dGeo) { setError('Could not find location for destination. Try adding the State name.'); setLoading(false); return; }

    try {
      const payload = {
        origin:          form.origin,
        origin_lat:      oGeo[0],
        origin_lng:      oGeo[1],
        destination:     form.destination,
        dest_lat:        dGeo[0],
        dest_lng:        dGeo[1],
        departure_time:  new Date(form.departure_time).toISOString(),
        seats_available: Number(form.seats_available),
        auto_price:      form.auto_price,
        price_per_seat:  form.auto_price ? null : Number(form.price_per_seat),
        preferences:     form.preferences,
      };
      const res = await createRide(payload);
      setSuccess(res.data);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Could not create ride');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container" style={{ paddingTop: 60, paddingBottom: 60, maxWidth: 560 }}>
        <div style={{ textAlign: 'center', padding: '60px 40px', background: 'var(--surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.75rem', marginBottom: 12 }}>Ride Created!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 8 }}>
            <strong>{success.origin}</strong> → <strong>{success.destination}</strong>
          </p>
          <p style={{ color: 'var(--accent)', fontSize: '1.25rem', fontWeight: 700, marginBottom: 32 }}>
            ₹{success.price_per_seat}/seat · {success.distance_km} km
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-ghost" onClick={() => navigate('/my-rides')}>View My Rides</button>
            <button className="btn btn-primary" onClick={() => { setSuccess(null); setForm({ origin: '', destination: '', departure_time: new Date(Date.now() + 3600000).toISOString().slice(0, 16), seats_available: 3, auto_price: true, price_per_seat: '', preferences: '' }); }}>
              Offer Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 60 }}>
      <div className="container" style={{ maxWidth: 680 }}>
        <div className="page-header">
          <h1 className="page-title">🚗 Offer a Ride</h1>
          <p className="page-sub">Share your journey and split costs with verified co-travelers</p>
        </div>

        <form onSubmit={submit}>
          {error && (
            <div style={{ background: 'rgba(255,79,110,0.1)', border: '1px solid rgba(255,79,110,0.3)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', color: 'var(--danger)', fontSize: '0.875rem', marginBottom: 24 }}>
              {error}
            </div>
          )}

          {/* Route */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <MapPin size={16} style={{ color: 'var(--accent)' }} /> Route Details
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Origin City</label>
                <input id="offer-origin" name="origin" className="form-input" placeholder="E.g. Hyderabad" value={form.origin} onChange={handle} required />
              </div>
              <div className="form-group">
                <label className="form-label">Destination City</label>
                <input id="offer-dest" name="destination" className="form-input" placeholder="E.g. Bangalore" value={form.destination} onChange={handle} required />
              </div>
            </div>

            <div style={{ marginTop: 16 }} className="form-group">
              <label className="form-label"><Clock size={13} /> Departure Time</label>
              <input id="offer-time" name="departure_time" type="datetime-local" className="form-input" value={form.departure_time} onChange={handle} required />
            </div>
          </div>

          {/* Seats & Price */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={16} style={{ color: 'var(--primary)' }} /> Seats & Pricing
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Seats Available</label>
                <select id="offer-seats" name="seats_available" className="form-input form-select" value={form.seats_available} onChange={handle}>
                  {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} seat{n > 1 ? 's' : ''}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Price Per Seat</label>
                {form.auto_price ? (
                  <div className="form-input" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)' }}>
                    <Zap size={14} style={{ color: 'var(--accent)' }} /> Auto-calculated
                  </div>
                ) : (
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>₹</span>
                    <input id="offer-price" name="price_per_seat" type="number" className="form-input" style={{ paddingLeft: 28 }} placeholder="450" value={form.price_per_seat} onChange={handle} />
                  </div>
                )}
              </div>
            </div>
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
              <input id="offer-autoprice" name="auto_price" type="checkbox" checked={form.auto_price} onChange={handle} style={{ accentColor: 'var(--primary)', width: 16, height: 16 }} />
              <label htmlFor="offer-autoprice" style={{ fontSize: '0.875rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <Zap size={12} style={{ marginRight: 4, color: 'var(--accent)', verticalAlign: 'middle' }} />
                Auto-calculate fair price based on distance (₹6/km split by seats)
              </label>
            </div>
          </div>

          {/* Preferences */}
          <div className="card" style={{ marginBottom: 28 }}>
            <div style={{ fontWeight: 700, marginBottom: 16 }}>🎯 Preferences (optional)</div>
            <div className="form-group">
              <label className="form-label">Preferences / Notes</label>
              <input id="offer-pref" name="preferences" className="form-input" placeholder="E.g. No smoking, ladies only, music ok…" value={form.preferences} onChange={handle} />
            </div>
          </div>

          <button id="offer-submit" className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
            {loading ? <><div className="spin" /> Creating Ride…</> : <>Publish Ride <ChevronRight size={18} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
