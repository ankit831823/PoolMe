import React, { useState, useEffect } from 'react';
import { X, Navigation, Map as MapIcon, RotateCcw } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet markers missing in Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom Icons for Source, Dest, and the Car
const IconStart = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3004/3004494.png', // Circle dot
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

const IconEnd = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1483/1483336.png', // Checkered flag
  iconSize: [32, 32],
  iconAnchor: [5, 30],
});

// Create a dynamic icon generator to encapsulate the rotation state safely
const getCarIcon = (bearing) => {
  return new L.DivIcon({
    className: 'clear-car-wrapper', 
    html: `<img src="/real_car_marker.png" style="width: 42px; height: 85px; transform: rotate(${bearing}deg); transition: transform 0.3s ease;" class="live-car-img" />`,
    iconSize: [42, 85],
    iconAnchor: [21, 42],
  });
};

// Component that dynamically pans the map to follow the car at street level
function MapUpdater({ currentPos, isSimulating }) {
  const map = useMap();
  
  useEffect(() => {
    if (isSimulating && currentPos) {
      // Zoom into street-level (16) and softly track the fast-moving vehicle
      map.flyTo(currentPos, 16, { animate: true, duration: 0.4 });
    }
  }, [currentPos, isSimulating, map]);

  return null;
}

export default function MapModal({ ride, onClose }) {
  const [routePath, setRoutePath] = useState([]);
  const [carIndex, setCarIndex] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simInterval, setSimInterval] = useState(null);
  const [bearing, setBearing] = useState(0);
  
  // Real GPS State
  const [liveGpsPos, setLiveGpsPos] = useState(null);
  const [isTrackingGps, setIsTrackingGps] = useState(false);
  const [watchId, setWatchId] = useState(null);

  // Helper to calculate angle between two coordinates
  const getBearing = (start, end) => {
    const lat1 = start[0] * Math.PI / 180;
    const lon1 = start[1] * Math.PI / 180;
    const lat2 = end[0] * Math.PI / 180;
    const lon2 = end[1] * Math.PI / 180;
    
    const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
    const brng = Math.atan2(y, x) * 180 / Math.PI;
    return (brng + 360) % 360;
  };

  // 1. Fetch real road polyline from OSRM
  useEffect(() => {
    let mounted = true;
    const fetchRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${ride.origin_lng},${ride.origin_lat};${ride.dest_lng},${ride.dest_lat}?geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (data && data.routes && data.routes.length > 0) {
          const coords = data.routes[0].geometry.coordinates;
          // OSRM returns [lng, lat], Leaflet wants [lat, lng]
          const latLngs = coords.map(c => [c[1], c[0]]);
          if (mounted) {
            setRoutePath(latLngs);
            setCarIndex(0);
          }
        }
      } catch (err) {
        console.error('Failed to fetch route:', err);
      }
    };
    fetchRoute();
    return () => { mounted = false; };
  }, [ride]);

  // 2. Animate the Car along the Polyline
  const startSimulation = () => {
    if (routePath.length === 0) return;
    if (simInterval) clearInterval(simInterval);
    
    setCarIndex(0);
    setIsSimulating(true);

    const stepMs = Math.max(50, Math.floor(10000 / routePath.length)); // Try to finish in ~10 seconds

    const timer = setInterval(() => {
      setCarIndex(prev => {
        if (prev >= routePath.length - 2) {
          clearInterval(timer);
          setIsSimulating(false);
          return routePath.length - 1; // End reached
        }
        
        // Update vehicle rotation angle based on next point
        const current = routePath[prev];
        const next = routePath[prev + 1];
        setBearing(getBearing(current, next));
        
        return prev + 1;
      });
    }, stepMs);

    setSimInterval(timer);
  };

  // 3. Physical GPS Tracking (When the user physically moves)
  const toggleGpsTracking = () => {
    if (isTrackingGps) {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      setIsTrackingGps(false);
      setLiveGpsPos(null);
      setWatchId(null);
    } else {
      if (!('geolocation' in navigator)) {
        alert("Your device doesn't support GPS tracking.");
        return;
      }
      setIsTrackingGps(true);
      if (simInterval) clearInterval(simInterval);
      setIsSimulating(false);

      const id = navigator.geolocation.watchPosition(
        (pos) => {
          const newPos = [pos.coords.latitude, pos.coords.longitude];
          setLiveGpsPos(prev => {
            if (prev) {
              // Ensure the car physically rotates towards the new geographic step
              setBearing(getBearing(prev, newPos));
            }
            return newPos;
          });
        },
        (err) => {
          console.error("GPS Error:", err);
          let msg = "Could not get a live GPS lock.";
          if (err.code === 1) msg = "GPS Permission Denied. Please allow location access in your browser settings.";
          else if (err.code === 2) msg = "Location unavailable. Ensure your device has GPS enabled.";
          else if (err.code === 3) msg = "GPS connection timed out. (Desktop PCs often struggle to get a hardware location lock).";
          alert(msg);
          
          // Reset tracking state fully
          setIsTrackingGps(false);
          setWatchId(null);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
      );
      setWatchId(id);
    }
  };

  useEffect(() => {
    return () => simInterval && clearInterval(simInterval);
  }, [simInterval]);

  useEffect(() => {
    return () => watchId !== null && navigator.geolocation.clearWatch(watchId);
  }, [watchId]);

  const origin     = [ride.origin_lat, ride.origin_lng];
  const dest       = [ride.dest_lat, ride.dest_lng];
  const bounds     = L.latLngBounds(origin, dest);
  const currentPos = liveGpsPos ? liveGpsPos : (routePath.length > 0 ? routePath[carIndex] : origin);

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${ride.origin_lat},${ride.origin_lng}&destination=${ride.dest_lat},${ride.dest_lng}`;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ padding: 0, height: 500, display: 'flex', flexDirection: 'column', width: '90%', maxWidth: 650, overflow: 'hidden' }}>
        
        <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapIcon size={18} color="var(--primary)" /> 
            Live Ride Tracking
          </h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div style={{ flex: 1, position: 'relative' }}>
          <MapContainer 
            bounds={bounds} 
            boundsOptions={{ padding: [50, 50] }} 
            style={{ width: '100%', height: '100%', zIndex: 1 }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            
            <MapUpdater currentPos={currentPos} isSimulating={isSimulating} />
            
            {/* Draw the Real Road Line */}
            {routePath.length > 0 && (
              <Polyline positions={routePath} pathOptions={{ color: 'var(--primary)', weight: 5, opacity: 0.8 }} />
            )}

            {/* Static Start/End Markers */}
            <Marker position={origin} icon={IconStart} />
            <Marker position={dest} icon={IconEnd} />

            {/* Driving Car Marker (Zomato Style) */}
            <Marker 
              position={currentPos} 
              icon={getCarIcon(bearing)} 
              zIndexOffset={100}
            />
          </MapContainer>
          
          <div style={{ position: 'absolute', top: 10, left: 10, right: 10, display: 'flex', justifyContent: 'space-between', zIndex: 10, pointerEvents: 'none' }}>
            <div className="ride-badge ride-badge-active" style={{ background: 'var(--surface)', color: 'var(--accent)', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              Start: {ride.origin.split(',')[0]}
            </div>
            <div className="ride-badge ride-badge-active" style={{ background: 'var(--primary)', color: 'white', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              End: {ride.destination.split(',')[0]}
            </div>
          </div>
        </div>

        <div style={{ padding: 16, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Real-time GPS Simulator</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>OSRM Route • {routePath.length} vectors</div>
          </div>
          
          <div style={{ display: 'flex', gap: 12 }}>
            <button 
              className={`btn ${isTrackingGps ? 'btn-danger' : 'btn-ghost'} btn-sm`} 
              onClick={toggleGpsTracking}
              style={{ padding: '8px 12px' }}
            >
              {isTrackingGps ? 'Stop Live GPS' : 'Drive (Live GPS)'}
            </button>
            <button 
              className="btn btn-ghost btn-sm" 
              onClick={startSimulation} 
              disabled={routePath.length === 0 || isSimulating || isTrackingGps}
              style={{ padding: '8px 12px' }}
            >
              <RotateCcw size={14} className={isSimulating ? "spin" : ""} /> Demo
            </button>
            <a href={googleMapsUrl} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm" style={{ textDecoration: 'none', padding: '8px 12px' }}>
              <Navigation size={14} /> Maps App
            </a>
          </div>
        </div>
      </div>

      <style>{`
        /* Remove leaflet's default styling from DivIcon wrappers */
        .clear-car-wrapper {
          background: transparent !important;
          border: none !important;
        }
        
        /* The inner image handles the rotation transition safely */
        .live-car-img {
          transform-origin: center center;
          filter: drop-shadow(0px 8px 12px rgba(0,0,0,0.5));
        }
      `}</style>
    </div>
  );
}
