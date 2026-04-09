'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchActivity, markAllRead, timeAgo } from '@/lib/activityClient';

const ICONS = {
  listing_created:    '📋',
  bid_received:       '📦',
  bid_placed:         '📦',
  order_confirmed:    '✅',
  order_placed:       '✅',
  bid_accepted:       '🤝',
  supply_chain_update:'🚚',
  shipment_dispatched:'🚚',
  delivery_arrived:   '📍',
  delivery_confirmed: '✅',
  payment_received:   '💰',
  course_enrolled:    '🎓',
};

export default function ActivityFeed({ userId, role, limit = 10 }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadActivity = async () => {
    if (!userId) return;
    const data = await fetchActivity(userId);
    setActivities(data.slice(0, limit));
    setLoading(false);
  };

  useEffect(() => {
    loadActivity();
    const interval = setInterval(() => {
      loadActivity();
    }, 30000);

    return () => clearInterval(interval);
  }, [userId, limit]);

  useEffect(() => {
    if (activities.some(a => !a.read)) {
      const timer = setTimeout(() => {
        markAllRead(userId).then(() => {
          setActivities(prev => prev.map(a => ({ ...a, read: true })));
        });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [activities, userId]);

  if (loading) return null;

  if (activities.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--bark)' }}>
        No activity yet. List your first produce or place your first order to get started.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {activities.map((a) => (
        <div
          key={a._id}
          className="card"
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
            padding: '1rem',
            borderLeft: a.read ? '3px solid transparent' : '3px solid var(--harvest)',
            opacity: a.read ? 0.7 : 1,
            transition: 'all 0.3s ease'
          }}
        >
          <div style={{ fontSize: '1.4rem' }}>{ICONS[a.type] || '🔔'}</div>
          <div>
            <p style={{ fontSize: '14px', color: 'var(--soil)', fontWeight: a.read ? 400 : 500, marginBottom: '0.25rem', lineHeight: 1.4 }}>
              {a.message}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--bark)' }}>{timeAgo(a.createdAt)}</p>
          </div>
        </div>
      ))}
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <a href="#" style={{ color: 'var(--leaf)', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}>
          View all activity →
        </a>
      </div>
    </div>
  );
}
