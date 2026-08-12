import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const FEATURES = [
  { num: '01', title: 'Milestone Chain', desc: 'Each project is broken into a linked sequence of milestones. The next unlocks only after the previous is approved — no skipping, no ghosting.' },
  { num: '02', title: 'Trust Score', desc: 'Every freelancer earns a score based on delivery speed, approval rate, and client feedback. Clients always know who they are hiring.' },
  { num: '03', title: 'Milestone-gated payments', desc: 'Payments are tied to verified milestones. Freelancers get paid fairly. Clients only pay for what is done.' },
  { num: '04', title: 'Real-time visibility', desc: 'Clients track progress step by step. Deadlines are monitored automatically. No more chasing updates.' },
];

const STEPS = [
  { label: 'Post Project', role: 'Client', color: '#6c63ff' },
  { label: 'Freelancer Applies', role: 'Freelancer', color: '#00e5a0' },
  { label: 'Milestone 1 Active', role: 'System', color: '#6c63ff' },
  { label: 'Submit & Approve', role: 'Both', color: '#00e5a0' },
  { label: 'Payment Released', role: 'Client', color: '#6c63ff' },
  { label: 'Next Milestone Unlocks', role: 'System', color: '#00e5a0' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % FEATURES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hp-root">

      {/* Top Banner */}
      <div className="hp-banner">
        Milestone-based freelancing &nbsp;·&nbsp; Trust Score system &nbsp;·&nbsp; Real-time tracking
      </div>

      {/* Navbar */}
      <nav className="hp-nav">
        <div className="hp-logo">FreelanceChain</div>
        <div className="hp-nav-links">
          <span>How it works</span>
          <span>Features</span>
          <span>Leaderboard</span>
        </div>
        <div className="hp-nav-actions">
          <button className="hp-btn-ghost" onClick={() => navigate('/login')}>Login</button>
          <button className="hp-btn-solid" onClick={() => navigate('/login')}>Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hp-hero">
        <div className="hp-hero-eyebrow">Built for accountability</div>
        <h1 className="hp-hero-h1">
          Freelancing that<br />
          <span className="hp-grad">works both ways.</span>
        </h1>
        <p className="hp-hero-sub">
          FreelanceChain ties every payment to a verified milestone.<br />
          Clients stay confident. Freelancers stay accountable.
        </p>
        <div className="hp-hero-cta">
          <button className="hp-btn-solid large" onClick={() => navigate('/login')}>
            Start a project →
          </button>
          <button className="hp-btn-ghost large" onClick={() => navigate('/login')}>
            Join as freelancer
          </button>
        </div>

        {/* Trust badges */}
        <div className="hp-badges">
          {['Milestone-locked payments', 'Live progress tracking', 'Freelancer Trust Score', 'Leaderboard ranking'].map(b => (
            <div className="hp-badge" key={b}>
              <span className="hp-badge-dot"></span>{b}
            </div>
          ))}
        </div>

        {/* Chain preview */}
        <div className="hp-chain-preview">
          {STEPS.map((s, i) => (
            <div className="hp-chain-item" key={i}>
              <div className="hp-chain-node">
                <div className="hp-chain-dot" style={{ background: s.color, boxShadow: `0 0 10px ${s.color}66` }}></div>
                <div className="hp-chain-text">
                  <span className="hp-chain-label">{s.label}</span>
                  <span className="hp-chain-role" style={{ color: s.color }}>{s.role}</span>
                </div>
              </div>
              {i < STEPS.length - 1 && <div className="hp-chain-connector"></div>}
            </div>
          ))}
        </div>
      </section>

      {/* Problem */}
      <section className="hp-problem">
        <div className="hp-problem-inner">
          <div className="hp-section-tag">The problem</div>
          <h2>Freelancers ghost.<br />Clients lose trust.</h2>
          <p>
            Traditional freelancing platforms have no way to stop a freelancer from taking partial payment and disappearing.
            Clients are left with incomplete projects, wasted money, and zero recourse.
          </p>
          <p style={{ marginTop: '16px' }}>
            FreelanceChain solves this with a <strong>milestone chain</strong> — a linked sequence where each step must be
            approved before the next begins and payment is released.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="hp-features">
        <div className="hp-features-left">
          <div className="hp-section-tag">How it works</div>
          <h2>Every feature is built around trust.</h2>
          <div className="hp-feature-tabs">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className={`hp-feature-tab ${activeFeature === i ? 'active' : ''}`}
                onClick={() => setActiveFeature(i)}
              >
                <span className="hp-feature-num">{f.num}</span>
                <span className="hp-feature-title">{f.title}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="hp-features-right">
          <div className="hp-feature-detail">
            <div className="hp-feature-detail-num">{FEATURES[activeFeature].num}</div>
            <h3>{FEATURES[activeFeature].title}</h3>
            <p>{FEATURES[activeFeature].desc}</p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="hp-stats">
        {[
          { val: '100%', label: 'Milestone-locked payments' },
          { val: '0', label: 'Payments before approval' },
          { val: '4', label: 'Roles supported' },
          { val: '∞', label: 'Milestones per project' },
        ].map(s => (
          <div className="hp-stat" key={s.label}>
            <div className="hp-stat-val">{s.val}</div>
            <div className="hp-stat-label">{s.label}</div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="hp-cta-section">
        <div className="hp-cta-inner">
          <h2>Start building trust<br />from milestone one.</h2>
          <div className="hp-cta-btns">
            <button className="hp-btn-solid large" onClick={() => navigate('/login')}>
              I am a Client →
            </button>
            <button className="hp-btn-outline-white large" onClick={() => navigate('/login')}>
              I am a Freelancer
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="hp-footer">
        <div className="hp-footer-logo">FreelanceChain</div>
        <div className="hp-footer-info">
          PES University MCA Project · Mritunjai Kumar · PES1PG25CA134
        </div>
      </footer>
    </div>
  );
}
