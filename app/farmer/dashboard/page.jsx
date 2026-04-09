'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import MandiTicker from '@/components/MandiTicker/MandiTicker';
import ActivityFeed from '@/components/ActivityFeed/ActivityFeed';
import StatusBadge from '@/components/StatusBadge/StatusBadge';
import styles from '../../dashboard.module.css';

export default function FarmerDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ activeListings: 0, pendingOrders: 0, completedSales: 0, totalEarnings: 0 });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'farmer')) router.push('/login');
  }, [user, loading, router]);

  const fetchData = () => {
    if (!user) return;
    fetch(`/api/farmer/stats?farmerId=${user.id}`)
      .then(r => r.json())
      .then(data => setStats(data))
      .catch(() => {});
  };

  const fetchRecentOrders = () => {
    if (!user) return;
    fetch(`/api/orders/recent?farmerId=${user.id}`)
      .then(r => r.json())
      .then(res => setRecentOrders(res.data || []))
      .catch(() => {});
  };

  useEffect(() => {
    fetchData();
    fetchRecentOrders();
    const statsInterval = setInterval(fetchData, 60000);
    const ordersInterval = setInterval(fetchRecentOrders, 30000);
    return () => {
      clearInterval(statsInterval);
      clearInterval(ordersInterval);
    };
  }, [user]);

  const getNextStepName = (order) => {
    const nextStep = order.supplyChainSteps?.find(s => s.status === 'pending');
    if (!nextStep) return null;
    const BUTTON_LABELS = {
      'Quality Checked': 'Mark Quality Checked',
      'Packed & Loaded': 'Mark Packed',
      'In Transit': 'Mark In Transit',
      'Delivered': 'Mark Delivered',
    };
    return BUTTON_LABELS[nextStep.label] || null;
  };

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
            <h3>{stats.activeListings}</h3>
            <p>Active Listings</p>
          </div>
          <div className="stat-card">
            <h3>{stats.pendingOrders}</h3>
            <p>Pending Orders</p>
          </div>
          <div className="stat-card">
            <h3>{stats.completedSales}</h3>
            <p>Completed Sales</p>
          </div>
          <div className="stat-card">
            <h3>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(stats.totalEarnings)}</h3>
            <p>Total Earnings</p>
          </div>
        </div>

        <div className={styles.quickActions}>
          <Link href="/farmer/list-produce" className="btn-primary">+ List New Produce</Link>
          <Link href="/farmer/orders" className="btn-secondary">View Orders</Link>
          <Link href="/farmer/my-listings" className="btn-secondary">My Listings</Link>
          <Link href="/farmer/skills" className="btn-secondary">Browse Skill Courses</Link>
        </div>

        <h3 className={styles.sectionTitle} style={{ marginTop: '2rem' }}>Recent Orders</h3>
        {recentOrders.length === 0 ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--bark)' }}>
            No orders yet. Once a buyer confirms your produce, orders will appear here.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentOrders.map((order) => {
              const nextButtonLabel = getNextStepName(order);
              const totalAmount = order.totalAmount || (order.quantity * order.agreedPrice);
              
              const isConfirmed = order.status === 'confirmed';
              const isInProgress = order.status === 'in_progress';
              const isDelivered = order.status === 'delivered';
              
              let badgeColor = 'var(--mist)';
              let textColor = 'var(--soil)';
              if (isConfirmed) badgeColor = 'var(--harvest)';
              if (isInProgress) badgeColor = 'var(--sky)';
              if (isDelivered) { badgeColor = 'var(--leaf)'; textColor = '#fff'; }

              return (
                <div key={order._id} className="card card-order" style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--bark)' }}>{order.batchId || order._id}</div>
                    <div style={{ padding: '4px 8px', borderRadius: '4px', background: badgeColor, color: textColor, fontSize: '0.75rem', fontWeight: 600 }}>
                      {order.status.toUpperCase()}
                    </div>
                  </div>
                  
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--soil)', marginBottom: '0.2rem' }}>{order.crop} — {order.variety || ''}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--bark)', marginBottom: '1rem' }}>Buyer: {order.buyerName}</p>
                  
                  <p style={{ fontSize: '0.9rem', color: 'var(--bark)', marginBottom: '1.5rem', fontWeight: 500 }}>
                    {order.quantity} quintal &middot; ₹{order.agreedPrice}/q &middot; Total: <span style={{ color: 'var(--leaf)' }}>₹{totalAmount.toLocaleString('en-IN')}</span>
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0', position: 'relative', marginBottom: '1.5rem', padding: '0 10px' }}>
                    {order.supplyChainSteps?.map((step, idx) => {
                      const isComplete = step.status === 'complete';
                      const isActive = step.status === 'active';
                      const isPending = step.status === 'pending';
                      
                      const circleColor = isComplete ? 'var(--leaf)' : (isActive ? 'var(--harvest)' : 'transparent');
                      const borderCol = isPending ? 'solid 2px var(--bark)' : 'none';
                      const pulseClass = isActive ? 'pulse-anim' : '';

                      return (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', flex: idx < 4 ? 1 : 0 }}>
                          <div style={{ position: 'relative' }}>
                            <div className={pulseClass} style={{
                              width: '14px', height: '14px', borderRadius: '50%',
                              background: circleColor,
                              border: borderCol,
                              zIndex: 2, position: 'relative'
                            }}></div>
                            {(idx === 0 || idx === 4) && (
                              <div style={{ position: 'absolute', top: '18px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.75rem', color: 'var(--bark)', whiteSpace: 'nowrap' }}>
                                {step.label}
                              </div>
                            )}
                          </div>
                          {idx < 4 && (
                            <div style={{ height: '2px', background: isComplete ? 'var(--leaf)' : 'var(--mist)', flex: 1 }}></div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--mist)' }}>
                    {nextButtonLabel ? (
                      <Link href={`/farmer/track/${order._id}`} className="btn-primary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                        {nextButtonLabel}
                      </Link>
                    ) : (
                      <div style={{ color: 'var(--leaf)', fontWeight: 600, fontSize: '0.9rem' }}>Completed ✓</div>
                    )}
                    <Link href={`/farmer/track/${order._id}`} className="btn-secondary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', background: 'transparent' }}>
                      View Full Track →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div style={{ textAlign: 'center', marginTop: '1rem', marginBottom: '2rem' }}>
          <Link href="/farmer/orders" style={{ color: 'var(--leaf)', fontSize: '14px', textDecoration: 'none', fontWeight: 600 }}>View all orders →</Link>
        </div>

        <h3 className={styles.sectionTitle}>Recent Activity</h3>
        <ActivityFeed userId={user.id} role={user.role} limit={10} />
        
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes pulse-dot { 0% { box-shadow: 0 0 0 0 rgba(230, 161, 92, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(230, 161, 92, 0); } 100% { box-shadow: 0 0 0 0 rgba(230, 161, 92, 0); } }
          .pulse-anim { animation: pulse-dot 2s infinite; }
        `}} />
      </div>
    </div>
  );
}
