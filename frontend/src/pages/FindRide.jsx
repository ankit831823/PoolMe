import React, { useState, useEffect } from 'react';
import { getRides, findMatches, joinRide } from '../api';
import RideCard from '../components/RideCard';
import { Search, MapPin, Clock, SlidersHorizontal } from 'lucide-react';

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

export default function FindRide() {
  const [allRides, setAllRides]   = useState([]);
  const [matches, setMatches]     = useState(null);   // null = not searched yet
  const [loading, setLoading]     = useState(true);
  const [searching, setSearching] = useState(false);
  const [toast, setToast]         = useState('');

  const [search, setSearch] = useState({
    origin: '', destination: '',
    travel_time: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
  });

  /* Load all active rides */
  useEffect(() => {
    getRides()
      .then(r => setAllRides(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearching(true);
    const oGeo = await geoFor(search.origin);
    const dGeo = await geoFor(search.destination);
    
    if (!oGeo || !dGeo) {
      showToast('⚠️ Could not find exact locations. Try formatting like "City, State"');
      setSearching(false);
      return;
    }
    
    try {
      const res = await findMatches({
        origin_lat:  oGeo[0], origin_lng:  oGeo[1],
        dest_lat:    dGeo[0], dest_lng:    dGeo[1],
        travel_time: new Date(search.travel_time).toISOString(),
      });
      setMatches(res.data);
    } catch {
      showToast('❌ Could not fetch matches. Is the backend running?');
    } finally {
      setSearching(false);
    }
  };

  const handleJoin = async (id) => {
    try {
      const res = await joinRide(id);
      showToast(`✅ Seat booked! Cost: ₹${res.data.cost}`);
      // refresh
      getRides().then(r => setAllRides(r.data));
      if (matches) {
        setSearching(true); // show loader during refresh query
        const oGeo = await geoFor(search.origin);
        const dGeo = await geoFor(search.destination);
        if (oGeo && dGeo) {
          const res2 = await findMatches({ origin_lat: oGeo[0], origin_lng: oGeo[1], dest_lat: dGeo[0], dest_lng: dGeo[1], travel_time: new Date(search.travel_time).toISOString() });
          setMatches(res2.data);
        }
        setSearching(false);
      }
    } catch (err) {
      showToast('❌ ' + (err?.response?.data?.detail || 'Could not join ride'));
    }
  };

  const displayRides = matches !== null ? matches : allRides.map(r => ({ ride: r }));

  return (
    <div style={{ padding: '0 0 60px' }}>
      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.startsWith('✅') ? 'toast-success' : toast.startsWith('❌') ? 'toast-error' : 'toast-info'}`}>
            {toast}
          </div>
        </div>
      )}

      <div className="container">
        <div className="page-header">
          <h1 className="page-title">🔍 Find a Ride</h1>
          <p className="page-sub">AI matches you with the best co-travelers on your route</p>
        </div>

        {/* Search box */}
        <form className="search-box" onSubmit={handleSearch}>
          <div className="form-group">
            <label className="form-label"><MapPin size={13} /> From</label>
            <input
              id="search-origin"
              className="form-input"
              placeholder="E.g. Hyderabad"
              value={search.origin}
              onChange={e => setSearch({ ...search, origin: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label"><MapPin size={13} /> To</label>
            <input
              id="search-dest"
              className="form-input"
              placeholder="E.g. Bangalore"
              value={search.destination}
              onChange={e => setSearch({ ...search, destination: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label"><Clock size={13} /> When</label>
            <input
              id="search-time"
              type="datetime-local"
              className="form-input"
              value={search.travel_time}
              onChange={e => setSearch({ ...search, travel_time: e.target.value })}
              required
            />
          </div>
          <button id="search-submit" className="btn btn-primary" type="submit" disabled={searching} style={{ height: 46 }}>
            {searching ? <><div className="spin" /> Matching…</> : <><Search size={16} /> Find Matches</>}
          </button>
        </form>

        {/* City chips */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {['Hyderabad', 'Bangalore', 'Delhi', 'Mumbai', 'Chennai', 'Pune'].map(city => (
            <button
              key={city}
              className="chip chip-purple"
              style={{ cursor: 'pointer', border: 'none' }}
              onClick={() => setSearch(s => ({ ...s, origin: city }))}
            >
              {city}
            </button>
          ))}
        </div>

        {/* Results */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <span style={{ fontWeight: 700 }}>
              {matches !== null ? `${matches.length} AI Matches` : `${allRides.length} Available Rides`}
            </span>
            {matches !== null && (
              <button className="btn btn-ghost btn-sm" style={{ marginLeft: 12 }} onClick={() => setMatches(null)}>
                Show All
              </button>
            )}
          </div>
          <div className="text-muted text-sm">
            <SlidersHorizontal size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
            Sorted by best match
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : displayRides.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🚗</div>
            <div className="empty-state-title">No rides found</div>
            <div className="empty-state-text">Be the first to offer a ride on this route!</div>
          </div>
        ) : (
          <div className="rides-list">
            {displayRides.map((item, i) => {
              const ride   = item.ride || item;
              const score  = item.match_score;
              const detour = item.detour_km;
              const reason = item.reason;
              return (
                <RideCard
                  key={ride.id || i}
                  ride={ride}
                  matchScore={score}
                  detourKm={detour}
                  reason={reason}
                  onJoin={handleJoin}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
