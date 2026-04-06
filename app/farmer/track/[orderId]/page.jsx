'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import SupplyChainTracker from '@/components/SupplyChainTracker/SupplyChainTracker';

export default function FarmerTrackOrder() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'farmer')) router.push('/login');
  }, [user, loading, router]);

  const fetchOrder = () => {
    fetch(`/api/orders/${params.orderId}`).then(r => r.json()).then(setOrder).catch(() => {});
  };

  useEffect(() => { if (user) fetchOrder(); }, [user, params.orderId]);

  const handleAdvance = async (stepIndex) => {
    await fetch(`/api/orders/${params.orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ advanceStep: stepIndex }),
    });
    fetchOrder();
  };

  const handleSimulateTransit = async () => {
    if (!order) return;
    const transitStepIdx = 3;
    const deliveryStepIdx = 4;
    
    if (order.supplyChainSteps[transitStepIdx].status === 'active') {
      await handleAdvance(transitStepIdx);
      setTimeout(() => handleAdvance(deliveryStepIdx), 3000);
    }
  };

  if (loading || !user || !order) return null;

  return (
    <div className="page-container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: '1.5rem', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', color: 'var(--soil)', marginBottom: '0.2rem' }}>Track Shipment</h1>
            <p style={{ color: 'var(--bark)', fontSize: '0.9rem' }}>OrderID: {order._id} • Batch: {order.batchId}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--soil)' }}>{order.crop} ({order.quantity}q)</p>
            <p style={{ color: 'var(--leaf)', fontWeight: 700 }}>₹{order.agreedPrice?.toLocaleString('en-IN')}/q</p>
          </div>
        </div>

        <div style={{ background: 'var(--mist)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--soil)', marginBottom: '0.2rem' }}>Buyer Details</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--bark)' }}>{order.buyerName}</p>
        </div>

        <SupplyChainTracker 
          steps={order.supplyChainSteps} 
          onAdvance={handleAdvance}
          readOnly={false} 
        />

        {order.supplyChainSteps[3].status === 'active' && (
          <div style={{ marginTop: '2rem', textAlign: 'center', background: '#e8f4fd', padding: '1.5rem', borderRadius: '12px' }}>
            <p style={{ marginBottom: '1rem', color: '#2980b9', fontSize: '0.9rem' }}>
              🚚 <em>Demo action: Simulate logistics partner updating the transit status.</em>
            </p>
            <button className="btn-secondary" onClick={handleSimulateTransit}>
              Simulate Transit & Delivery
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
