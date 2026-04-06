'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import StatusBadge from '@/components/StatusBadge/StatusBadge';

export default function FarmerListingDetail() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [listing, setListing] = useState(null);
  const [counterPrices, setCounterPrices] = useState({});

  useEffect(() => {
    if (!loading && (!user || user.role !== 'farmer')) router.push('/login');
  }, [user, loading, router]);

  const fetchListing = () => {
    fetch(`/api/listings/${params.id}`).then(r => r.json()).then(setListing).catch(() => {});
  };

  useEffect(() => { if (user) fetchListing(); }, [user, params.id]);

  const handleBidAction = async (bidId, action, counterPrice) => {
    await fetch(`/api/listings/${params.id}/bid`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bidId, action, counterPrice: counterPrice ? Number(counterPrice) : undefined }),
    });
    fetchListing();

    if (action === 'accept') {
      const bid = listing.bids.find(b => b._id === bidId);
      if (bid) {
        await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            listingId: listing._id,
            farmerId: user.id,
            buyerId: bid.buyerId,
            farmerName: user.name,
            buyerName: bid.buyerName,
            crop: listing.crop,
            quantity: bid.quantity,
            agreedPrice: bid.offeredPrice,
            farmerDistrict: user.district,
          }),
        });
      }
    }
  };

  if (loading || !user || !listing) return null;

  return (
    <div className="page-container">
      <h1 className="page-title">📋 Listing Detail</h1>

      <div className="card card-produce" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ color: 'var(--soil)', fontSize: '1.4rem' }}>{listing.crop} {listing.variety && `— ${listing.variety}`}</h2>
            <p style={{ color: 'var(--bark)', fontSize: '0.9rem' }}>{listing.farmerDistrict}, {listing.farmerState}</p>
          </div>
          <StatusBadge status={listing.status} />
        </div>

        <div className="grid-4" style={{ marginBottom: '1rem' }}>
          <div><strong style={{ fontSize: '0.8rem', color: 'var(--bark)' }}>Quantity</strong><br />{listing.quantity} {listing.unit}</div>
          <div><strong style={{ fontSize: '0.8rem', color: 'var(--bark)' }}>Asking Price</strong><br />₹{listing.price?.toLocaleString('en-IN')}/{listing.unit}</div>
          <div><strong style={{ fontSize: '0.8rem', color: 'var(--bark)' }}>Grade</strong><br />{listing.grade}</div>
          <div><strong style={{ fontSize: '0.8rem', color: 'var(--bark)' }}>Harvest Date</strong><br />{new Date(listing.harvestDate).toLocaleDateString('en-IN')}</div>
        </div>

        {listing.description && <p style={{ color: 'var(--bark)', fontSize: '0.95rem', lineHeight: 1.6 }}>{listing.description}</p>}
      </div>

      <h2 style={{ fontSize: '1.2rem', color: 'var(--soil)', marginBottom: '1rem' }}>
        💬 Bids Received ({listing.bids?.length || 0})
      </h2>

      {(!listing.bids || listing.bids.length === 0) ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--bark)' }}>
          No bids yet. Your listing is visible to all buyers on the marketplace.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {listing.bids.map(bid => (
            <div key={bid._id} className="card card-order">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', color: 'var(--soil)' }}>{bid.buyerName}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--bark)' }}>
                    Offered ₹{bid.offeredPrice?.toLocaleString('en-IN')}/{listing.unit} × {bid.quantity} {listing.unit}
                  </p>
                </div>
                <StatusBadge status={bid.status} />
              </div>

              {bid.message && (
                <p style={{ fontSize: '0.9rem', color: 'var(--bark)', background: 'var(--mist)', padding: '0.65rem 0.85rem', borderRadius: '8px', marginBottom: '0.75rem' }}>
                  &ldquo;{bid.message}&rdquo;
                </p>
              )}

              {bid.counterPrice && (
                <p style={{ fontSize: '0.9rem', color: 'var(--harvest)', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Your counter offer: ₹{bid.counterPrice?.toLocaleString('en-IN')}/{listing.unit}
                </p>
              )}

              {bid.status === 'pending' && (
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button className="btn-primary" onClick={() => handleBidAction(bid._id, 'accept')}>
                    ✅ Accept Offer
                  </button>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="number"
                      placeholder="Counter price"
                      style={{ width: '130px', padding: '0.5rem' }}
                      value={counterPrices[bid._id] || ''}
                      onChange={e => setCounterPrices(p => ({ ...p, [bid._id]: e.target.value }))}
                    />
                    <button
                      className="btn-secondary"
                      onClick={() => handleBidAction(bid._id, 'counter', counterPrices[bid._id])}
                      disabled={!counterPrices[bid._id]}
                    >
                      Counter Offer
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
