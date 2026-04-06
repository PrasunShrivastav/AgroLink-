'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import StatusBadge from '@/components/StatusBadge/StatusBadge';

const CROPS = ['Wheat', 'Rice', 'Tomato', 'Onion', 'Sugarcane', 'Soybean'];

export default function BrowseListings() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState([]);
  const [filters, setFilters] = useState({ crop: '', minPrice: '', maxPrice: '' });

  useEffect(() => {
    if (!loading && (!user || user.role !== 'buyer')) router.push('/login');
  }, [user, loading, router]);

  const fetchListings = () => {
    const params = new URLSearchParams();
    if (filters.crop) params.append('crop', filters.crop);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    
    fetch(`/api/listings?${params.toString()}`)
      .then(r => r.json())
      .then(data => setListings(data.filter(l => l.status === 'active' || l.status === 'bid_received')))
      .catch(() => {});
  };

  useEffect(() => { if (user) fetchListings(); }, [user, filters]);

  if (loading || !user) return null;

  return (
    <div className="page-container" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
      
      {/* Sidebar Filters */}
      <div style={{ width: '100%', maxWidth: '280px' }}>
        <h1 style={{ fontSize: '1.4rem', color: 'var(--soil)', marginBottom: '1.5rem' }}>Browse Produce</h1>
        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--soil)', marginBottom: '1rem' }}>Filters</h3>
          
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label>Crop Type</label>
            <select value={filters.crop} onChange={e => setFilters(f => ({ ...f, crop: e.target.value }))}>
              <option value="">All Crops</option>
              {CROPS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Price Range (₹/q)</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="number" placeholder="Min" value={filters.minPrice} onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value }))} />
              <input type="number" placeholder="Max" value={filters.maxPrice} onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: '1rem', color: 'var(--bark)', fontSize: '0.9rem' }}>
          Showing {listings.length} live listings
        </div>

        {listings.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--bark)' }}>
            No listings match your filters.
          </div>
        ) : (
          <div className="grid-2">
            {listings.map(listing => (
              <div key={listing._id} className="card card-produce" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--soil)' }}>{listing.crop} <span style={{ fontSize: '0.9rem', color: 'var(--bark)', fontWeight: 'normal' }}>{listing.variety && `— ${listing.variety}`}</span></h3>
                  <StatusBadge status={listing.status} />
                </div>
                
                <p style={{ fontSize: '0.85rem', color: 'var(--bark)', marginBottom: '1rem' }}>
                  🧑‍🌾 {listing.farmerName} • 📍 {listing.farmerDistrict}, {listing.farmerState}
                </p>

                <div style={{ display: 'flex', gap: '1rem', background: 'var(--mist)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--bark)' }}>Available</p>
                    <p style={{ fontWeight: 600, color: 'var(--soil)' }}>{listing.quantity} {listing.unit}</p>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--bark)' }}>Grade</p>
                    <p style={{ fontWeight: 600, color: 'var(--soil)' }}>{listing.grade}</p>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--bark)' }}>Price</p>
                    <p style={{ fontWeight: 700, color: 'var(--leaf)' }}>₹{listing.price?.toLocaleString('en-IN')}/{listing.unit}</p>
                  </div>
                </div>

                <Link href={`/buyer/listing/${listing._id}`} className="btn-secondary" style={{ marginTop: 'auto', textAlign: 'center', width: '100%', display: 'block' }}>
                  View & Offer
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
