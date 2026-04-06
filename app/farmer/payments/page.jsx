'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import StatusBadge from '@/components/StatusBadge/StatusBadge';

export default function FarmerPayments() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'farmer')) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/orders?farmerId=${user.id}&status=completed`)
      .then(r => r.json())
      .then(setOrders)
      .catch(() => {});
  }, [user]);

  if (loading || !user) return null;

  const totalPaid = orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + (o.agreedPrice * o.quantity), 0);
  const totalPending = orders.filter(o => o.paymentStatus === 'pending').reduce((sum, o) => sum + (o.agreedPrice * o.quantity), 0);

  return (
    <div className="page-container">
      <h1 className="page-title">💳 Payments & Earnings</h1>

      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, var(--leaf), #3d6a34)', color: 'white' }}>
          <p style={{ opacity: 0.9, fontSize: '0.95rem' }}>Total Received</p>
          <h2 style={{ fontSize: '2.5rem', marginTop: '0.2rem' }}>₹{totalPaid.toLocaleString('en-IN')}</h2>
        </div>
        <div className="card" style={{ background: 'linear-gradient(135deg, var(--harvest), #b37324)', color: 'white' }}>
          <p style={{ opacity: 0.9, fontSize: '0.95rem' }}>Pending Payments</p>
          <h2 style={{ fontSize: '2.5rem', marginTop: '0.2rem' }}>₹{totalPending.toLocaleString('en-IN')}</h2>
          <p style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '0.5rem' }}>Payments clear 24h after delivery confirmation</p>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #ede8e0' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--soil)' }}>Payment History</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Order ID</th>
                <th>Buyer</th>
                <th>Crop</th>
                <th>Amount (₹)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--bark)' }}>No completed orders found.</td></tr>
              ) : (
                orders.map(order => {
                  const amount = order.agreedPrice * order.quantity;
                  return (
                    <tr key={order._id}>
                      <td>{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{order._id.substring(0, 8)}...</td>
                      <td>{order.buyerName}</td>
                      <td>{order.crop} ({order.quantity}q)</td>
                      <td style={{ fontWeight: 600 }}>₹{amount.toLocaleString('en-IN')}</td>
                      <td><StatusBadge status={order.paymentStatus} /></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
