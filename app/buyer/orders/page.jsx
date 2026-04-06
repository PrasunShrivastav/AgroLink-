'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import StatusBadge from '@/components/StatusBadge/StatusBadge';

export default function BuyerOrders() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('in_progress');
  const [payModal, setPayModal] = useState(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'buyer')) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/orders?buyerId=${user.id}`)
      .then(r => r.json())
      .then(setOrders)
      .catch(() => {});
  }, [user]);

  const handlePay = async (e) => {
    e.preventDefault();
    await fetch(`/api/orders/${payModal._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentStatus: 'paid' }),
    });
    setPayModal(null);
    const res = await fetch(`/api/orders?buyerId=${user.id}`);
    setOrders(await res.json());
  };

  if (loading || !user) return null;

  const filtered = orders.filter(o => o.status === tab);

  return (
    <div className="page-container">
      <h1 className="page-title">📦 Procurement Orders</h1>

      <div className="tabs">
        {['in_progress', 'pending', 'completed'].map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'in_progress' ? 'Active Deliveries' : t.charAt(0).toUpperCase() + t.slice(1)}
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
                  <h3 style={{ fontSize: '1.05rem', color: 'var(--soil)' }}>{order.crop} supplied by {order.farmerName}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--bark)' }}>{order.farmerDistrict}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <StatusBadge status={order.status} />
                  <StatusBadge status={order.paymentStatus === 'paid' ? 'Paid' : 'Pending Payment'} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem', color: 'var(--bark)', marginBottom: '0.75rem', flexWrap: 'wrap', padding: '0.5rem 0', borderTop: '1px solid #eee', borderBottom: '1px solid #eee' }}>
                <span>Qty: <strong>{order.quantity}q</strong></span>
                <span>Price: <strong>₹{order.agreedPrice?.toLocaleString('en-IN')}/q</strong></span>
                <span>Total: <strong style={{ color: 'var(--leaf)' }}>₹{(order.agreedPrice * order.quantity).toLocaleString('en-IN')}</strong></span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <Link href={`/buyer/track/${order._id}`} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
                  🚚 Track Delivery
                </Link>
                {tab === 'completed' && order.paymentStatus !== 'paid' && (
                  <button className="btn-primary" onClick={() => setPayModal(order)} style={{ fontSize: '0.85rem', background: 'var(--harvest)' }}>
                    💳 Pay Farmer
                  </button>
                )}
                {tab === 'completed' && order.paymentStatus === 'paid' && (
                  <Link href={`/buyer/rate/${order._id}`} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
                    ⭐ Rate Farmer
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {payModal && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={handlePay}>
            <h2 style={{ fontSize: '1.3rem', color: 'var(--soil)', marginBottom: '0.5rem' }}>Review Payment</h2>
            <p style={{ color: 'var(--bark)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Release payment directly to the farmer. No platform fees deducted.
            </p>

            <div style={{ background: 'var(--mist)', padding: '1.25rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                <span className="bark">Farmer</span>
                <span className="soil"><strong>{payModal.farmerName}</strong></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                <span className="bark">Produce</span>
                <span className="soil">{payModal.crop} ({payModal.quantity}q)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(107, 79, 58, 0.2)', fontSize: '1.1rem' }}>
                <span className="bark">Total Payable</span>
                <span className="leaf"><strong>₹{(payModal.agreedPrice * payModal.quantity).toLocaleString('en-IN')}</strong></span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="button" className="btn-secondary" onClick={() => setPayModal(null)} style={{ flex: 1 }}>Cancel</button>
              <button type="submit" className="btn-primary" style={{ flex: 1, background: 'var(--harvest)' }}>Authorize Payment</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
