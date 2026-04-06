'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { MANDI_PRICES } from '@/lib/market-data';

const CROPS = ['Wheat', 'Rice', 'Tomato', 'Onion', 'Sugarcane', 'Soybean'];

export default function ListProduce() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    crop: '', variety: '', quantity: '', unit: 'quintal',
    harvestDate: '', grade: 'A', description: '', price: '',
  });
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'farmer')) router.push('/login');
  }, [user, loading, router]);

  const update = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const mandiRate = MANDI_PRICES.find(m => m.crop.includes(form.crop));

  const handlePhoto = (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setPhotos(p => [...p.slice(0, 2), reader.result]);
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    const body = {
      farmerId: user.id,
      farmerName: user.name,
      farmerDistrict: user.district,
      farmerState: user.state,
      crop: form.crop,
      variety: form.variety,
      quantity: Number(form.quantity),
      unit: form.unit,
      price: Number(form.price),
      grade: form.grade,
      harvestDate: form.harvestDate,
      description: form.description,
      photos,
    };
    const res = await fetch('/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) router.push('/farmer/my-listings');
  };

  if (loading || !user) return null;

  return (
    <div className="page-container">
      <h1 className="page-title">🌿 List New Produce</h1>
      <form className="card" style={{ maxWidth: '700px' }} onSubmit={handleSubmit}>

        <div className="form-group">
          <label>Crop</label>
          <select required value={form.crop} onChange={e => update('crop', e.target.value)}>
            <option value="">Select crop</option>
            {CROPS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Variety</label>
          <input value={form.variety} onChange={e => update('variety', e.target.value)} placeholder="e.g. Sharbati, Sona Masuri" />
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Quantity</label>
            <input required type="number" value={form.quantity} onChange={e => update('quantity', e.target.value)} placeholder="50" />
          </div>
          <div className="form-group" style={{ flex: 0.5 }}>
            <label>Unit</label>
            <select value={form.unit} onChange={e => update('unit', e.target.value)}>
              <option value="quintal">Quintal</option>
              <option value="kg">Kg</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Harvest Date</label>
            <input required type="date" value={form.harvestDate} onChange={e => update('harvestDate', e.target.value)} />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Quality Grade</label>
            <select value={form.grade} onChange={e => update('grade', e.target.value)}>
              <option value="A">A — Premium</option>
              <option value="B">B — Standard</option>
              <option value="C">C — Economy</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea value={form.description} onChange={e => update('description', e.target.value)} placeholder="Tell buyers about your produce — storage method, pesticide use, unique quality..." rows={3} />
        </div>

        <div className="form-group">
          <label>Asking Price (₹ per {form.unit || 'quintal'})</label>
          <input required type="number" value={form.price} onChange={e => update('price', e.target.value)} placeholder="2200" />
        </div>

        {mandiRate && (
          <div style={{ background: 'var(--mist)', borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--bark)', borderLeft: '4px solid var(--leaf)' }}>
            Today&apos;s mandi rate for <strong>{form.crop}</strong>: <strong>₹{mandiRate.price.toLocaleString('en-IN')}/quintal</strong> at {mandiRate.market} — price your produce fairly.
          </div>
        )}

        <div className="form-group">
          <label>Photos (up to 3)</label>
          <input type="file" accept="image/*" multiple onChange={handlePhoto} />
          {photos.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              {photos.map((p, i) => (
                <img key={i} src={p} alt={`Photo ${i + 1}`} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
              ))}
            </div>
          )}
        </div>

        <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
          Publish Listing
        </button>
      </form>
    </div>
  );
}
