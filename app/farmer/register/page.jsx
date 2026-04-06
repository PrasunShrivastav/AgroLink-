'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import styles from '../../auth.module.css';

const CROPS = ['Wheat', 'Rice', 'Tomato', 'Onion', 'Sugarcane', 'Soybean', 'Other'];
const STATES = ['Maharashtra', 'Karnataka', 'Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan', 'Gujarat', 'Punjab', 'Haryana', 'Tamil Nadu', 'Andhra Pradesh'];

export default function FarmerRegister() {
  const { register } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', village: '', district: '', state: '',
    phone: '', crops: [], landSize: '', aadhaar: '', password: '',
  });

  const update = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const toggleCrop = (crop) => {
    setForm((p) => ({
      ...p,
      crops: p.crops.includes(crop) ? p.crops.filter((c) => c !== crop) : [...p.crops, crop],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register('farmer', { ...form, landSize: Number(form.landSize) || 0 });
      router.push('/farmer/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.authPage}>
      <form className={styles.authCard} onSubmit={handleSubmit}>
        <h1>🧑‍🌾 Register as Farmer</h1>
        <p className={styles.subtitle}>Join 2,400+ farmers getting fair deals</p>

        {error && <div className={styles.error}>{error}</div>}

        <div className="form-group">
          <label>Full Name</label>
          <input required value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Ramesh Patil" />
        </div>

        <div className={styles.row}>
          <div className="form-group">
            <label>Village / Town</label>
            <input required value={form.village} onChange={(e) => update('village', e.target.value)} placeholder="Shirur" />
          </div>
          <div className="form-group">
            <label>District</label>
            <input required value={form.district} onChange={(e) => update('district', e.target.value)} placeholder="Pune" />
          </div>
        </div>

        <div className={styles.row}>
          <div className="form-group">
            <label>State</label>
            <select required value={form.state} onChange={(e) => update('state', e.target.value)}>
              <option value="">Select state</option>
              {STATES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input required type="tel" maxLength={10} value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="9876543210" />
          </div>
        </div>

        <div className="form-group">
          <label>Crop Specialisation</label>
          <div className={styles.multiSelect}>
            {CROPS.map((crop) => (
              <label key={crop}>
                <input type="checkbox" checked={form.crops.includes(crop)} onChange={() => toggleCrop(crop)} />
                {crop}
              </label>
            ))}
          </div>
        </div>

        <div className={styles.row}>
          <div className="form-group">
            <label>Land Size (acres)</label>
            <input type="number" value={form.landSize} onChange={(e) => update('landSize', e.target.value)} placeholder="12" />
          </div>
          <div className="form-group">
            <label>Aadhaar Number</label>
            <input value={form.aadhaar} onChange={(e) => update('aadhaar', e.target.value)} placeholder="XXXX-XXXX-1234" maxLength={14} />
          </div>
        </div>

        <div className="form-group">
          <label>Password</label>
          <input required type="password" value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="Create a password" minLength={6} />
        </div>

        <button type="submit" className={`btn-primary ${styles.submitBtn}`}>
          Create My Account
        </button>

        <p className={styles.switchLink}>
          Already registered? <Link href="/login">Log in here</Link>
        </p>
      </form>
    </div>
  );
}
