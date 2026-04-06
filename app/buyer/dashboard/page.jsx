'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import NotificationCard from '@/components/NotificationCard/NotificationCard';
import styles from '../../dashboard.module.css';

export default function BuyerDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ active: 0, pending: 0, completed: 0, spent: 0 });

  useEffect(() => {
    if (!loading && (!user || user.role !== 'buyer')) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/orders?buyerId=${user.id}`).then(r => r.json()).then(orders => {
      setStats({
        active: orders.filter(o => o.status === 'in_progress').length,
        pending: orders.filter(o => o.status === 'pending').length,
        completed: orders.filter(o => o.status === 'completed').length,
        spent: orders.filter(o => o.status === 'completed').reduce((s, o) => s + (o.agreedPrice * o.quantity), 0),
      });
    }).catch(() => {});
  }, [user]);

  if (loading || !user) return null;

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className={styles.dashWrap}>
      <div className="page-container" style={{ paddingTop: '3rem' }}>
        <div className={styles.welcome}>
          <h1>{greeting}, {user.ownerName} 🏪</h1>
          <p>{user.businessName} • {today}</p>
        </div>

        <div className="grid-4">
          <div className="stat-card">
            <h3>{stats.active}</h3>
            <p>Active Deliveries</p>
          </div>
          <div className="stat-card">
            <h3>{stats.pending}</h3>
            <p>Pending Orders</p>
          </div>
          <div className="stat-card">
            <h3>{stats.completed}</h3>
            <p>Completed Purchases</p>
          </div>
          <div className="stat-card">
            <h3>₹{stats.spent.toLocaleString('en-IN')}</h3>
            <p>Total Spent</p>
          </div>
        </div>

        <div className={styles.quickActions}>
          <Link href="/buyer/browse" className="btn-primary">Browse Produce</Link>
          <Link href="/buyer/orders" className="btn-secondary">My Orders</Link>
          <Link href="/buyer/market-prices" className="btn-secondary">Market Prices</Link>
        </div>

        <h3 className={styles.sectionTitle}>Recent Activity</h3>
        <div className={styles.notifList}>
          <NotificationCard icon="🎉" message="Ramesh Patil accepted your bid for 20q Onion." time="2 hours ago" />
          <NotificationCard icon="🚚" message="Your Wheat order from Suresh Yadav is now In Transit." time="5 hours ago" />
          <NotificationCard icon="🌾" message="New 'Sona Masuri Rice' listings added near you." time="1 day ago" />
        </div>
      </div>
    </div>
  );
}
