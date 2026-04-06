'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function SkillsHub() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'farmer')) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetch('/api/courses').then(r => r.json()).then(setCourses).catch(() => {});
    }
  }, [user]);

  const handleEnroll = async () => {
    if (!modal) return;
    await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId: modal.id, farmerId: user.id }),
    });
    
    // Optimistic update
    setCourses(courses.map(c => 
      c._id === modal.id ? { ...c, enrollments: [...c.enrollments, user.id] } : c
    ));
    setModal({ ...modal, success: true });
  };

  if (loading || !user) return null;

  const training = courses.filter(c => c.type === 'course');
  const jobs = courses.filter(c => c.type === 'job');

  return (
    <div className="page-container">
      <div className="card" style={{ background: 'var(--soil)', color: 'var(--cream)', marginBottom: '2rem', padding: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--harvest)' }}>Skills & Opportunity Hub</h1>
        <p style={{ fontSize: '1.05rem', opacity: 0.9 }}>Upgrade your farming methods or find off-season employment. Learn, earn, and grow.</p>
      </div>

      <h2 style={{ fontSize: '1.4rem', color: 'var(--soil)', marginBottom: '1.25rem' }}>🎓 Training & Certification</h2>
      <div className="grid-3" style={{ marginBottom: '3rem' }}>
        {training.map(c => {
          const enrolled = c.enrollments.includes(user.id);
          return (
            <div key={c._id} className="card">
              <h3 style={{ fontSize: '1.1rem', color: 'var(--soil)', marginBottom: '1rem', minHeight: '2.5rem' }}>{c.title}</h3>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', background: 'rgba(212, 140, 45, 0.15)', color: 'var(--harvest)', borderRadius: '4px' }}>⏳ {c.duration}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', background: 'rgba(74, 124, 63, 0.15)', color: 'var(--leaf)', borderRadius: '4px' }}>📍 {c.location}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', background: 'var(--mist)', color: 'var(--bark)', borderRadius: '4px' }}>💰 {c.stipend} stip.</span>
              </div>
              <button 
                className={enrolled ? 'btn-secondary' : 'btn-primary'} 
                style={{ width: '100%', opacity: enrolled ? 0.7 : 1 }}
                onClick={() => !enrolled && setModal({ id: c._id, title: c.title, isJob: false })}
                disabled={enrolled}
              >
                {enrolled ? '✓ Enrolled' : 'Enrol Now'}
              </button>
            </div>
          );
        })}
      </div>

      <h2 style={{ fontSize: '1.4rem', color: 'var(--soil)', marginBottom: '1.25rem' }}>💼 Off-Season Jobs</h2>
      <div className="grid-3">
        {jobs.map(j => {
          const enrolled = j.enrollments.includes(user.id);
          return (
            <div key={j._id} className="card">
              <p style={{ fontSize: '0.8rem', color: 'var(--bark)', marginBottom: '0.2rem', fontWeight: 600 }}>{j.company}</p>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--soil)', marginBottom: '1rem' }}>{j.role}</h3>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', background: 'rgba(123, 175, 212, 0.15)', color: 'var(--sky)', borderRadius: '4px' }}>{j.duration}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', background: 'rgba(74, 124, 63, 0.15)', color: 'var(--leaf)', borderRadius: '4px' }}>📍 {j.location}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', background: 'var(--mist)', color: 'var(--bark)', borderRadius: '4px' }}>💰 {j.salary}</span>
              </div>
              <button 
                className={enrolled ? 'btn-secondary' : 'btn-primary'} 
                style={{ width: '100%', opacity: enrolled ? 0.7 : 1 }}
                onClick={() => !enrolled && setModal({ id: j._id, title: `${j.role} at ${j.company}`, isJob: true })}
                disabled={enrolled}
              >
                {enrolled ? '✓ Applied' : 'Apply Now'}
              </button>
            </div>
          );
        })}
      </div>

      {modal && (
        <div className="modal-overlay">
          <div className="modal-content">
            {modal.success ? (
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</p>
                <h2 style={{ fontSize: '1.4rem', color: 'var(--soil)', marginBottom: '0.5rem' }}>Success!</h2>
                <p style={{ color: 'var(--bark)', marginBottom: '2rem' }}>
                  You&apos;ve successfully {modal.isJob ? 'applied for' : 'enrolled in'} <strong>{modal.title}</strong>. 
                  Our team will contact you at <strong>{user.phone}</strong> within 2 working days.
                </p>
                <button className="btn-primary" onClick={() => setModal(null)} style={{ width: '100%' }}>Close</button>
              </div>
            ) : (
              <div>
                <h2 style={{ fontSize: '1.3rem', color: 'var(--soil)', marginBottom: '1rem' }}>Confirm {modal.isJob ? 'Application' : 'Enrollment'}</h2>
                <p style={{ color: 'var(--bark)', marginBottom: '2rem' }}>
                  Are you sure you want to {modal.isJob ? 'apply for' : 'enroll in'} <strong>{modal.title}</strong>? 
                  Make sure your profile phone number is up to date.
                </p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="btn-secondary" onClick={() => setModal(null)} style={{ flex: 1 }}>Cancel</button>
                  <button className="btn-primary" onClick={handleEnroll} style={{ flex: 1 }}>Confirm</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
