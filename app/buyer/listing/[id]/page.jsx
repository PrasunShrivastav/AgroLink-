'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import StatusBadge from '@/components/StatusBadge/StatusBadge';

export default function BuyerListingDetail() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [listing, setListing] = useState(null);
  const [farmer, setFarmer] = useState(null);
  const [form, setForm] = useState({ price: '', quantity: '', message: '' });
  const [modal, setModal] = useState(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'buyer')) router.push('/login');
  }, [user, loading, router]);

  const fetchListing = async () => {
    const res = await fetch(`/api/listings/${params.id}`);
    const data = await res.json();
    setListing(data);
    
    // In a real app we'd have an API to fetch standard farmer profile, but we'll fetch mock ratings logic here
  };

  useEffect(() => { if (user) fetchListing(); }, [user, params.id]);

  const handleMakeOffer = async (e) => {
    e.preventDefault();
    await fetch(`/api/listings/${params.id}/bid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        buyerId: user.id,
        buyerName: user.businessName,
        offeredPrice: Number(form.price),
        quantity: Number(form.quantity),
        message: form.message
      })
    });
    setModal('offer_success');
    fetchListing();
  };

  const handleDirectBuy = async () => {
    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        listingId: listing._id,
        farmerId: listing.farmerId,
        buyerId: user.id,
        farmerName: listing.farmerName,
        buyerName: user.businessName,
        crop: listing.crop,
        quantity: listing.quantity, // buying full quantity for direct buy
        agreedPrice: listing.price,
        farmerDistrict: listing.farmerDistrict,
      }),
    });
    
    await fetch(`/api/listings/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'sold' }),
    });

    setModal('buy_success');
  };

  if (loading || !user || !listing) return null;

  return (
    <div className="page-container" style={{ position: 'relative' }}>
      <h1 className="page-title">📋 Listing Details</h1>

      <div className="grid-2">
        <div className="card card-produce">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ color: 'var(--soil)', fontSize: '1.4rem' }}>{listing.crop} {listing.variety && `— ${listing.variety}`}</h2>
              <p style={{ color: 'var(--bark)', fontSize: '0.9rem' }}>Listed {new Date(listing.createdAt).toLocaleDateString()}</p>
            </div>
            <StatusBadge status={listing.status} />
          </div>

          <div className="grid-2" style={{ marginBottom: '1.5rem', background: 'var(--mist)', padding: '1rem', borderRadius: '8px' }}>
            <div><strong style={{ fontSize: '0.8rem', color: 'var(--bark)' }}>Available Quantity</strong><br />{listing.quantity} {listing.unit}</div>
            <div><strong style={{ fontSize: '0.8rem', color: 'var(--bark)' }}>Asking Price</strong><br /><span style={{ color: 'var(--leaf)', fontWeight: 700, fontSize: '1.1rem' }}>₹{listing.price?.toLocaleString('en-IN')}/{listing.unit}</span></div>
            <div><strong style={{ fontSize: '0.8rem', color: 'var(--bark)' }}>Quality Grade</strong><br />{listing.grade}</div>
            <div><strong style={{ fontSize: '0.8rem', color: 'var(--bark)' }}>Harvested On</strong><br />{new Date(listing.harvestDate).toLocaleDateString('en-IN')}</div>
          </div>

          <strong style={{ fontSize: '0.9rem', color: 'var(--soil)' }}>Description</strong>
          <p style={{ color: 'var(--bark)', fontSize: '0.95rem', lineHeight: 1.6, marginTop: '0.4rem' }}>{listing.description || 'No description provided.'}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{ background: '#fcfcfc' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--soil)', marginBottom: '0.8rem' }}>🧑‍🌾 Farmer Profile</h3>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--soil)' }}>{listing.farmerName}</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--bark)', marginBottom: '1rem' }}>📍 {listing.farmerDistrict}, {listing.farmerState}</p>
            <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid #ede8e0', paddingTop: '1rem' }}>
              <div><strong style={{ fontSize: '1.2rem', color: 'var(--harvest)' }}>★ 4.8</strong><br /><span style={{ fontSize: '0.8rem', color: 'var(--bark)' }}>Rating</span></div>
              <div><strong style={{ fontSize: '1.2rem', color: 'var(--soil)' }}>24</strong><br /><span style={{ fontSize: '0.8rem', color: 'var(--bark)' }}>Completed Deals</span></div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.1rem', color: 'var(--soil)', marginBottom: '1rem' }}>Action</h3>
            {(listing.status === 'sold' || listing.status === 'expired') ? (
              <p style={{ color: 'var(--danger)', fontWeight: 600 }}>This listing is no longer available.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button className="btn-primary" onClick={handleDirectBuy} style={{ padding: '1rem' }}>
                  Buy Now at Asking Price
                </button>
                <div style={{ textAlign: 'center', color: 'var(--bark)', fontSize: '0.9rem' }}>— OR —</div>
                <button className="btn-secondary" onClick={() => setModal('offer')}>
                  Make a Counter Offer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {modal === 'offer' && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={handleMakeOffer}>
            <h2 style={{ fontSize: '1.3rem', color: 'var(--soil)', marginBottom: '1rem' }}>Make an Offer</h2>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Offer Price (₹/{listing.unit})</label>
                <input required type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder={`e.g. ${listing.price - 100}`} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Quantity ({listing.unit})</label>
                <input required type="number" max={listing.quantity} value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} placeholder={`Max: ${listing.quantity}`} />
              </div>
            </div>

            <div className="form-group">
              <label>Message to Farmer (Optional)</label>
              <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} rows={2} placeholder="E.g. Need this delivered by Monday" />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="button" className="btn-secondary" onClick={() => setModal(null)} style={{ flex: 1 }}>Cancel</button>
              <button type="submit" className="btn-primary" style={{ flex: 1 }}>Submit Offer</button>
            </div>
          </form>
        </div>
      )}

      {(modal === 'offer_success' || modal === 'buy_success') && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</p>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--soil)', marginBottom: '0.5rem' }}>Success!</h2>
            <p style={{ color: 'var(--bark)', marginBottom: '2rem' }}>
              {modal === 'buy_success' ? 'Your order has been confirmed successfully.' : 'Your offer has been sent to the farmer. You will be notified when they respond.'}
            </p>
            <button className="btn-primary" onClick={() => router.push('/buyer/orders')} style={{ width: '100%' }}>Go to Orders</button>
          </div>
        </div>
      )}
    </div>
  );
}
