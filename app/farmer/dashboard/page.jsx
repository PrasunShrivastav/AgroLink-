'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import MandiTicker from '@/components/MandiTicker/MandiTicker';
import NotificationCard from '@/components/NotificationCard/NotificationCard';
import styles from '../../dashboard.module.css';

export default function FarmerDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ listings: 0, pending: 0, completed: 0, earnings: 0 });

  useEffect(() => {
    if (!loading && (!user || user.role !== 'farmer')) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetch(`/api/listings?farmerId=${user.id}`).then(r => r.json()),
      fetch(`/api/orders?farmerId=${user.id}`).then(r => r.json()),
    ]).then(([listings, orders]) => {
      setStats({
        listings: listings.filter(l => l.status === 'active' || l.status === 'bid_received').length,
        pending: orders.filter(o => o.status === 'pending').length,
        completed: orders.filter(o => o.status === 'completed').length,
        earnings: orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + (o.agreedPrice * o.quantity), 0),
      });
    }).catch(() => {});
  }, [user]);

  if (loading || !user) return null;

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className={styles.dashWrap}>
      <div className="page-container">
        <div className={styles.welcome}>
          <h1>{greeting}, {user.name} 🌾</h1>
          <p>{today}</p>
        </div>

        <div className="grid-4">
          <div className="stat-card">
            <h3>{stats.listings}</h3>
            <p>Active Listings</p>
          </div>
          <div className="stat-card">
            <h3>{stats.pending}</h3>
            <p>Pending Orders</p>
          </div>
          <div className="stat-card">
            <h3>{stats.completed}</h3>
            <p>Completed Sales</p>
          </div>
          <div className="stat-card">
            <h3>₹{stats.earnings.toLocaleString('en-IN')}</h3>
            <p>Total Earnings</p>
          </div>
        </div>

        <div className={styles.quickActions}>
          <Link href="/farmer/list-produce" className="btn-primary">+ List New Produce</Link>
          <Link href="/farmer/orders" className="btn-secondary">View Orders</Link>
          <Link href="/farmer/my-listings" className="btn-secondary">My Listings</Link>
          <Link href="/farmer/skills" className="btn-secondary">Browse Skill Courses</Link>
        </div>

        <h3 className={styles.sectionTitle}>Recent Activity</h3>
        <div className={styles.notifList}>
          <NotificationCard icon="💰" message="Payment of ₹82,000 received for Wheat order from Deccan Wholesale" time="2 hours ago" />
          <NotificationCard icon="📦" message="Fresh Basket Retail placed a bid of ₹1,650/q on your Onion listing" time="5 hours ago" />
          <NotificationCard icon="✅" message="Your Sharbati Wheat listing (50q) is now live on the marketplace" time="1 day ago" />
          <NotificationCard icon="🎓" message="New course available: Agri-Drone Pilot Training in Aurangabad" time="2 days ago" />
        </div>
      </div>
    </div>
  );
}
