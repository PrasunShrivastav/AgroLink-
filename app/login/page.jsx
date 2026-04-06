'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import styles from '../auth.module.css';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(phone, password);
      router.push(`/${user.role}/dashboard`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.authPage}>
      <form className={styles.authCard} onSubmit={handleSubmit}>
        <h1>🌾 Welcome Back</h1>
        <p className={styles.subtitle}>Log in to your AgroLink account</p>

        {error && <div className={styles.error}>{error}</div>}

        <div style={{ background: 'var(--mist)', borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '1.25rem', fontSize: '0.85rem', color: 'var(--bark)' }}>
          <strong>Demo accounts:</strong><br />
          Farmer: 9876543210 / farmer123<br />
          Buyer: 9988776655 / buyer123
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <input required type="tel" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter your phone number" />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" />
        </div>

        <button type="submit" className={`btn-primary ${styles.submitBtn}`}>
          Log In
        </button>

        <p className={styles.switchLink}>
          New here? Register as <Link href="/farmer/register">Farmer</Link> or <Link href="/buyer/register">Buyer</Link>
        </p>
      </form>
    </div>
  );
}
