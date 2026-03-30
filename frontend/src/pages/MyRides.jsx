import React, { useState, useEffect } from 'react';
import { getMyRides, cancelRide } from '../api';
import RideCard from '../components/RideCard';
import { useNavigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';

export default function MyRides() {
  const [rides, setRides]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast]     = useState('');
  const navigate              = useNavigate();

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const load = () => {
    setLoading(true);
    getMyRides()
      .then(r => setRides(r.data))
      .catch(() => showToast('❌ Could not load rides'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this ride?')) return;
    try {
      await cancelRide(id);
      showToast('✅ Ride cancelled');
      load();
    } catch (err) {
      showToast('❌ ' + (err?.response?.data?.detail || 'Could not cancel'));
    }
  };

  // Filter out cancelled rides so they are removed from the UI
  const visibleRides = rides.filter(r => r.status !== 'cancelled');
  const active    = visibleRides.filter(r => r.status === 'active');
  const completed = visibleRides.filter(r => r.status !== 'active');

  return (
    <div style={{ paddingBottom: 60 }}>
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.startsWith('✅') ? 'toast-success' : 'toast-error'}`}>{toast}</div>
        </div>
      )}

      <div className="container">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 className="page-title">🗂 My Rides</h1>
            <p className="page-sub">All rides you've offered as a driver</p>
          </div>
          <button className="btn btn-primary" id="offer-new-ride" onClick={() => navigate('/offer')}>
            <PlusCircle size={16} /> Offer New Ride
          </button>
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : rides.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🚗</div>
            <div className="empty-state-title">No rides yet</div>
            <div className="empty-state-text">Offer your first ride and start earning!</div>
            <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => navigate('/offer')}>
              Offer a Ride
            </button>
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16, color: 'var(--accent)' }}>
                  ✅ Active ({active.length})
                </div>
                <div className="rides-list" style={{ marginBottom: 32 }}>
                   {active.map(r => (
                    <div key={r.id} className="ride-manage-wrapper" style={{ position: 'relative', marginBottom: 20 }}>
                      <RideCard ride={r} showJoin={false} />
                      <div style={{ padding: '0 24px 20px', background: 'var(--surface)', marginTop: -15, border: '1px solid var(--border)', borderTop: 'none', borderBottomLeftRadius: 'var(--radius-lg)', borderBottomRightRadius: 'var(--radius-lg)', display: 'flex', gap: 12 }}>
                        <button className="btn btn-danger btn-full btn-sm" id={`cancel-ride-${r.id}`} onClick={() => handleCancel(r.id)} style={{ padding: '12px', background: 'rgba(255,79,110,0.1)', color: 'var(--danger)', border: '1px solid rgba(255,79,110,0.2)' }}>
                          Cancel Journey
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {completed.length > 0 && (
              <>
                <hr className="section-divider" />
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16, color: 'var(--text-muted)' }}>
                  🏁 Past Rides ({completed.length})
                </div>
                <div className="rides-list" style={{ opacity: 0.65 }}>
                  {completed.map(r => <RideCard key={r.id} ride={r} showJoin={false} />)}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
