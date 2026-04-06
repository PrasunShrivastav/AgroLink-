'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import SupplyChainTracker from '@/components/SupplyChainTracker/SupplyChainTracker';

export default function BuyerTrackOrder() {
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

  if (loading || !user || !order) return null;

  return (
    <div className="page-container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: '1.5rem', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', color: 'var(--soil)', marginBottom: '0.2rem' }}>Track Delivery</h1>
            <p style={{ color: 'var(--bark)', fontSize: '0.9rem' }}>OrderID: {order._id} • Batch: {order.batchId}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--soil)' }}>{order.crop} ({order.quantity}q)</p>
            <p style={{ color: 'var(--leaf)', fontWeight: 700 }}>₹{order.agreedPrice?.toLocaleString('en-IN')}/q</p>
          </div>
        </div>

        <div style={{ background: 'var(--mist)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--soil)', marginBottom: '0.2rem' }}>Supplier Details</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--bark)', fontWeight: 500 }}>{order.farmerName}</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--bark)' }}>{order.farmerDistrict}</p>
        </div>

        <SupplyChainTracker 
          steps={order.supplyChainSteps} 
          readOnly={true} // Buyer only views tracking, farmer/logistics updates it
        />

        {order.supplyChainSteps[4].status === 'complete' && order.paymentStatus === 'pending' && (
          <div style={{ marginTop: '2.5rem', textAlign: 'center', background: 'rgba(212, 140, 45, 0.1)', padding: '1.5rem', borderRadius: '12px', border: '1px dashed var(--harvest)' }}>
            <p style={{ marginBottom: '1rem', color: 'var(--soil)' }}>
              🚚 <strong>Delivery Complete!</strong> Please inspect the produce and release payment to the farmer.
            </p>
            <button className="btn-primary" onClick={() => router.push('/buyer/orders')} style={{ background: 'var(--harvest)' }}>
              Go to Orders to Pay
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
