import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Shield, Brain, MapPin, Star, ChevronRight, Car, Users, IndianRupee } from 'lucide-react';

const FEATURES = [
  { icon: '🤖', color: 'rgba(108,99,255,0.15)', title: 'AI Route Matching', desc: 'Smart algorithm matches you with co-travelers on overlapping routes — not just exact matches.' },
  { icon: '🔒', color: 'rgba(0,212,170,0.15)',  title: 'Safety Layer', desc: 'Verified profiles, live trip tracking, and emergency SOS button for peace of mind.' },
  { icon: '💸', color: 'rgba(255,184,0,0.15)',   title: 'Auto Cost Split', desc: 'Fuel costs calculated and split fairly based on distance and number of passengers.' },
  { icon: '📊', color: 'rgba(255,79,110,0.15)',  title: 'Demand Prediction', desc: 'See high-demand routes and best travel times based on real user data.' },
  { icon: '💬', color: 'rgba(108,99,255,0.15)',  title: 'In-App Chat', desc: 'Coordinate with co-travelers safely before sharing your ride details.' },
  { icon: '🎓', color: 'rgba(0,212,170,0.15)',   title: 'College Mode', desc: 'Built for students — filter rides by college, verify with student email.' },
];

const HOW = [
  { n: '01', title: 'Create Profile', desc: 'Verify with phone OTP and build your trusted travel profile.' },
  { n: '02', title: 'Search or Offer', desc: 'Enter your origin, destination and travel time.' },
  { n: '03', title: 'AI Matches You', desc: 'Our engine ranks the best co-travelers for your route.' },
  { n: '04', title: 'Travel & Save', desc: 'Chat, confirm, and split the cost automatically.' },
];

export default function Landing() {
  const navigate = useNavigate();
  const { user }  = useAuth();

  return (
    <>
      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grid-lines" />

        <div className="container" style={{ width: '100%' }}>
          <div className="hero-content">
            <div className="hero-badge">
              <span className="dot" />
              Smart Travel Matchmaking for India
            </div>

            <h1 className="hero-title">
              Find Your Perfect<br />
              <span className="gradient-text">Co-Traveler</span> Today
            </h1>

            <p className="hero-sub">
              PoolMe uses AI to match you with people going the same way —
              save money, reduce traffic, and travel safer with verified co-travelers.
            </p>

            <div className="hero-actions">
              <button
                className="btn btn-primary btn-lg"
                id="hero-get-started"
                onClick={() => navigate(user ? '/find' : '/register')}
              >
                Get Started Free <ChevronRight size={18} />
              </button>
              <button
                className="btn btn-ghost btn-lg"
                id="hero-offer-ride"
                onClick={() => navigate(user ? '/offer' : '/login')}
              >
                <Car size={18} /> Offer a Ride
              </button>
            </div>

            <div className="hero-stats">
              <div>
                <div className="hero-stat-value">10K+</div>
                <div className="hero-stat-label">Active Travelers</div>
              </div>
              <div>
                <div className="hero-stat-value">₹3.2L</div>
                <div className="hero-stat-label">Saved in Fuel Costs</div>
              </div>
              <div>
                <div className="hero-stat-value">4.9★</div>
                <div className="hero-stat-label">Average Rating</div>
              </div>
            </div>
          </div>

          {/* Floating preview cards */}
          <div className="hero-float">
            <div className="hero-float-card">
              <div className="hero-float-icon purple">🤖</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>AI Match Found!</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hyderabad → Bangalore · 94% match</div>
              </div>
            </div>
            <div className="hero-float-card" style={{ marginLeft: 32 }}>
              <div className="hero-float-icon teal">💸</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Cost Split: ₹450</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Saved ₹900 vs solo travel</div>
              </div>
            </div>
            <div className="hero-float-card">
              <div className="hero-float-icon orange">🔒</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Verified Driver</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>⭐ 4.9 · 47 rides completed</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="section" style={{ background: 'var(--bg-2)' }}>
        <div className="container">
          <div className="section-tag">Why PoolMe</div>
          <h2 className="section-title">Built Different, <span style={{ background: 'linear-gradient(135deg,var(--primary),var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Built Better</span></h2>
          <p className="section-sub">Not just another carpool app. We're rethinking the way India shares rides.</p>

          <div className="features-grid">
            {FEATURES.map(f => (
              <div className="feature-card" key={f.title}>
                <div className="feature-icon" style={{ background: f.color }}>{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section">
        <div className="container">
          <div className="section-tag">How It Works</div>
          <h2 className="section-title">Up and running in <span style={{ color: 'var(--accent)' }}>4 steps</span></h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 24, marginTop: 40 }}>
            {HOW.map(h => (
              <div key={h.n} style={{ position: 'relative' }}>
                <div style={{
                  fontSize: '3rem', fontWeight: 900, fontFamily: 'Outfit,sans-serif',
                  background: 'linear-gradient(135deg,var(--primary),var(--accent))',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  marginBottom: 12, lineHeight: 1
                }}>{h.n}</div>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 8 }}>{h.title}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>{h.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section" style={{ background: 'var(--bg-2)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(0,212,170,0.1))',
            border: '1px solid var(--border-accent)',
            borderRadius: 'var(--radius-xl)',
            padding: '64px 40px',
          }}>
            <h2 className="section-title">Ready to Share Your Next Ride?</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: '1.0625rem' }}>
              Join thousands of smart travelers already saving money with PoolMe.
            </p>
            <button
              className="btn btn-primary btn-lg"
              id="cta-join-now"
              onClick={() => navigate(user ? '/find' : '/register')}
            >
              Join PoolMe Free <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '32px 0', background: 'var(--bg)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.25rem' }}>
            Pool<span style={{ background: 'linear-gradient(135deg,var(--primary),var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Me</span>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            © 2024 PoolMe · Smart Travel Matchmaking for India
          </div>
        </div>
      </footer>
    </>
  );
}
