'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Rating from '@/components/Rating/Rating';

export default function BuyerRateFarmer() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'buyer')) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/orders/${params.orderId}`).then(r => r.json()).then(setOrder).catch(() => {});
  }, [user, params.orderId]);

  const handleSubmit = async ({ stars, review }) => {
    if (!order) return;
    await fetch('/api/ratings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fromId: user.id,
        toId: order.farmerId,
        fromRole: 'buyer',
        stars,
        review,
        orderId: order._id
      }),
    });
  };

  if (loading || !user || !order) return null;

  return (
    <div className="page-container" style={{ maxWidth: '600px' }}>
      <h1 className="page-title">Rate Farmer</h1>

      <div className="card" style={{ marginBottom: '1.5rem', background: 'var(--mist)', padding: '1.25rem' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--bark)', marginBottom: '0.2rem' }}>Order received from</p>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--soil)' }}>{order.farmerName}</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--soil)', marginTop: '0.5rem', fontWeight: 600 }}>
          {order.crop} ({order.quantity}q)
        </p>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1.1rem', color: 'var(--soil)', marginBottom: '1rem' }}>How was the quality of produce?</h3>
        <Rating onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
