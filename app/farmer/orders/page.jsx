'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import StatusBadge from '@/components/StatusBadge/StatusBadge';

export default function FarmerOrders() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('pending');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'farmer')) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/orders?farmerId=${user.id}`)
      .then(r => r.json())
      .then(setOrders)
      .catch(() => {});
  }, [user]);

  const handleMarkPacked = async (orderId) => {
    const order = orders.find(o => o._id === orderId);
    if (!order) return;
    const nextStep = order.supplyChainSteps.findIndex(s => s.status === 'pending' || s.status === 'active');
    if (nextStep >= 0) {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ advanceStep: nextStep }),
      });
      const res = await fetch(`/api/orders?farmerId=${user.id}`);
      setOrders(await res.json());
    }
  };

  if (loading || !user) return null;

  const filtered = orders.filter(o => o.status === tab);

  return (
    <div className="page-container">
      <h1 className="page-title">📦 My Orders</h1>

      <div className="tabs">
        {['pending', 'in_progress', 'completed'].map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'in_progress' ? 'In Progress' : t.charAt(0).toUpperCase() + t.slice(1)}
            <span style={{ marginLeft: '0.4rem', fontSize: '0.8rem', opacity: 0.6 }}>
              ({orders.filter(o => o.status === t).length})
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--bark)' }}>
          No {tab.replace('_', ' ')} orders right now.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map(order => (
            <div key={order._id} className="card card-order">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', color: 'var(--soil)' }}>{order.crop}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--bark)' }}>Buyer: {order.buyerName}</p>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem', color: 'var(--bark)', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                <span>Qty: <strong>{order.quantity}q</strong></span>
                <span>Price: <strong>₹{order.agreedPrice?.toLocaleString('en-IN')}/q</strong></span>
                <span>Date: {new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {tab === 'pending' && (
                  <button className="btn-primary" onClick={() => handleMarkPacked(order._id)} style={{ fontSize: '0.85rem' }}>
                    📦 Mark as Packed & Ready
                  </button>
                )}
                <Link href={`/farmer/track/${order._id}`} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
                  🔍 Track Shipment
                </Link>
                {tab === 'completed' && (
                  <Link href={`/farmer/rate/${order._id}`} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
                    ⭐ Rate Buyer
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
