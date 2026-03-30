import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Clock, MapPin, Users, IndianRupee, Navigation, MessageSquare, Map as MapIcon } from 'lucide-react';
import ChatModal from './ChatModal';
import MapModal from './MapModal';
import { useAuth } from '../context/AuthContext';

function fmtDate(dt) {
  return new Date(dt).toLocaleString('en-IN', {
    day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function RideCard({ ride, matchScore, detourKm, reason, onJoin, showJoin = true }) {
  const navigate = useNavigate();
  const { user }  = useAuth();
  const driver   = ride.driver;
  const pct      = matchScore ? Math.round(matchScore) : null;
  const [chatOpen, setChatOpen] = useState(false);
  const [mapOpen, setMapOpen]   = useState(false);

  // Check if current user is part of this ride
  const isDriver    = user?.id === ride.driver_id;
  const isPassenger = ride.passenger_list?.some(p => p.id === user?.id);
  const canChat     = !!user; // Any logged in user can message to inquire

  return (
    <div className="ride-card">
      {chatOpen && <ChatModal ride={ride} onClose={() => setChatOpen(false)} />}
      {mapOpen && <MapModal ride={ride} onClose={() => setMapOpen(false)} />}
      
      {/* Header */}
      <div className="ride-card-header">
        <div className="ride-driver">
          <div className="ride-avatar">
            {driver?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <div className="ride-driver-name">{driver?.name}</div>
            <div className="ride-driver-rating">
              <Star size={12} fill="currentColor" />
              {driver?.rating?.toFixed(1)} &nbsp;·&nbsp; {driver?.total_rides} rides
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {pct !== null && (
            <span className="ride-badge ride-badge-match">
              {pct}% match
            </span>
          )}
          <span className="ride-badge ride-badge-active">{ride.status}</span>
        </div>
      </div>

      {/* Route */}
      <div className="ride-route" style={{ flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="ride-route-dot origin" />
          <div>
            <div className="ride-route-place">{ride.origin}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 10, display: 'flex', justifyContent: 'center' }}>
            <div className="ride-route-line" />
          </div>
          <div className="text-xs text-muted">{ride.distance_km} km</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="ride-route-dot dest" />
          <div>
            <div className="ride-route-place">{ride.destination}</div>
          </div>
        </div>
      </div>

      {/* Meta */}
      <div className="ride-meta" style={{ marginTop: 14 }}>
        <div className="ride-meta-item">
          <Clock size={14} />
          {fmtDate(ride.departure_time)}
        </div>
        <div className="ride-meta-item">
          <Users size={14} />
          <strong>{ride.seats_available}</strong> seats left
        </div>
        <div className="ride-meta-item">
          <IndianRupee size={14} />
          <span className="ride-price">₹{ride.price_per_seat}</span>
          <span className="text-muted text-xs">/seat</span>
        </div>
      </div>

      {/* AI Match Reason */}
      {reason && (
        <div style={{ marginTop: 12, fontSize: '0.8125rem', color: 'var(--accent)' }}>
          <Navigation size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
          {reason}
          {detourKm > 0 && <span className="text-muted"> · +{detourKm} km detour</span>}
        </div>
      )}

      {/* Driver Vehicle Details (for passengers) */}
      {isPassenger && (ride.driver?.car_model || ride.driver?.car_number) && (
        <div style={{ marginTop: 12, padding: 12, background: 'var(--bg-muted)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Vehicle Details</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 600 }}>{ride.driver.car_model || 'Unknown Model'}</div>
            <div className="ride-badge ride-badge-match" style={{ background: 'var(--text)', color: 'white', borderRadius: 4 }}>{ride.driver.car_number || 'N/A'}</div>
          </div>
        </div>
      )}

      {/* Passenger List (for drivers) */}
      {isDriver && ride.passenger_list && ride.passenger_list.length > 0 && (
        <div style={{ marginTop: 12, padding: 12, background: 'var(--bg-muted)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Booked Passengers ({ride.passenger_list.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ride.passenger_list.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem' }}>
                <div className="ride-avatar" style={{ width: 24, height: 24, fontSize: '0.75rem' }}>{p.name.charAt(0)}</div>
                <div style={{ flex: 1, fontWeight: 500 }}>{p.name}</div>
                <div className="text-muted text-xs">{p.gender}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Match score bar */}
      {pct !== null && (
        <div className="match-score-bar">
          <div className="match-score-fill" style={{ width: `${pct}%` }} />
        </div>
      )}

      {/* Action */}
      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 12, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={(e) => { e.stopPropagation(); setMapOpen(true); }}
          style={{ borderRadius: 99, padding: '8px 16px', flex: 1, border: '1px solid var(--border-accent)', color: 'var(--accent)' }}
        >
          <MapIcon size={14} /> Track
        </button>

        {canChat && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={(e) => { e.stopPropagation(); setChatOpen(true); }}
            style={{ borderRadius: 99, padding: '8px 16px', flex: 1 }}
          >
            <MessageSquare size={14} /> {isDriver ? 'Broadcast' : 'Ask'}
          </button>
        )}

        {(showJoin && !isDriver && !isPassenger) && (
          <button
            className="btn btn-primary btn-sm"
            id={`join-ride-${ride.id}`}
            onClick={(e) => { e.stopPropagation(); onJoin && onJoin(ride.id); }}
            style={{ borderRadius: 99, padding: '8px 20px' }}
          >
            Book Seat
          </button>
        )}

        {isDriver && ride.status === 'active' && (
          <button
            className="btn btn-danger btn-sm"
            onClick={(e) => { e.stopPropagation(); navigate('/my-rides'); }}
            style={{ borderRadius: 99, opacity: 0.8 }}
          >
            Manage Ride
          </button>
        )}
      </div>
    </div>
  );
}
