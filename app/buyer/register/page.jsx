'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import styles from '../../auth.module.css';

const TYPES = ['Retailer', 'Wholesaler', 'Restaurant', 'Exporter'];
const STATES = ['Maharashtra', 'Karnataka', 'Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan', 'Gujarat', 'Punjab', 'Haryana', 'Tamil Nadu', 'Andhra Pradesh'];

export default function BuyerRegister() {
  const { register } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    businessName: '', ownerName: '', phone: '', email: '',
    businessType: '', gstin: '', city: '', state: '', password: '',
  });

  const update = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register('buyer', form);
      router.push('/buyer/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.authPage}>
      <form className={styles.authCard} onSubmit={handleSubmit}>
        <h1>🏪 Register as Buyer</h1>
        <p className={styles.subtitle}>Source fresh produce directly from 2,400+ farmers</p>

        {error && <div className={styles.error}>{error}</div>}

        <div className="form-group">
          <label>Business Name</label>
          <input required value={form.businessName} onChange={(e) => update('businessName', e.target.value)} placeholder="Fresh Basket Retail" />
        </div>

        <div className={styles.row}>
          <div className="form-group">
            <label>Owner Name</label>
            <input required value={form.ownerName} onChange={(e) => update('ownerName', e.target.value)} placeholder="Ankit Sharma" />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input required type="tel" maxLength={10} value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="9988776655" />
          </div>
        </div>

        <div className="form-group">
          <label>Email</label>
          <input required type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@business.com" />
        </div>

        <div className={styles.row}>
          <div className="form-group">
            <label>Business Type</label>
            <select required value={form.businessType} onChange={(e) => update('businessType', e.target.value)}>
              <option value="">Select type</option>
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>GSTIN</label>
            <input value={form.gstin} onChange={(e) => update('gstin', e.target.value)} placeholder="27AABCF1234E1Z5" maxLength={15} />
          </div>
        </div>

        <div className={styles.row}>
          <div className="form-group">
            <label>City</label>
            <input required value={form.city} onChange={(e) => update('city', e.target.value)} placeholder="Mumbai" />
          </div>
          <div className="form-group">
            <label>State</label>
            <select required value={form.state} onChange={(e) => update('state', e.target.value)}>
              <option value="">Select state</option>
              {STATES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Password</label>
          <input required type="password" value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="Create a password" minLength={6} />
        </div>

        <button type="submit" className={`btn-primary ${styles.submitBtn}`}>
          Create Business Account
        </button>

        <p className={styles.switchLink}>
          Already registered? <Link href="/login">Log in here</Link>
        </p>
      </form>
    </div>
  );
}
